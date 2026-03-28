import { User } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";

import { createDefaultProfile } from "@/lib/profile";
import { AuthUser, UserDocument } from "@/types";
import {
  loginWithEmail,
  logoutCurrentUser,
  observeAuthSession,
  registerWithEmail,
  sendResetEmail,
} from "@/services/firebase/auth";
import { auth, db } from "@/services/firebase/client";
import { normalizeFirebaseError } from "@/services/firebase/errors";
import { getDocument, upsertDocument } from "@/services/firebase/firestore";

export interface RegisterResult {
  user: AuthUser;
  bootstrapSucceeded: boolean;
  bootstrapError?: string;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class AuthService {
  async login(email: string, password: string): Promise<AuthUser> {
    const user = await loginWithEmail(email, password);

    void upsertDocument("users", user.uid, {
        email: user.email,
        lastLoginAt: serverTimestamp(),
      }).catch((error) => {
        console.warn("Failed to update last login timestamp in Firestore", error);
      });

    return this.resolveUser(user);
  }

  async register(email: string, password: string, fullName: string): Promise<RegisterResult> {
    const user = await registerWithEmail(email, password, fullName);
    const fallbackUser = this.buildFallbackUser(user);
    const bootstrapTask = this.bootstrapUser(user, fullName);
    const bootstrapStatus = bootstrapTask
      .then(() => ({ settled: true as const, ok: true as const }))
      .catch((error) => ({ settled: true as const, ok: false as const, error }));

    try {
      const result = await Promise.race([
        bootstrapStatus,
        wait(700).then(() => ({ settled: false as const })),
      ]);

      if (!result.settled) {
        void bootstrapTask.catch((error) => {
          console.warn("Background Firestore bootstrap did not finish during register", error);
        });

        return {
          user: fallbackUser,
          bootstrapSucceeded: true,
        };
      }

      if (result.ok) {
        return {
          user: fallbackUser,
          bootstrapSucceeded: true,
        };
      }

      return {
        user: fallbackUser,
        bootstrapSucceeded: false,
        bootstrapError:
          result.error instanceof Error
            ? result.error.message
            : "Your account was created, but we could not finish preparing your health workspace.",
      };
    } catch (error) {
      console.warn("Failed to bootstrap Firestore user documents", error);

      return {
        user: fallbackUser,
        bootstrapSucceeded: false,
        bootstrapError:
          error instanceof Error
            ? error.message
            : "Your account was created, but we could not finish preparing your health workspace.",
      };
    }
  }

  async retryBootstrap(fullName: string) {
    if (!auth?.currentUser) {
      throw new Error("We could not verify the current Firebase session. Sign in again and retry.");
    }

    await this.bootstrapUser(auth.currentUser, fullName);
  }

  async logout() {
    await logoutCurrentUser();
  }

  async resetPassword(email: string) {
    await sendResetEmail(email);
  }

  onSessionChanged(callback: (user: AuthUser | null) => void) {
    return observeAuthSession(async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        callback(await this.resolveUser(firebaseUser));
      } catch (error) {
        console.warn("Falling back to auth session because Firestore user resolution failed", error);
        callback(this.buildFallbackUser(firebaseUser));
      }
    });
  }

  async resolveUser(firebaseUser: User): Promise<AuthUser> {
    let doc: UserDocument | null = null;

    try {
      doc = await getDocument<UserDocument>("users", firebaseUser.uid);
    } catch (error) {
      console.warn("Failed to read Firestore user document", error);
      return this.buildFallbackUser(firebaseUser);
    }

    if (!doc) {
      try {
        await this.bootstrapUser(firebaseUser, firebaseUser.displayName || "Symptora User");
        const bootstrapped = await getDocument<UserDocument>("users", firebaseUser.uid);

        if (bootstrapped) {
          return {
            uid: bootstrapped.uid || firebaseUser.uid,
            email: bootstrapped.email || firebaseUser.email || "",
            fullName:
              bootstrapped.fullName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Symptora User",
            role: bootstrapped.role || "user",
          };
        }
      } catch (error) {
        console.warn("Failed to bootstrap missing Firestore user", error);
      }

      return this.buildFallbackUser(firebaseUser);
    }

    return {
      uid: doc.uid || firebaseUser.uid,
      email: doc.email || firebaseUser.email || "",
      fullName: doc.fullName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Symptora User",
      role: doc.role || "user",
    };
  }

  private async bootstrapUser(firebaseUser: User, fullName: string) {
    if (!db || !firebaseUser.email) {
      throw new Error("Firebase is not configured correctly for user bootstrap.");
    }

    const userPayload: Omit<UserDocument, "createdAt" | "lastLoginAt"> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName,
      role: "user",
    };

    const profilePayload = createDefaultProfile(firebaseUser.uid, fullName);

    await Promise.all([
      upsertDocument("users", firebaseUser.uid, {
        ...userPayload,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      }),
      upsertDocument("healthProfiles", firebaseUser.uid, {
        ...profilePayload,
        createdAt: serverTimestamp(),
      }),
    ]);
  }

  private buildFallbackUser(firebaseUser: User): AuthUser {
    if (!firebaseUser.email) {
      throw normalizeFirebaseError(new Error("Authenticated user is missing an email address."));
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName || firebaseUser.email.split("@")[0] || "Symptora User",
      role: "user",
    };
  }
}

export const authService = new AuthService();
