"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password, { redirectTo: false });
      if (user.role !== "admin") {
        setError("This account is authenticated, but it does not have admin access.");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="shell-card border-0 bg-white">
          <CardHeader className="px-6 pt-8 md:px-8">
            <Link href="/" className="mb-4 flex items-center gap-3 text-gray-950">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17181f] text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Symptora</p>
                <p className="text-base font-semibold">Admin access</p>
              </div>
            </Link>
            <CardTitle className="text-3xl">Open the control room</CardTitle>
            <CardDescription className="text-base">
              Sign in with your Symptora account and continue if admin access is enabled.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8 md:px-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Admin email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                </div>
              ) : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Enter admin workspace"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="ink-panel flex min-h-[520px] flex-col justify-between p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Operations</p>
            <h1 className="mt-6 max-w-lg text-5xl font-semibold uppercase leading-[0.96] tracking-[-0.04em] text-white">
              Review users, models, uploads, and system health.
            </h1>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/72">
            Admin access is restricted to approved control-room users. Any non-admin account returns to the standard product workspace.
          </div>
        </section>
      </div>
    </div>
  );
}
