"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

import { RecentAssessmentList } from "@/components/assessments/RecentAssessmentList";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getAssessmentService } from "@/services/loaders";
import { AssessmentRecord, KidneyAssessmentInput, LiverAssessmentInput } from "@/types";

type OrganModule = "kidney" | "liver";

const DEFAULT_LIVER_FORM: LiverAssessmentInput = {
  Age: 0,
  Gender: "Male",
  Total_Bilirubin: 0,
  Direct_Bilirubin: 0,
  Alkaline_Phosphotase: 0,
  Alamine_Aminotransferase: 0,
  Aspartate_Aminotransferase: 0,
  Total_Protiens: 0,
  Albumin: 0,
  Albumin_and_Globulin_Ratio: 0,
};

const DEFAULT_KIDNEY_FORM: KidneyAssessmentInput = {
  age: 0,
  bp: 0,
  sg: 1.02,
  al: 0,
  su: 0,
  rbc: "normal",
  pc: "normal",
  pcc: "notpresent",
  ba: "notpresent",
  bgr: 0,
  bu: 0,
  sc: 0,
  sod: 0,
  pot: 0,
  hemo: 0,
  pcv: 0,
  wc: 0,
  rc: 0,
  htn: "no",
  dm: "no",
  cad: "no",
  appet: "good",
  pe: "no",
  ane: "no",
};

