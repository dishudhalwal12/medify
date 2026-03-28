"use client";

import { useState } from "react";
import { Bell, LogOut, Shield, Sparkles } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, logout, resetPassword } = useAuth();
  const [emailForReset, setEmailForReset] = useState(user?.email || "");
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div>
      <PageIntro
        eyebrow="Settings"
        title="Account and product access"
        description="Manage password reset, session sign-out, and connected product access from one place."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="shell-card border-0 p-6">
          <div className="flex items-start gap-3">
            <Shield className="mt-1 h-5 w-5 text-gray-950" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Account</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">Security actions</h3>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">Reset password email</Label>
              <Input value={emailForReset} onChange={(event) => setEmailForReset(event.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={async () => {
                  await resetPassword(emailForReset);
                  setStatus("Password reset email sent.");
                }}
              >
                Send reset email
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
            {status ? <p className="text-sm text-gray-600">{status}</p> : null}
          </div>
        </Card>

        <Card className="shell-card border-0 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-gray-950" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Connections</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">Product services</h3>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm leading-7 text-gray-600">
            <div className="rounded-[22px] bg-[#f7f4ef] p-4">
              Account access, saved records, and workspace data stay connected across the product.
            </div>
            <div className="rounded-[22px] bg-[#f7f4ef] p-4">
              Clinical scoring modules use the connected assessment service to generate risk and likelihood outputs.
            </div>
            <div className="rounded-[22px] bg-[#f7f4ef] p-4">
              Explanation and summary tools support the product experience without replacing the primary assessment outputs.
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card className="shell-card border-0 p-6">
          <div className="flex items-start gap-3">
            <Bell className="mt-1 h-5 w-5 text-gray-950" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Product note</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">Preference persistence</h3>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
            Notification and preference controls can expand here over time. For now, this page stays focused on account actions and connected access.
          </p>
        </Card>
      </div>
    </div>
  );
}
