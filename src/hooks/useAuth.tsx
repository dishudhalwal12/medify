"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { isOnboardingComplete, mergeProfileWithDefaults } from "@/lib/profile";
import type { RegisterResult } from "@/services/auth.service";
import { getAuthService, getProfileService } from "@/services/loaders";
import { AuthUser, HealthProfile } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  profile: HealthProfile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  needsOnboarding: boolean;
  login: (email: string, password: string, options?: { redirectTo?: string | false }) => Promise<AuthUser>;
  register: (
    email: string,
    password: string,
    fullName: string,
    options?: { redirectTo?: string | false }
  ) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<HealthProfile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isPublicRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/admin/login"
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const needsOnboarding = useMemo(() => {
    if (!user || !profile) {
      return false;
    }

    return !isOnboardingComplete(profile);
  }, [profile, user]);

  const loadProfile = useCallback(
    async (sessionUser: AuthUser, options?: { surfaceError?: boolean }) => {
      const surfaceError = options?.surfaceError ?? false;
      setProfileLoading(true);

      try {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const profileService = await getProfileService();
            const nextProfile = await profileService.ensureProfile(sessionUser.uid, sessionUser.fullName);

            if (nextProfile.fullName && nextProfile.fullName !== sessionUser.fullName) {
              setUser((current) => (current ? { ...current, fullName: nextProfile.fullName } : current));
            }

            setProfile(nextProfile);
            setProfileError(null);
            return nextProfile;
          } catch (error) {
            if (attempt === 0) {
              await wait(300);
              continue;
            }

            const message =
              error instanceof Error ? error.message : "We could not load your health profile right now.";

            setProfile((current) =>
              current || mergeProfileWithDefaults(null, { uid: sessionUser.uid, fullName: sessionUser.fullName })
            );

            if (surfaceError) {
              setProfileError(message);
            } else {
              setProfileError(null);
              console.warn("Profile sync failed during background load", error);
            }

            return null;
          }
        }

        return null;
      } finally {
        setProfileLoading(false);
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return null;
    }

    return loadProfile(user, { surfaceError: true });
  }, [loadProfile, user]);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};
    let fallbackTimer = 0;

    const resolveSession = (sessionUser: AuthUser | null) => {
      if (!mounted) {
        return;
      }

      setUser(sessionUser);
      setLoading(false);

      if (!sessionUser) {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
      }
    };

    fallbackTimer = window.setTimeout(() => {
      resolveSession(null);
    }, 1500);

    try {
      void (async () => {
        try {
          const authService = await getAuthService();

          if (!mounted) {
            return;
          }

          unsubscribe = authService.onSessionChanged((sessionUser) => {
            window.clearTimeout(fallbackTimer);
            resolveSession(sessionUser);
          });
        } catch (error) {
          console.error("Failed to initialize auth session listener", error);
          window.clearTimeout(fallbackTimer);
          resolveSession(null);
        }
      })();
    } catch (error) {
      console.error("Failed to initialize auth session listener", error);
      window.clearTimeout(fallbackTimer);
      resolveSession(null);
    }

    return () => {
      mounted = false;
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadProfile(user, { surfaceError: false });
  }, [loadProfile, user]);

  useEffect(() => {
    if (loading || (user && profileLoading)) {
      return;
    }

    if (!user && !isPublicRoute(pathname)) {
      router.replace("/login");
      return;
    }

    if (!user) {
      return;
    }

    if (pathname === "/admin/login" && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    if (pathname.startsWith("/admin") && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    if (needsOnboarding && pathname !== "/onboarding" && !pathname.startsWith("/admin")) {
      router.replace("/onboarding");
      return;
    }

    if (pathname === "/onboarding" && !needsOnboarding) {
      router.replace("/dashboard");
      return;
    }

    if (isPublicRoute(pathname)) {
      if (pathname === "/register" && profileError) {
        return;
      }

      router.replace(needsOnboarding ? "/onboarding" : "/dashboard");
    }
  }, [loading, needsOnboarding, pathname, profileError, profileLoading, router, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      profileError,
      needsOnboarding,
      login: async (email, password, options) => {
        const authService = await getAuthService();
        const sessionUser = await authService.login(email, password);
        setUser(sessionUser);

        if (options?.redirectTo !== false) {
          router.replace(options?.redirectTo || "/dashboard");
        }

        return sessionUser;
      },
      register: async (email, password, fullName, options) => {
        const authService = await getAuthService();
        const result = await authService.register(email, password, fullName);
        setUser(result.user);

        if (options?.redirectTo !== false && result.bootstrapSucceeded) {
          router.replace(options?.redirectTo || "/onboarding");
        }

        return result;
      },
      logout: async () => {
        const authService = await getAuthService();
        await authService.logout();
        setUser(null);
        setProfile(null);
        setProfileError(null);
        router.push("/login");
      },
      resetPassword: async (email) => {
        const authService = await getAuthService();
        await authService.resetPassword(email);
      },
      refreshProfile,
    }),
    [loading, needsOnboarding, profile, profileError, profileLoading, refreshProfile, router, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