export default function OrganAssessmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedModule = searchParams.get("module");
  const initialModule: OrganModule = requestedModule === "liver" ? "liver" : "kidney";
  const [activeModule, setActiveModule] = useState<OrganModule>(initialModule);
  const [kidneyForm, setKidneyForm] = useState<KidneyAssessmentInput>(DEFAULT_KIDNEY_FORM);
  const [liverForm, setLiverForm] = useState<LiverAssessmentInput>(DEFAULT_LIVER_FORM);
  const [history, setHistory] = useState<AssessmentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveModule(initialModule);
  }, [initialModule]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoadingHistory(true);

    void getAssessmentService()
      .then((assessmentService) => assessmentService.getRelatedAssessments(user.uid, activeModule))
      .then((records) => {
        setHistory(records);
        setError(null);
      })
      .catch((historyError) => {
        setError(
          historyError instanceof Error
            ? historyError.message
            : `Unable to load recent ${activeModule} assessments.`
        );
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [activeModule, user]);

  function updateKidneyField<K extends keyof KidneyAssessmentInput>(
    key: K,
    value: KidneyAssessmentInput[K]
  ) {
    setKidneyForm((current) => ({ ...current, [key]: value }));
  }

  function updateLiverField<K extends keyof LiverAssessmentInput>(
    key: K,
    value: LiverAssessmentInput[K]
  ) {
    setLiverForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const assessmentService = await getAssessmentService();
      const result =
        activeModule === "kidney"
          ? await assessmentService.predict(user.uid, {
              assessmentType: "kidney",
              inputValues: kidneyForm,
            })
          : await assessmentService.predict(user.uid, {
              assessmentType: "liver",
              inputValues: liverForm,
            });

      router.push(`/history/${result.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Unable to run the ${activeModule} assessment.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetActiveForm() {
    if (activeModule === "kidney") {
      setKidneyForm(DEFAULT_KIDNEY_FORM);
      return;
    }

    setLiverForm(DEFAULT_LIVER_FORM);
  }

  if (!user) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Session unavailable"
        description="Sign in again to run the organ assessments."
      />
    );
  }

  return (
    <div>
      <Link href="/assessments" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
        <ArrowLeft className="h-4 w-4" />
        Back to modules
      </Link>

      <PageIntro
        eyebrow="Organ module"
        title="Kidney and liver risk workflows"
        description="This shared route now runs both trained organ models from the local datasets, with feature-aligned forms for renal and hepatic screening."
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="shell-card border-0 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-[22px] bg-[#eef7ef] p-3">
              <ShieldCheck className="h-6 w-6 text-gray-950" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-3">
                <ModuleButton
                  active={activeModule === "kidney"}
                  label="Kidney model"
                  onClick={() => setActiveModule("kidney")}
                />
                <ModuleButton
                  active={activeModule === "liver"}
                  label="Liver model"
                  onClick={() => setActiveModule("liver")}
                />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-gray-950">
                {activeModule === "kidney" ? "Kidney panel inputs" : "Liver panel inputs"}
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                {activeModule === "kidney"
                  ? "Capture urine markers, renal chemistry, blood counts, and chronic disease indicators used by the trained kidney classifier."
                  : "Capture bilirubin, hepatic enzymes, proteins, albumin, and ratio markers used by the trained liver classifier."}
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            {activeModule === "kidney" ? (
              <div className="space-y-6">
                <FormSection
                  title="Core vitals and urine profile"
                  description="Baseline measurements and urine findings that strongly influence the kidney model."
                >
                  <NumberField label="Age" value={kidneyForm.age} onChange={(value) => updateKidneyField("age", value)} />
                  <NumberField label="Blood pressure" value={kidneyForm.bp} onChange={(value) => updateKidneyField("bp", value)} />
                  <NumberField label="Specific gravity" step="0.01" value={kidneyForm.sg} onChange={(value) => updateKidneyField("sg", value)} />
                  <NumberField label="Albumin" value={kidneyForm.al} onChange={(value) => updateKidneyField("al", value)} />
                  <NumberField label="Sugar" value={kidneyForm.su} onChange={(value) => updateKidneyField("su", value)} />
                  <SelectField label="Red blood cells" value={kidneyForm.rbc} onChange={(value) => updateKidneyField("rbc", value)} options={[{ value: "normal", label: "Normal" }, { value: "abnormal", label: "Abnormal" }]} />
                  <SelectField label="Pus cells" value={kidneyForm.pc} onChange={(value) => updateKidneyField("pc", value)} options={[{ value: "normal", label: "Normal" }, { value: "abnormal", label: "Abnormal" }]} />
                  <SelectField label="Pus cell clumps" value={kidneyForm.pcc} onChange={(value) => updateKidneyField("pcc", value)} options={[{ value: "notpresent", label: "Not present" }, { value: "present", label: "Present" }]} />
                  <SelectField label="Bacteria" value={kidneyForm.ba} onChange={(value) => updateKidneyField("ba", value)} options={[{ value: "notpresent", label: "Not present" }, { value: "present", label: "Present" }]} />
                </FormSection>

                <FormSection
                  title="Renal chemistry and blood counts"
                  description="Metabolic and hematology values from the kidney dataset used for renal risk scoring."
                >
                  <NumberField label="Blood glucose random" value={kidneyForm.bgr} onChange={(value) => updateKidneyField("bgr", value)} />
                  <NumberField label="Blood urea" value={kidneyForm.bu} onChange={(value) => updateKidneyField("bu", value)} />
                  <NumberField label="Serum creatinine" step="0.1" value={kidneyForm.sc} onChange={(value) => updateKidneyField("sc", value)} />
                  <NumberField label="Sodium" step="0.1" value={kidneyForm.sod} onChange={(value) => updateKidneyField("sod", value)} />
                  <NumberField label="Potassium" step="0.1" value={kidneyForm.pot} onChange={(value) => updateKidneyField("pot", value)} />
                  <NumberField label="Hemoglobin" step="0.1" value={kidneyForm.hemo} onChange={(value) => updateKidneyField("hemo", value)} />
                  <NumberField label="Packed cell volume" value={kidneyForm.pcv} onChange={(value) => updateKidneyField("pcv", value)} />
                  <NumberField label="White blood cell count" value={kidneyForm.wc} onChange={(value) => updateKidneyField("wc", value)} />
                  <NumberField label="Red blood cell count" step="0.1" value={kidneyForm.rc} onChange={(value) => updateKidneyField("rc", value)} />
                </FormSection>

                <FormSection
                  title="Clinical context"
                  description="Comorbidities and exam findings from the chronic kidney disease training data."
                >
                  <SelectField label="Hypertension" value={kidneyForm.htn} onChange={(value) => updateKidneyField("htn", value)} options={YES_NO_OPTIONS} />
                  <SelectField label="Diabetes mellitus" value={kidneyForm.dm} onChange={(value) => updateKidneyField("dm", value)} options={YES_NO_OPTIONS} />
                  <SelectField label="Coronary artery disease" value={kidneyForm.cad} onChange={(value) => updateKidneyField("cad", value)} options={YES_NO_OPTIONS} />
                  <SelectField label="Appetite" value={kidneyForm.appet} onChange={(value) => updateKidneyField("appet", value)} options={[{ value: "good", label: "Good" }, { value: "poor", label: "Poor" }]} />
                  <SelectField label="Pedal edema" value={kidneyForm.pe} onChange={(value) => updateKidneyField("pe", value)} options={YES_NO_OPTIONS} />
                  <SelectField label="Anemia" value={kidneyForm.ane} onChange={(value) => updateKidneyField("ane", value)} options={YES_NO_OPTIONS} />
                </FormSection>
              </div>
            ) : (
              <FormSection
                title="Liver markers"
                description="The full hepatic panel used in the trained liver pipeline."
              >
                <NumberField label="Age" value={liverForm.Age} onChange={(value) => updateLiverField("Age", value)} />
                <SelectField label="Gender" value={liverForm.Gender} onChange={(value) => updateLiverField("Gender", value)} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} />
                <NumberField label="Total bilirubin" step="0.1" value={liverForm.Total_Bilirubin} onChange={(value) => updateLiverField("Total_Bilirubin", value)} />
                <NumberField label="Direct bilirubin" step="0.1" value={liverForm.Direct_Bilirubin} onChange={(value) => updateLiverField("Direct_Bilirubin", value)} />
                <NumberField label="Alkaline phosphotase" value={liverForm.Alkaline_Phosphotase} onChange={(value) => updateLiverField("Alkaline_Phosphotase", value)} />
                <NumberField label="Alanine aminotransferase" value={liverForm.Alamine_Aminotransferase} onChange={(value) => updateLiverField("Alamine_Aminotransferase", value)} />
                <NumberField label="Aspartate aminotransferase" value={liverForm.Aspartate_Aminotransferase} onChange={(value) => updateLiverField("Aspartate_Aminotransferase", value)} />
                <NumberField label="Total proteins" step="0.1" value={liverForm.Total_Protiens} onChange={(value) => updateLiverField("Total_Protiens", value)} />
                <NumberField label="Albumin" step="0.1" value={liverForm.Albumin} onChange={(value) => updateLiverField("Albumin", value)} />
                <NumberField label="Albumin/globulin ratio" step="0.01" value={liverForm.Albumin_and_Globulin_Ratio} onChange={(value) => updateLiverField("Albumin_and_Globulin_Ratio", value)} />
              </FormSection>
            )}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex flex-wrap justify-end gap-3 border-t border-black/5 pt-5">
              <Button type="button" variant="outline" onClick={resetActiveForm}>
                Reset values
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? `Running ${activeModule} assessment...`
                  : `Run ${activeModule} assessment`}
              </Button>
            </div>
          </form>
        </Card>

        {loadingHistory ? (
          <div className="h-60 animate-pulse rounded-[28px] bg-white/70" />
        ) : (
          <RecentAssessmentList
            title={`Recent ${activeModule} assessments`}
            records={history}
          />
        )}
      </div>
    </div>
  );
}

function ModuleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#17181f] text-white"
          : "bg-[#f7f4ef] text-gray-700 hover:bg-[#ece6de]"
      }`}
    >
      {label}
    </button>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-950">{title}</h4>
        <p className="mt-1 text-sm leading-7 text-gray-600">{description}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  );
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium text-gray-700">{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function SelectField({
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
      <Label className="mb-2 block text-sm font-medium text-gray-700">{label}</Label>
      <select
        className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];
