"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartPulse, MailCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="shell-card w-full max-w-xl border-0 bg-white">
        <CardHeader className="px-6 pt-8 md:px-8">
          <Link href="/" className="mb-4 flex items-center gap-3 text-gray-950">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17181f] text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Symptora</p>
              <p className="text-base font-semibold">Reset password</p>
            </div>
          </Link>
          <CardTitle className="text-3xl">Recover your access</CardTitle>
          <CardDescription className="text-base">
            Send a password reset email to recover access to your Symptora account.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 md:px-8">
          {sent ? (
            <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6">
              <MailCheck className="h-10 w-10 text-emerald-700" />
              <h2 className="mt-4 text-2xl font-semibold text-gray-950">Reset email sent</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                If an account exists for <span className="font-semibold text-gray-950">{email}</span>, Symptora has sent a password reset link. Return to sign in after updating your password.
              </p>
              <Link href="/login" className="mt-5 inline-flex text-sm font-semibold text-gray-950">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Account email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending reset email..." : "Send password reset"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
