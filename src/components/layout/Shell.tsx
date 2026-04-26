"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileStack,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";

import { BrandMark } from "@/components/branding/BrandMark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "Overview, score, and actions" },
  { href: "/profile", label: "Profile", icon: UserRound, hint: "Patient baseline and history" },
  { href: "/assessments", label: "Assessments", icon: Activity, hint: "Symptom-led and structured screening" },
  { href: "/records", label: "Records", icon: FileStack, hint: "Reports, prescriptions, and uploads" },
  { href: "/history", label: "History", icon: HeartPulse, hint: "Risk and result timeline" },
  { href: "/insights", label: "Insights", icon: Sparkles, hint: "Recommendations and explanations" },
  { href: "/settings", label: "Settings", icon: Settings, hint: "Workspace configuration" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navigationItems =
    user?.role === "admin"
      ? [...NAV_ITEMS, { href: "/admin/dashboard", label: "Admin", icon: Shield, hint: "Users, models, and system health" }]
      : NAV_ITEMS;
  const activeItem =
    navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) || null;

  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="glass-header rounded-lg p-5 md:p-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
            <div className="flex items-start gap-4">
              <BrandMark className="h-12 w-12 shrink-0 rounded-lg" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#68779b]">Medify</p>
                <h1 className="mt-2 text-2xl font-semibold text-[#24304d] md:text-3xl">
                  Healthcare screening workspace
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68779b]">
                  One workspace for symptom-led screening, explainable chance review, saved assessments, and linked clinical records.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <Link href="/assessments/symptom-checker">
                  <Button>Symptom explorer</Button>
                </Link>
                {user ? (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-[#253044] dark:bg-[#151c28]">
                    <BrandMark className="h-9 w-9 rounded-md" />
                    <div>
                      <p className="text-sm font-semibold text-[#24304d]">{user.fullName}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#68779b]">{user.role}</p>
                    </div>
                  </div>
                ) : null}
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="order-2 space-y-5 xl:order-1">{children}</main>

          <aside className="order-1 space-y-5 xl:order-2">
            <section className="shell-card rounded-lg p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#68779b]">Navigation</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#24304d]">
                    {activeItem?.label || (pathname === "/dashboard" ? "Dashboard" : pathname.split("/").filter(Boolean).join(" / "))}
                  </h3>
                </div>
                <Sparkles className="h-5 w-5 text-[#52638b]" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {navigationItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-lg border px-4 py-3 text-left shadow-none transition",
                        active
                          ? "border-[#172033] bg-[#172033] text-white"
                          : "border-gray-200 bg-white text-[#52638b] hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md border", active ? "border-white/20 bg-white/10" : "border-gray-200 bg-gray-50")}>
                          <item.icon className={cn("h-4 w-4", active ? "text-white" : "text-[#24304d]")} />
                        </div>
                        <div>
                          <p className="font-semibold text-current">{item.label}</p>
                          <p className="mt-1 text-xs leading-5 text-current/80">{item.hint}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {user ? (
              <section className="bubble-card rounded-lg p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-[#68779b]">Workspace owner</p>
                <h3 className="mt-3 text-xl font-semibold text-[#24304d]">{user.fullName}</h3>
                <p className="mt-2 text-sm leading-6 text-[#68779b]">
                  Keep symptom checks, medical records, and saved results together for the next visit.
                </p>
                <Button variant="outline" className="mt-5 w-full justify-center" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </section>
            ) : null}

            <section className="ink-panel rounded-lg p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">Focus</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Symptom-led triage</h3>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Start with the disease concern, capture symptoms, and carry that context into deeper modules whenever more data is available.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
