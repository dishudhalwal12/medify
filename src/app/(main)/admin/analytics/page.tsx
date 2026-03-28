"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AdminTabs } from "@/components/admin/AdminTabs";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecoveryState } from "@/components/ui/recovery-state";
import { adminService } from "@/services/admin.service";
import { AssessmentRecord, AdminStats } from "@/types";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminService.getDashboardStats(), adminService.getAllAssessments()])
      .then(([nextStats, nextAssessments]) => {
        setStats(nextStats);
        setAssessments(nextAssessments);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load analytics.");
      });
  }, []);

  const chartData = useMemo(
    () =>
      Object.entries(stats?.usageByModule || {}).map(([module, value]) => ({
        module,
        value,
      })),
    [stats]
  );

  if (error) {
    return (
      <RecoveryState
        title="Analytics unavailable"
        description={error}
        actionLabel="Retry analytics"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Admin"
        title="Analytics"
        description="Review module usage, recent result volume, and probability patterns across stored assessments."
      />
      <AdminTabs />

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Module usage</p>
          <div className="mt-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="module" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#17181f" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Recent probability readings</p>
          <div className="mt-5 space-y-3">
            {assessments.length > 0 ? assessments.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-[22px] bg-[#f7f4ef] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold capitalize text-gray-950">{item.assessmentType}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.predictionLabel}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{(item.probability * 100).toFixed(1)}%</p>
                </div>
              </div>
            )) : <EmptyState title="No assessment analytics yet" description="Probability activity will show here once saved assessments exist." />}
          </div>
        </Card>
      </div>
    </div>
  );
}
