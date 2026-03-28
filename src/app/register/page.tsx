"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, HeartPulse, LoaderCircle } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterStage =
  | "idle"
  | "creating_auth"
  | "bootstrapping"
  | "success"
  | "bootstrap_error";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<RegisterStage>("idle");
  const [error, setError] = useState<string | null>(null);

  const loading = stage === "creating_auth" || stage === "bootstrapping" || stage === "success";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStage("creating_auth");
    setError(null);

    try {
      const result = await register(email, password, fullName, { redirectTo: false });
      setStage("bootstrapping");

      if (!result.bootstrapSucceeded) {
        setStage("bootstrap_error");
        setError(result.bootstrapError || "Your account was created, but the workspace profile setup needs another try.");
        return;
      }

      setStage("success");
      window.setTimeout(() => {
        router.replace("/onboarding?welcome=1");
      }, 450);
    } catch (err) {
      setStage("idle");
      setError(err instanceof Error ? err.message : "Unable to create account.");
    }
  }

  async function handleRetryBootstrap() {
    setStage("bootstrapping");
    setError(null);

    try {
      await authService.retryBootstrap(fullName.trim() || "Symptora User");
      setStage("success");
      router.replace("/onboarding?welcome=1");
    } catch (err) {
      setStage("bootstrap_error");
      setError(err instanceof Error ? err.message : "We still could not prepare your workspace profile.");
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="glass-header rounded-[38px] rounded-br-[78px] p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-3 text-[#24304d]">
              <div className="medify-orb flex h-12 w-12 items-center justify-center rounded-[18px]">
                <HeartPulse className="h-5 w-5 text-[#24304d]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#68779b]">Symptora</p>
                <p className="text-base font-semibold">Create your account</p>
              </div>
            </Link>

            <div className="bubble-card rounded-[28px] rounded-tr-[56px] px-4 py-3">
              <p className="text-sm leading-7 text-[#52638b]">
                Account setup leads into onboarding so the baseline health profile is ready before the dashboard opens.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="order-2 overflow-hidden p-1 xl:order-1">
            <CardHeader className="px-6 pt-8 md:px-8">
              <CardTitle className="text-4xl">Open the Symptora workspace</CardTitle>
              <CardDescription className="text-base text-[#52638b]">
                Create the account first, then continue into onboarding so the baseline health data is ready before the dashboard opens.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-8 md:px-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Aarav Sharma" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Choose a secure password"
                    minLength={6}
                    required
                  />
                </div>

                <div className="mesh-panel rounded-[28px] rounded-bl-[60px] px-4 py-4 text-sm text-[#24304d]">
                  <p className="font-semibold uppercase tracking-[0.18em] text-[#68779b]">Current step</p>
                  <p className="mt-2 leading-7 text-[#52638b]">
                    {stage === "creating_auth"
                      ? "Creating your account..."
                      : stage === "bootstrapping"
                        ? "Preparing your workspace profile and baseline details..."
                        : stage === "success"
                          ? "Account created. Opening onboarding..."
                          : stage === "bootstrap_error"
                            ? "Your account exists, but the workspace profile setup needs attention before onboarding is fully reliable."
                            : "Create the account, then continue into guided onboarding."}
                  </p>
                </div>

                {error ? (
                  <div className="rounded-[24px] bg-[linear-gradient(155deg,rgba(255,218,218,0.95),rgba(255,236,236,0.9))] px-4 py-4 text-sm text-[#7a2330]">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <p>{error}</p>
                        {stage === "bootstrap_error" ? (
                          <div className="mt-4 flex flex-wrap gap-3">
                            <Button type="button" variant="outline" onClick={handleRetryBootstrap}>
                              Retry workspace setup
                            </Button>
                            <Button type="button" onClick={() => router.replace("/onboarding?bootstrap=retry")}>
                              Continue to onboarding
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {stage === "success" ? (
                  <div className="rounded-[24px] bg-[linear-gradient(155deg,rgba(223,247,223,0.94),rgba(245,255,245,0.92))] px-4 py-4 text-sm text-[#24304d]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Account created. Taking you into onboarding now.
                    </div>
                  </div>
                ) : null}

                <Button type="submit" className="w-full" disabled={loading}>
                  {stage === "creating_auth" || stage === "bootstrapping" ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      {stage === "creating_auth" ? "Creating account..." : "Preparing workspace..."}
                    </>
                  ) : stage === "success" ? (
                    "Opening onboarding..."
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <p className="mt-6 text-sm text-[#52638b]">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[#24304d] underline decoration-2 underline-offset-4">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>

          <div className="order-1 grid gap-5 xl:order-2">
            <section className="accent-panel rounded-[38px] rounded-tr-[82px] p-6 md:p-8">
              <p className="medify-pill">First-run flow</p>
              <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#24304d] md:text-6xl">
                Create the account, finish the baseline, then enter the workspace.
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-8 text-[#52638b]">
                Onboarding captures the baseline health profile first so symptom screening and later assessments open with more context.
              </p>
            </section>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <section className="bubble-card rounded-[34px] rounded-tr-[70px] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Step 1</p>
                <p className="mt-3 text-2xl font-semibold text-[#24304d]">Create the account</p>
                <p className="mt-3 text-sm leading-7 text-[#52638b]">
                  Your account is created first, then Symptora prepares the matching workspace profile.
                </p>
              </section>

              <section className="clay-card rounded-[34px] rounded-bl-[70px] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Step 2</p>
                <p className="mt-3 text-2xl font-semibold text-[#24304d]">Complete onboarding</p>
                <p className="mt-3 text-sm leading-7 text-[#52638b]">
                  Save baseline health details step by step before the dashboard takes over.
                </p>
              </section>
            </div>

            <section className="ink-panel rounded-[36px] rounded-br-[74px] p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">What opens next</p>
              <p className="mt-4 text-3xl font-semibold text-white">Symptom checks, records, and saved assessments.</p>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Once onboarding is complete, the workspace is ready for disease-first screening and deeper modules.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
