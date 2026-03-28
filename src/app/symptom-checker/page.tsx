import Link from "next/link";
import { ArrowRight, HeartPulse, ShieldCheck } from "lucide-react";

import { SymptomLikelihoodWorkbench } from "@/components/assessments/SymptomLikelihoodWorkbench";
import { Button } from "@/components/ui/button";

const SCREENING_POINTS = [
  "Choose the disease the patient wants to check.",
  "Mark the symptoms they are experiencing.",
  "Add notes and review the estimated likelihood.",
];

export default function SymptomCheckerPage() {
  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto max-w-[1520px] space-y-5">
        <header className="glass-header rounded-[38px] rounded-br-[78px] p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="medify-orb flex h-12 w-12 items-center justify-center rounded-[18px]">
                <HeartPulse className="h-5 w-5 text-[#24304d]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#68779b]">Symptora</p>
                <p className="text-lg font-semibold text-[#24304d]">Symptom likelihood explorer</p>
              </div>
            </Link>

            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button variant="outline">Open workspace</Button>
              </Link>
              <Link href="/register">
                <Button>Create account</Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="shell-card rounded-[40px] rounded-tr-[92px] rounded-bl-[72px] p-6 md:p-8">
            <p className="medify-pill">Symptom-led screening</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#24304d] md:text-7xl">
              Select the disease concern, capture symptoms, and review the estimated chances.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-[#68779b] md:text-base">
              Patients can begin with the condition they are worried about, describe what they feel, and move into a clearer symptom-based likelihood review.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">Use Symptora in full</Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  Back to homepage
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoBubble label="Start point" value="Disease concern" className="bubble-card rounded-[24px] rounded-tr-[46px]" />
              <InfoBubble label="Input style" value="Symptoms + notes" className="mesh-panel rounded-[24px] rounded-bl-[46px]" />
              <InfoBubble label="Output" value="Chance + next steps" className="accent-panel rounded-[24px] rounded-tr-[38px]" />
            </div>
          </div>

          <div className="grid gap-5">
            <div className="ink-panel rounded-[36px] rounded-bl-[76px] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">How it works</p>
              <div className="mt-5 space-y-3 text-sm leading-7 text-white/82">
                {SCREENING_POINTS.map((point, index) => (
                  <p key={point}>{index + 1}. {point}</p>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <div className="bubble-card rounded-[34px] rounded-tr-[70px] p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#52638b]" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#68779b]">Result focus</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#52638b]">
                  The result view keeps the estimate, matched indicators, and next questions together so the patient and clinician can understand the flow quickly.
                </p>
              </div>

              <div className="clay-card rounded-[34px] rounded-bl-[70px] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#68779b]">Workspace ready</p>
                <p className="mt-4 text-sm leading-7 text-[#52638b]">
                  Continue inside Symptora to save the screening, add records, and carry the case into deeper assessments.
                </p>
              </div>
            </div>
          </div>
        </section>

        <SymptomLikelihoodWorkbench />

        <section className="bubble-card rounded-[36px] rounded-tr-[78px] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">Continue in workspace</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#24304d]">Save the screening flow inside the full healthcare workspace</h2>
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-[#24304d] underline decoration-2 underline-offset-4">
              Create your Symptora account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoBubble({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`${className} p-4`}>
      <p className="text-xs uppercase tracking-[0.2em] text-[#68779b]">{label}</p>
      <p className="mt-3 text-lg font-semibold text-[#24304d]">{value}</p>
    </div>
  );
}
