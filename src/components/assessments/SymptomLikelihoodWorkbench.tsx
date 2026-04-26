"use client";

import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, ClipboardCopy, Download, FileText, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DISEASE_PROFILES,
  DiseaseSlug,
  SymptomDuration,
  SymptomSeverity,
  getDiseaseProfile,
  inferSymptomLikelihood,
} from "@/lib/symptom-checker";
import { cn } from "@/lib/utils";

const DISEASE_CARD_TONES = [
  "clay-card rounded-[28px] rounded-tr-[54px]",
  "mesh-panel rounded-[28px] rounded-bl-[54px]",
  "bubble-card rounded-[28px] rounded-tr-[42px]",
];

export function SymptomLikelihoodWorkbench({
  initialDiseaseId = "diabetes",
}: {
  initialDiseaseId?: DiseaseSlug;
}) {
  const [diseaseId, setDiseaseId] = useState<DiseaseSlug>(initialDiseaseId);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState<SymptomSeverity>("mild");
  const [duration, setDuration] = useState<SymptomDuration>("today");
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [summaryCopied, setSummaryCopied] = useState(false);

  const activeDisease = getDiseaseProfile(diseaseId);
  const result = inferSymptomLikelihood({ diseaseId, selectedSymptoms, notes, severity, duration });
  const visibleDiseases = DISEASE_PROFILES.filter((profile) => {
    const query = diseaseSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [profile.name, profile.tagline, profile.description, profile.highlight]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  function handleDiseaseChange(nextDiseaseId: DiseaseSlug, keepNotes = false) {
    setDiseaseId(nextDiseaseId);
    setSelectedSymptoms([]);
    if (!keepNotes) {
      setNotes("");
    }
    setSummaryCopied(false);
  }

  function toggleSymptom(symptomId: string) {
    setSelectedSymptoms((current) =>
      current.includes(symptomId)
        ? current.filter((item) => item !== symptomId)
        : [...current, symptomId]
    );
  }

  function resetSelection() {
    setSelectedSymptoms([]);
    setNotes("");
    setSeverity("mild");
    setDuration("today");
    setSummaryCopied(false);
  }

  async function copyVisitSummary() {
    await navigator.clipboard.writeText(result.visitSummary);
    setSummaryCopied(true);
    window.setTimeout(() => setSummaryCopied(false), 1800);
  }

  function downloadVisitSummary() {
    const blob = new Blob([result.visitSummary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeDisease.id}-visit-summary.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[280px_minmax(0,1fr)_360px]">
      <aside className="shell-card rounded-lg p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="medify-pill">Disease selection</p>
            <h3 className="mt-4 text-2xl font-semibold leading-tight text-[#24304d]">
              Start from the patient concern
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#68779b]">
              Pick the disease concern first, then capture the symptoms the patient is reporting.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetSelection}>
            Reset case
          </Button>
        </div>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68779b]" />
          <Input
            className="h-11 rounded-md border-gray-200 bg-white pl-9 shadow-none"
            placeholder="Search condition..."
            value={diseaseSearch}
            onChange={(event) => setDiseaseSearch(event.target.value)}
          />
        </div>

        <div className="mt-4 max-h-[720px] space-y-3 overflow-y-auto pr-1">
          {visibleDiseases.map((profile, index) => {
            const active = profile.id === diseaseId;

            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleDiseaseChange(profile.id)}
                className={cn(
                  "w-full p-4 text-left transition",
                  active
                    ? "ink-panel rounded-lg text-white"
                    : `${DISEASE_CARD_TONES[index % DISEASE_CARD_TONES.length]} rounded-lg`
                )}
              >
                <p className={cn("text-xs font-semibold uppercase tracking-[0.24em]", active ? "text-white/65" : "text-[#68779b]")}>
                  {profile.tagline}
                </p>
                <p className={cn("mt-3 text-2xl font-semibold", active ? "text-white" : "text-[#24304d]")}>
                  {profile.name}
                </p>
                <p className={cn("mt-3 text-sm leading-7", active ? "text-white/78" : "text-[#52638b]")}>
                  {profile.description}
                </p>
              </button>
            );
          })}

          {visibleDiseases.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-[#52638b]">
              No condition matched that search.
            </div>
          ) : null}
        </div>
      </aside>

      <section className="space-y-5">
        <div className="mesh-panel rounded-lg p-5 md:p-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_auto]">
            <div>
              <p className="medify-pill bg-white/76">Symptom board</p>
              <h4 className="mt-4 text-2xl font-semibold text-[#24304d]">{activeDisease.name}</h4>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#52638b]">{activeDisease.highlight}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <QuickSignal label="Symptoms selected" value={String(selectedSymptoms.length)} />
              <QuickSignal label="Notes matched" value={String(result.noteMatches.length)} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {activeDisease.symptoms.map((symptom) => {
              const active = selectedSymptoms.includes(symptom.id);

              return (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => toggleSymptom(symptom.id)}
                  className={cn(
                    "rounded-md border px-4 py-3 text-sm font-medium shadow-none transition",
                    active
                      ? "border-[#172033] bg-[#172033] text-white"
                      : "border-gray-200 bg-white text-[#24304d] hover:bg-gray-50"
                  )}
                >
                  {symptom.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.94fr_1.06fr]">
          <div className="clay-card rounded-lg p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="medify-orb flex h-12 w-12 items-center justify-center rounded-[18px]">
                <FileText className="h-5 w-5 text-[#24304d]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Patient notes</p>
                <h4 className="text-xl font-semibold text-[#24304d]">Add patient notes</h4>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#52638b]">
              Free-text notes help Medify match wording like chest pressure, fatigue, or appetite loss when estimating the chance.
            </p>
            <Textarea
              className="mt-4"
              placeholder="Example: chest pressure since yesterday, gets tired while climbing stairs, sometimes feels the heartbeat racing..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="shell-card rounded-lg p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="medify-orb flex h-12 w-12 items-center justify-center rounded-[18px]">
                <Activity className="h-5 w-5 text-[#24304d]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Signal summary</p>
                <h4 className="text-xl font-semibold text-[#24304d]">What the case shows</h4>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SummaryTile label="Likelihood band" value={result.band} />
              <SummaryTile label="Care timing" value={result.urgencyLabel} />
              <SummaryTile label="Confidence" value={result.confidenceLabel} />
              <SummaryTile label="Matched indicators" value={String(result.matchedSymptoms.length)} />
              <SummaryTile
                label="Questions still open"
                value={result.missingSignals.length > 0 ? String(result.missingSignals.length) : "0"}
              />
            </div>
          </div>
        </div>

        <div className="shell-card rounded-lg p-5 md:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <SegmentedControl
              label="Severity"
              value={severity}
              options={[
                { value: "mild", label: "Mild" },
                { value: "moderate", label: "Moderate" },
                { value: "severe", label: "Severe" },
              ]}
              onChange={(value) => setSeverity(value as SymptomSeverity)}
            />
            <SegmentedControl
              label="Duration"
              value={duration}
              options={[
                { value: "today", label: "Today" },
                { value: "few-days", label: "Few days" },
                { value: "week-plus", label: "Week+" },
                { value: "recurrent", label: "Recurring" },
              ]}
              onChange={(value) => setDuration(value as SymptomDuration)}
            />
          </div>
        </div>

        <div className="bubble-card rounded-lg p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#68779b]">Alternative matches</p>
              <h4 className="mt-2 text-xl font-semibold text-[#24304d]">Other conditions worth checking</h4>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {result.alternativeMatches.length > 0 ? (
              result.alternativeMatches.map((match) => (
                <button
                  key={match.disease.id}
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:bg-gray-50"
                  onClick={() => handleDiseaseChange(match.disease.id, true)}
                >
                  <p className="text-sm font-semibold text-[#24304d]">{match.disease.name}</p>
                  <p className="mt-2 text-xs leading-5 text-[#68779b]">
                    {match.probability}% match from {match.matchedCount} matched cue{match.matchedCount === 1 ? "" : "s"}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-[#52638b] md:col-span-3">
                Add notes or select symptoms to compare this case against other symptom-only screens.
              </p>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="ink-panel rounded-lg p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Chance estimate</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-6xl font-semibold text-white">{result.probability}%</p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/60">{result.band}</p>
            </div>
            <div className="rounded-[22px] bg-white/14 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl">
              {result.confidenceLabel}
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/12">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${result.probability}%` }}
            />
          </div>

          <p className="mt-6 text-sm leading-7 text-white/82">{result.explanation}</p>

          <div className="mt-6 rounded-lg bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Clinical caution</p>
            <p className="mt-3 text-sm leading-7 text-white/82">{result.disease.caution}</p>
          </div>
        </div>

        {result.redFlagMatches.length > 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">Red flags mentioned</p>
                <p className="mt-2 text-sm leading-6">
                  Notes include: {result.redFlagMatches.join(", ")}. This should be reviewed urgently.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bubble-card rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="medify-orb flex h-12 w-12 items-center justify-center rounded-[18px]">
              <CheckCircle2 className="h-5 w-5 text-[#24304d]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Matched indicators</p>
              <h4 className="text-xl font-semibold text-[#24304d]">
                {result.matchedSymptoms.length > 0 ? `${result.matchedSymptoms.length} signs matched` : "Waiting for symptom input"}
              </h4>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {result.matchedSymptoms.length > 0 ? (
              result.matchedSymptoms.map((symptom) => (
                <span
                  key={symptom.id}
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-[#24304d]"
                >
                  {symptom.label}
                </span>
              ))
            ) : (
              <p className="text-sm leading-7 text-[#52638b]">
                Select the symptoms the patient reports and the matched indicators will appear here.
              </p>
            )}
          </div>

          {result.noteMatches.length > 0 ? (
            <div className="mt-5 rounded-[22px] bg-white/72 px-4 py-4 text-sm leading-7 text-[#52638b]">
              Medify also found symptom cues inside the free-text notes and merged them into the estimate.
            </div>
          ) : null}
        </div>

        <div className="accent-panel rounded-lg p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="medify-orb flex h-12 w-12 items-center justify-center rounded-[18px]">
              <Sparkles className="h-5 w-5 text-[#24304d]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Next actions</p>
              <h4 className="text-xl font-semibold text-[#24304d]">How to continue the case</h4>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {result.disease.nextSteps.map((step, index) => (
              <div
                key={step}
                className={cn(
                  "rounded-lg border px-4 py-4 text-sm leading-7 text-[#24304d]",
                  index % 2 === 0 ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50"
                )}
              >
                {step}
              </div>
            ))}
          </div>

          {result.missingSignals.length > 0 ? (
            <div className="mt-5 rounded-lg border border-gray-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-[#24304d]">High-value questions still missing</p>
              <p className="mt-2 text-sm leading-7 text-[#52638b]">
                {result.missingSignals.map((symptom) => symptom.label).join(", ")}
              </p>
            </div>
          ) : null}

          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
            <p className="text-sm font-semibold text-[#24304d]">Useful measurements to collect</p>
            <p className="mt-2 text-sm leading-7 text-[#52638b]">{result.disease.measurements.join(", ")}</p>
          </div>

          <Button variant="outline" className="mt-5 w-full justify-center" onClick={copyVisitSummary}>
            <ClipboardCopy className="mr-2 h-4 w-4" />
            {summaryCopied ? "Summary copied" : "Copy visit summary"}
          </Button>
          <Button variant="outline" className="mt-3 w-full justify-center" onClick={downloadVisitSummary}>
            <Download className="mr-2 h-4 w-4" />
            Download summary
          </Button>
        </div>
      </aside>
    </div>
  );
}

function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#68779b]">{label}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition",
                active
                  ? "border-[#172033] bg-[#172033] text-white"
                  : "border-gray-200 bg-white text-[#24304d] hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuickSignal({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bubble-card rounded-lg px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#68779b]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#24304d]">{value}</p>
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-none">
      <p className="text-xs uppercase tracking-[0.18em] text-[#68779b]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#24304d]">{value}</p>
    </div>
  );
}
