"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ActivitySquare, Sparkles } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { useAuth } from "@/hooks/useAuth";
import { buildInsightSummary } from "@/lib/scoring";
import { getAssessmentService, getInsightsService } from "@/services/loaders";
import { AssessmentRecord, InsightSummary } from "@/types";

export default function InsightsPage() {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [history, setHistory] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;
    const userId = user.uid;
    const currentProfile = profile;

    let cancelled = false;

    async function loadInsights() {
      try {
        const [assessmentService, insightsService] = await Promise.all([
          getAssessmentService(),
          getInsightsService(),
        ]);
        const records = await assessmentService.getHistory(userId);
        let insight = buildInsightSummary(userId, currentProfile, records);

        try {
          insight =
            (await insightsService.getInsight(userId)) ||
            (records.length > 0 ? await insightsService.buildAndStore(userId, records) : insight);
        } catch (error) {
          console.warn("Falling back to computed insights summary", error);
        }

        if (cancelled) return;

        setHistory(records);
        setSummary(insight);
      } catch (error) {
        console.error("Failed to load insights", error);
        if (cancelled) return;
        setHistory([]);
        setSummary(buildInsightSummary(userId, currentProfile, []));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInsights();

    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  const trend = useMemo(
    () =>
      summary?.trend.map((point) => ({
        date: new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        probability: point.probability,
        score: point.overallHealthScore,
      })) || [],
    [summary]
  );

  if (loading) {
    return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;
  }

  if (!summary) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Insights unavailable"
        description="Run and save assessments to generate your insights summary."
      />
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Insights"
        title="Understand what changed across your saved assessments"
        description="These insights combine profile completeness, lifestyle scoring, and recent assessment probabilities to show movement over time."
      />

      <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="ink-panel border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-white/55">Overall summary</p>
          <div className="mt-5 flex flex-wrap items-end gap-5">
            <div>
              <p className="text-6xl font-semibold text-white">{summary.overallHealthScore}</p>
              <p className="mt-3 text-sm text-white/72">Overall health score</p>
            </div>
            <div className="pb-2">
              <StatusPill
                level={summary.riskBand === "Stable" ? "Low" : summary.riskBand === "Monitor" ? "Moderate" : "High"}
                label={summary.riskBand}
                className="bg-white/10 text-white"
              />
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Lifestyle score</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary.lifestyleScore}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Profile completeness</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary.profileCompleteness}%</p>
            </div>
          </div>
        </Card>

        <Card className="shell-card border-0 p-6">
          <div className="flex items-start gap-3">
            <ActivitySquare className="mt-1 h-5 w-5 text-gray-950" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Recommendations</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">What changed recently</h3>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {summary.recommendations.map((recommendation) => (
              <div key={recommendation} className="rounded-[22px] bg-[#f7f4ef] p-4 text-sm leading-7 text-gray-600">
                {recommendation}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Trend chart</p>
          <h3 className="mt-2 text-2xl font-semibold text-gray-950">Probability trend</h3>
          <div className="mt-6 h-[280px]">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="insightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#53b6ff" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#53b6ff" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="probability" stroke="#17181f" strokeWidth={2} fill="url(#insightGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[24px] bg-[#f7f4ef] text-sm text-gray-500">
                Save assessments to generate trend movement.
              </div>
            )}
          </div>
        </Card>

        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Recent modules</p>
          <div className="mt-5 space-y-3">
            {history.slice(0, 5).map((record) => (
              <div key={record.id} className="rounded-[22px] bg-[#f7f4ef] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold capitalize text-gray-950">{record.assessmentType}</p>
                    <p className="mt-1 text-sm text-gray-500">{record.predictionLabel}</p>
                  </div>
                  <StatusPill level={record.riskLevel} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
