import Link from "next/link";
import {
  Activity,
  ArrowRight,
  FileStack,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const JOURNEY = [
  {
    title: "Choose the condition",
    description: "Let the patient begin with the disease concern they want to check first.",
    tone: "brutal-peach",
  },
  {
    title: "Capture symptoms",
    description: "Combine symptom chips with free-text notes to describe the case clearly.",
    tone: "brutal-cyan",
  },
  {
    title: "Review the chances",
    description: "Show the estimated likelihood, matched indicators, and the next clinical questions.",
    tone: "brutal-lilac",
  },
];

const SNAPSHOTS = [
  {
    label: "Suspected condition",
    value: "Heart disease risk",
    detail: "Patients can begin from the concern they want to check first.",
    className: "clay-card rounded-[28px] rounded-tr-[58px]",
  },
  {
    label: "Estimated chance",
    value: "78%",
    detail: "Likelihood, matched signs, and next steps stay together in one result view.",
    className: "bubble-card rounded-[28px] rounded-bl-[58px]",
  },
];

const FEATURES = [
  { icon: Activity, title: "Symptom-led screening" },
  { icon: FileStack, title: "Records and uploads" },
  { icon: ShieldCheck, title: "Explainable clinical guidance" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="glass-header rounded-[38px] rounded-br-[78px] p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="medify-orb flex h-14 w-14 items-center justify-center rounded-[24px]">
                <HeartPulse className="h-6 w-6 text-[#24304d]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#68779b]">Symptora</p>
                <p className="text-xl font-semibold text-[#24304d]">Federated learning system in healthcare</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-3">
              <Link href="/symptom-checker">
                <Button variant="outline">Symptom explorer</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Create account</Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="shell-card rounded-[40px] rounded-tr-[92px] rounded-bl-[72px] p-6 md:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <div>
                <p className="medify-pill">Patient-first screening</p>
                <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-[#24304d] md:text-7xl">
                  One flow for disease selection, symptom capture, and likelihood review.
                </h1>
                <p className="mt-6 max-w-2xl text-sm leading-8 text-[#68779b] md:text-base">
                  Symptora helps patients choose the disease concern they want to check, describe symptoms in their own words, and review the estimated chances with clear next steps.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/symptom-checker">
                    <Button size="lg">Open symptom explorer</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline">
                      Start workspace
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <StatBubble label="Screening tracks" value="3" className="bubble-card rounded-[24px] rounded-tr-[50px]" />
                  <StatBubble label="Primary route" value="Symptom first" className="mesh-panel rounded-[24px] rounded-bl-[50px]" />
                  <StatBubble label="Saved outputs" value="Assessments + records" className="accent-panel rounded-[24px] rounded-tr-[42px]" />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="ink-panel rounded-[34px] rounded-bl-[74px] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/60">Patient route</p>
                  <div className="mt-5 space-y-4">
                    {JOURNEY.map((step, index) => (
                      <div key={step.title} className="rounded-[24px] bg-white/10 px-4 py-4 backdrop-blur-xl">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/55">Step {index + 1}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{step.title}</p>
                        <p className="mt-2 text-sm leading-7 text-white/78">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                  {SNAPSHOTS.map((snapshot) => (
                    <div key={snapshot.label} className={`${snapshot.className} p-5`}>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#68779b]">{snapshot.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-[#24304d]">{snapshot.value}</p>
                      <p className="mt-3 text-sm leading-7 text-[#52638b]">{snapshot.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5">
            <div className="ink-panel rounded-[38px] rounded-bl-[82px] p-6 md:p-7">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Federated care workspace</p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold text-white">
                Patients, symptoms, and explainable outputs stay connected from the first screen.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/78">
                Symptora keeps the first interaction simple while still producing a structured result that can guide the next clinical conversation.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
              <article className="bubble-card rounded-[34px] rounded-tr-[70px] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#68779b]">Clinical path</p>
                <h2 className="mt-4 text-3xl font-semibold text-[#24304d]">Built for healthcare screening conversations</h2>
                <p className="mt-4 text-sm leading-7 text-[#52638b]">
                  Keep the patient interaction simple while still generating a structured estimate that can guide the next step.
                </p>
              </article>

              <article className="mesh-panel rounded-[34px] rounded-bl-[72px] p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-[#52638b]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#68779b]">Workspace outcome</p>
                    <p className="text-2xl font-semibold text-[#24304d]">Explainable and connected</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {FEATURES.map((feature) => (
                    <FeatureRow key={feature.title} icon={feature.icon} title={feature.title} />
                  ))}
                </div>
                <Link
                  href="/register"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#24304d] underline decoration-2 underline-offset-4"
                >
                  Create your Symptora account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </div>
          </section>
        </main>

        <section className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="accent-panel rounded-[38px] rounded-tr-[78px] p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-[#68779b]">Workspace coverage</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#24304d]">Move from early screening into deeper review without leaving Symptora.</h2>
            <p className="mt-4 text-sm leading-7 text-[#52638b]">
              Start with patient-reported symptoms, then continue into assessments, records, saved histories, and explainable next actions.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <RouteTile title="Symptom explorer" description="Disease-first screening for natural patient input." className="bubble-card rounded-[30px] rounded-tr-[60px]" />
            <RouteTile title="Structured modules" description="Diabetes, heart, kidney, liver, and imaging workflows." className="clay-card rounded-[30px] rounded-bl-[60px]" />
            <RouteTile title="Saved history" description="Track previous runs, uploads, and result changes over time." className="mesh-panel rounded-[30px] rounded-tr-[44px]" />
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  title,
}: {
  icon: typeof Activity;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-white/70 bg-white/55 px-4 py-4 shadow-[10px_10px_24px_rgba(174,186,219,0.12)] backdrop-blur-xl">
      <div className="medify-orb flex h-11 w-11 items-center justify-center rounded-[18px]">
        <Icon className="h-5 w-5 text-[#24304d]" />
      </div>
      <p className="font-semibold text-[#24304d]">{title}</p>
    </div>
  );
}

function StatBubble({
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

function RouteTile({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className: string;
}) {
  return (
    <div className={`${className} p-5`}>
      <p className="text-2xl font-semibold text-[#24304d]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#52638b]">{description}</p>
    </div>
  );
}
