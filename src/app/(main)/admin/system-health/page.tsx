"use client";

import { useEffect, useState } from "react";

import { AdminTabs } from "@/components/admin/AdminTabs";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";
import { RecoveryState } from "@/components/ui/recovery-state";
import { adminService } from "@/services/admin.service";
import { AdminStats } from "@/types";

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<AdminStats["health"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getSystemHealth().then(setHealth).catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load system health.");
    });
  }, []);

  if (error) {
    return (
      <RecoveryState
        title="System health unavailable"
        description={error}
        actionLabel="Retry health checks"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Admin"
        title="System health"
        description="Live operational view of the Firebase layer, the ML API, and the Gemini assistive service. States reflect active reachability checks, not synthetic uptime percentages."
      />
      <AdminTabs />

      <div className="grid gap-4 md:grid-cols-3">
        <HealthCard label="Firebase" value={health?.firebase || "offline"} />
        <HealthCard label="ML API" value={health?.mlApi || "offline"} />
        <HealthCard label="Gemini" value={health?.gemini || "offline"} />
      </div>
    </div>
  );
}

function HealthCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shell-card border-0 p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-gray-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold capitalize text-gray-950">{value.replace("_", " ")}</p>
    </Card>
  );
}
