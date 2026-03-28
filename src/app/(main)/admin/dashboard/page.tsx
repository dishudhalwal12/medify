"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminTabs } from "@/components/admin/AdminTabs";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecoveryState } from "@/components/ui/recovery-state";
import { StatusPill } from "@/components/ui/status-pill";
import { adminService } from "@/services/admin.service";
import { AdminStats } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getDashboardStats().then(setStats).catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load admin dashboard.");
    });
  }, []);

  if (error) {
    return (
      <RecoveryState
        title="Admin dashboard unavailable"
        description={error}
        actionLabel="Retry admin dashboard"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!stats) {
    return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;
  }

  return (
    <div>
      <PageIntro
        eyebrow="Admin"
        title="Symptora control room"
        description="Monitor users, model usage, uploads, and integration health from one operational dashboard."
      />

      <AdminTabs />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Users" value={String(stats.totalUsers)} />
        <MetricCard label="Assessments" value={String(stats.totalAssessments)} />
        <MetricCard label="Uploads" value={String(stats.totalUploads)} />
        <MetricCard label="Stored file volume" value={`${stats.storageUsageMb} MB`} helper="Calculated from the saved upload metadata for files currently tracked in Firebase." />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <Card className="ink-panel border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-white/55">Integration health</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <HealthCard label="Firebase" value={stats.health.firebase} />
            <HealthCard label="ML API" value={stats.health.mlApi} />
            <HealthCard label="Gemini" value={stats.health.gemini} />
          </div>
        </Card>

        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Module usage</p>
          <div className="mt-5 space-y-3">
            {Object.entries(stats.usageByModule).map(([module, count]) => (
              <div key={module} className="rounded-[22px] bg-[#f7f4ef] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold capitalize text-gray-950">{module}</p>
                  <p className="text-sm text-gray-600">{count} runs</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <Card className="shell-card border-0 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Recent users</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">New signups</h3>
            </div>
            <Link href="/admin/users" className="text-sm font-semibold text-gray-700">
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {stats.recentUsers.length > 0 ? stats.recentUsers.map((item) => (
              <Link key={item.uid} href={`/admin/users/${item.uid}`} className="block rounded-[22px] bg-[#f7f4ef] p-4 hover:bg-white">
                <p className="font-semibold text-gray-950">{item.fullName}</p>
                <p className="mt-1 text-sm text-gray-500">{item.email}</p>
              </Link>
            )) : <EmptyState title="No users yet" description="Recent signups will appear here once Firestore has user documents to show." />}
          </div>
        </Card>

        <Card className="shell-card border-0 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Recent predictions</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">Latest saved results</h3>
            </div>
            <Link href="/admin/analytics" className="text-sm font-semibold text-gray-700">
              Analytics
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {stats.recentAssessments.length > 0 ? stats.recentAssessments.map((item) => (
              <div key={item.id} className="rounded-[22px] bg-[#f7f4ef] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold capitalize text-gray-950">{item.assessmentType}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.predictionLabel}</p>
                  </div>
                  <StatusPill level={item.riskLevel} />
                </div>
              </div>
            )) : <EmptyState title="No saved results yet" description="Assessment activity will appear here after users start running modules." />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <Card className="shell-card border-0 p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-gray-400">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-gray-950">{value}</p>
      {helper ? <p className="mt-2 text-sm leading-6 text-gray-500">{helper}</p> : null}
    </Card>
  );
}

function HealthCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/55">{label}</p>
      <p className="mt-3 text-2xl font-semibold capitalize text-white">{value.replace("_", " ")}</p>
    </div>
  );
}
