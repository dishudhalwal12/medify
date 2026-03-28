"use client";

import { useRouter } from "next/navigation";
import { Activity, ArrowRight, FileImage, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";

const modules = [
  {
    title: "Symptom likelihood explorer",
    href: "/symptom-checker",
    description:
      "Let patients select the disease they suspect, report symptoms, and view a cleaner probability estimate before moving deeper.",
    icon: Sparkles,
    tone: "bg-[#eef7f5]",
  },
  {
    title: "Diabetes risk",
    href: "/diabetes",
    description:
      "Use the trained diabetes pipeline with glucose, BMI, insulin, pregnancies, pedigree function, and age.",
    icon: Activity,
    tone: "bg-[#edf6ff]",
  },
  {
    title: "Heart disease",
    href: "/heart",
    description:
      "Run the heart model with chest pain, resting ECG, exercise angina, max heart rate, and vessel-related features.",
    icon: HeartPulse,
    tone: "bg-[#fff1f0]",
  },
  {
    title: "Kidney and liver",
    href: "/assessments/kidney-or-liver",
    description:
      "Run the trained kidney and liver workflows from one organ module, with renal chemistry, urine findings, and liver marker forms aligned to the local datasets.",
    icon: ShieldCheck,
    tone: "bg-[#eef7ef]",
  },
  {
    title: "Chest X-ray",
    href: "/xray",
    description:
      "Upload an X-ray record for image review. If image analysis is unavailable, the result page will explain that clearly.",
    icon: FileImage,
    tone: "bg-[#f5f2ff]",
  },
];

export default function AssessmentsPage() {
  const router = useRouter();
  const [featureModule, ...secondaryModules] = modules;

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Assessments hub"
        title="Choose how you want to start the screening flow"
        description="Start from symptoms or move directly into structured disease modules and imaging, depending on what the patient already knows."
      />

      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="ink-panel rounded-[38px] rounded-br-[80px] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-white/55">Primary client-facing flow</p>
          <h3 className="mt-4 max-w-2xl text-4xl font-semibold text-white">
            Start from the disease the patient thinks they may have, capture symptoms, then surface the likely chances clearly.
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
            Use the symptom explorer for the first patient interaction, then continue into diabetes, heart, kidney, liver, or X-ray workflows when structured values and reports are available.
          </p>
        </Card>

        <Card className="accent-panel rounded-[36px] rounded-tr-[72px] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[#121212]/60">Recommended order</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[#121212]/75">
            <li>Use the symptom explorer for early triage and more natural patient interaction.</li>
            <li>Move into the disease module once clinical values or reports are available.</li>
            <li>Review the full result screen to inspect factors, warnings, and suggested next steps.</li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <button
          type="button"
          onClick={() => router.push(featureModule.href)}
          className="group block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9dfff]/70"
          aria-label={`Open ${featureModule.title}`}
        >
          <Card className="h-full cursor-pointer rounded-[40px] rounded-tr-[88px] rounded-bl-[72px] p-6 transition group-hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-4">
              <div className="medify-orb flex h-14 w-14 items-center justify-center rounded-[20px]">
                <featureModule.icon className="h-6 w-6 text-[#24304d]" />
              </div>
              <ArrowRight className="h-5 w-5 text-[#24304d]" />
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.24em] text-[#68779b]">Recommended start</p>
            <h3 className="mt-4 max-w-xl text-4xl font-semibold text-[#24304d]">{featureModule.title}</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#52638b]">{featureModule.description}</p>
          </Card>
        </button>

        <div className="grid gap-5 md:grid-cols-2">
          {secondaryModules.map((module, index) => (
            <button
              type="button"
              key={module.href}
              onClick={() => router.push(module.href)}
              className="group block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9dfff]/70"
              aria-label={`Open ${module.title}`}
            >
              <Card className={`h-full cursor-pointer p-6 transition group-hover:-translate-y-0.5 ${index % 2 === 0 ? "rounded-[34px] rounded-tr-[68px]" : "rounded-[34px] rounded-bl-[68px]"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className={`rounded-[20px] p-3 ${module.tone}`}>
                    <module.icon className="h-6 w-6 text-gray-950" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#24304d]" />
                </div>
                <h3 className="mt-8 text-3xl font-semibold text-gray-950">{module.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-700">{module.description}</p>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
