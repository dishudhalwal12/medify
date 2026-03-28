"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileStack,
  HeartPulse,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecoveryState } from "@/components/ui/recovery-state";
import { StatusPill } from "@/components/ui/status-pill";
import { useAuth } from "@/hooks/useAuth";
import { buildInsightSummary } from "@/lib/scoring";
import { getAssessmentService, getInsightsService, getRecordsService } from "@/services/loaders";
import { AssessmentRecord, InsightSummary, RiskLevel, UploadRecord } from "@/types";

function mapBandToLevel(riskBand: InsightSummary["riskBand"]): RiskLevel {
  if (riskBand === "Stable") return "Low";
  if (riskBand === "Monitor") return "Moderate";
  return "High";
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [insight, setInsight] = useState<InsightSummary | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [welcomeFlow, setWelcomeFlow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setWelcomeFlow(params.get("welcome") === "1");
  }, []);

  useEffect(() => {
    if (!user || !profile) {
      return;
    }

    const currentUser = user;
    const currentProfile = profile;
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setDashboardError(null);

      try {
        const [assessmentService, recordsService, insightsService] = await Promise.all([
          getAssessmentService(),
          getRecordsService(),
          getInsightsService(),
        ]);
        const [history, uploadRecords] = await Promise.all([
          assessmentService.getHistory(currentUser.uid),
          recordsService.getRecords(currentUser.uid),
        ]);

        if (cancelled) {
          return;
        }

        let summary = buildInsightSummary(currentUser.uid, currentProfile, history);

        try {
          summary =
            (await insightsService.getInsight(currentUser.uid)) ||
            (history.length > 0 ? await insightsService.buildAndStore(currentUser.uid, history) : summary);
        } catch (error) {
          console.warn("Falling back to computed dashboard insight summary", error);
        }

        if (cancelled) {
          return;
        }

        setAssessments(history);
        setRecords(uploadRecords);
        setInsight(summary);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setDashboardError(
          error instanceof Error ? error.message : "We could not load your saved dashboard data right now."
        );
        setInsight(buildInsightSummary(currentUser.uid, currentProfile, []));
        setAssessments([]);
        setRecords([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  const chartData = useMemo(
    () =>
      insight?.trend.map((item) => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        score: item.overallHealthScore,
      })) || [],
    [insight]
  );

  if (loading) {
    return <div className="h-[520px] animate-pulse rounded-[32px] bg-white/70" />;
  }

  if (!user || !profile || !insight) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Dashboard unavailable"
        description="We could not assemble your dashboard right now. Refresh the page and try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  const firstName = (profile.fullName || user.fullName)?.split(" ")[0] || "there";
  const latestAssessment = assessments[0] || null;

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="ink-panel rounded-[40px] rounded-br-[88px] p-6 md:p-7">
          <p className="medify-pill bg-white/14 text-white">Symptora overview</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-4xl font-semibold text-white md:text-5xl">Welcome back, {firstName}</h2>
                <StatusPill level={mapBandToLevel(insight.riskBand)} label={insight.riskBand} />
              </div>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Monitor symptom screening, profile completeness, saved assessments, and record activity from one place.
              </p>

              {welcomeFlow ? (
                <div className="mt-5 rounded-[24px] bg-white/12 px-4 py-4 text-sm text-white backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Onboarding complete. Your Symptora workspace and the symptom-led flow are ready.
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <HeroMetric label="Overall score" value={String(insight.overallHealthScore)} helper={insight.riskBand} />
              <HeroMetric
                label="Profile completeness"
                value={`${insight.profileCompleteness}%`}
                helper={`Lifestyle ${insight.lifestyleScore}`}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <TopStat label="Assessments saved" value={String(assessments.length)} />
            <TopStat label="Records uploaded" value={String(records.length)} />
            <TopStat label="Trend points" value={String(chartData.length)} />
          </div>
        </div>

        <div className="grid gap-5">
          <section className="shell-card rounded-[34px] rounded-tr-[72px] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Fastest entry point</p>
            <h3 className="mt-3 text-3xl font-semibold text-[#24304d]">Launch the symptom explorer first</h3>
            <p className="mt-3 text-sm leading-7 text-[#52638b]">
              Start from the suspected disease, then capture symptoms and review the estimated chance before moving into deeper assessments.
            </p>
            <div className="mt-5 grid gap-3">
              {[
                { href: "/assessments/symptom-checker", label: "Open symptom explorer", icon: Sparkles },
                { href: "/assessments/diabetes", label: "Run diabetes assessment", icon: Activity },
                { href: "/records", label: "Upload a medical record", icon: UploadCloud },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[24px] px-4 py-4 transition ${
                    index === 0 ? "bubble-card rounded-tr-[58px]" : index === 1 ? "mesh-panel rounded-bl-[58px]" : "clay-card rounded-tr-[42px]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-3 text-sm font-semibold text-[#24304d]">
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#24304d]" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="bubble-card rounded-[34px] rounded-bl-[72px] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Latest result</p>
            {latestAssessment ? (
              <div className="mt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold text-[#24304d]">{latestAssessment.predictionLabel}</p>
                    <p className="mt-2 text-sm capitalize leading-7 text-[#52638b]">
                      {latestAssessment.assessmentType} assessment
                    </p>
                  </div>
                  <StatusPill level={latestAssessment.riskLevel} />
                </div>
                <p className="mt-4 text-sm leading-7 text-[#52638b]">{latestAssessment.recommendation}</p>
                <Link
                  href={`/history/${latestAssessment.id}`}
                  className={`mt-5 inline-flex ${buttonStyles({ variant: "outline" })}`}
                >
                  Open full report
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-2xl font-semibold text-[#24304d]">No assessment runs yet</p>
                <p className="mt-3 text-sm leading-7 text-[#52638b]">
                  Start with the symptom explorer to guide the case, then move into diabetes, heart, kidney, or liver modules when values are available.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>

      {dashboardError ? (
        <RecoveryState
          title="Some dashboard data could not be loaded"
          description={dashboardError}
          actionLabel="Reload dashboard"
          onAction={() => window.location.reload()}
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#68779b]">Trend meter</p>
              <h3 className="mt-2 text-3xl font-semibold text-[#24304d]">Overall score movement</h3>
            </div>
            <Link href="/insights" className="text-sm font-semibold text-[#24304d] underline decoration-2 underline-offset-4">
              Open insights
            </Link>
          </div>

          <div className="mt-6 rounded-[30px] rounded-tr-[66px] bg-[linear-gradient(155deg,rgba(255,250,232,0.82),rgba(255,255,255,0.64))] px-3 py-4">
            <div className="h-[280px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6a84de" stopOpacity={0.48} />
                        <stop offset="95%" stopColor="#6a84de" stopOpacity={0.06} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#3650b1" strokeWidth={3} fill="url(#scoreGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-xl font-semibold text-[#24304d]">No trend data yet</p>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[#52638b]">
                    Start with the symptom explorer or your first structured assessment and this chart will start moving.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid gap-5">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#68779b]">Recent uploads</p>
            <div className="mt-4 space-y-3">
              {records.slice(0, 3).map((record, index) => (
                <Link
                  key={record.id}
                  href={`/records/${record.id}`}
                  className={`block rounded-[24px] px-4 py-4 transition ${
                    index % 2 === 0 ? "bubble-card rounded-tr-[56px]" : "mesh-panel rounded-bl-[56px]"
                  }`}
                >
                  <p className="font-semibold text-[#24304d]">{record.fileName}</p>
                  <p className="mt-2 text-sm text-[#52638b]">
                    {record.category.replace("-", " ")} · {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
              {records.length === 0 ? (
                <div className="clay-card rounded-[24px] rounded-tr-[56px] px-4 py-4">
                  <p className="font-semibold text-[#24304d]">No records uploaded yet</p>
                  <p className="mt-2 text-sm leading-7 text-[#52638b]">
                    Upload a report, prescription, or scan so future screening can link back to source material.
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          <div className="accent-panel rounded-[34px] rounded-bl-[72px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#68779b]">Recommendations</p>
            <div className="mt-4 space-y-3">
              {insight.recommendations.map((item, index) => (
                <div key={item} className={`rounded-[22px] px-4 py-4 text-sm leading-7 text-[#24304d] ${index % 2 === 0 ? "bg-white/72" : "bg-white/54"}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="mesh-panel rounded-[36px] rounded-tr-[74px] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-5 w-5 text-[#52638b]" />
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Case progression</p>
              <h3 className="text-3xl font-semibold text-[#24304d]">Suggested next actions</h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {assessments.length === 0 ? (
              <>
                <ActionRow
                  title="Start with the symptom explorer"
                  description="Use the disease-first flow to collect patient-reported symptoms and estimate the likely chance."
                  href="/assessments/symptom-checker"
                  tone="bubble-card rounded-tr-[56px]"
                />
                <ActionRow
                  title="Upload a medical record"
                  description="Add reports or prescriptions now so later assessments can connect back to source material."
                  href="/records"
                  tone="clay-card rounded-bl-[56px]"
                />
              </>
            ) : (
              <>
                <ActionRow
                  title="Review assessment history"
                  description="Compare changes in risk, probability, and overall score over time."
                  href="/history"
                  tone="bubble-card rounded-tr-[56px]"
                />
                <ActionRow
                  title="Refresh the patient profile"
                  description="Update medications, allergies, and baseline details when something changes."
                  href="/profile"
                  tone="mesh-panel rounded-bl-[56px]"
                />
              </>
            )}
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#68779b]">Clinical reminder</p>
              <h3 className="mt-2 text-3xl font-semibold text-[#24304d]">Use the likelihood as an early screening aid</h3>
            </div>
            <FileStack className="h-5 w-5 text-[#24304d]" />
          </div>

          <div className="mt-6 rounded-[28px] rounded-tr-[68px] bg-[linear-gradient(155deg,rgba(255,248,228,0.82),rgba(255,255,255,0.7))] px-5 py-5">
            <p className="text-sm leading-7 text-[#52638b]">
              Symptom likelihood is not a diagnosis. Use it to guide the next assessment, clinical question, or record review.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/12 px-4 py-4 text-white backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-white/60">{label}</p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-white/72">{helper}</p>
    </div>
  );
}

function TopStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/10 px-4 py-4 text-white backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.18em] text-white/58">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function ActionRow({
  title,
  description,
  href,
  tone,
}: {
  title: string;
  description: string;
  href: string;
  tone: string;
}) {
  return (
    <Link href={href} className={`block px-4 py-4 transition ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-[#24304d]">{title}</p>
          <p className="mt-2 text-sm leading-7 text-[#52638b]">{description}</p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 text-[#24304d]" />
      </div>
    </Link>
  );
}
