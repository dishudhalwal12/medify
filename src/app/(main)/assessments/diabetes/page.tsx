"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertCircle, ArrowLeft } from "lucide-react";

import { RecentAssessmentList } from "@/components/assessments/RecentAssessmentList";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getAssessmentService } from "@/services/loaders";
import { AssessmentRecord, DiabetesAssessmentInput } from "@/types";

const DEFAULT_FORM: DiabetesAssessmentInput = {
  Pregnancies: 0,
  Glucose: 0,
  BloodPressure: 0,
  SkinThickness: 0,
  Insulin: 0,
  BMI: 0,
  DiabetesPedigreeFunction: 0,
  Age: 0,
};

export default function DiabetesAssessmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<DiabetesAssessmentInput>(DEFAULT_FORM);
  const [history, setHistory] = useState<AssessmentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      const assessmentService = await getAssessmentService();
      const records = await assessmentService.getRelatedAssessments(user.uid, "diabetes");
      setHistory(records);
      setLoadingHistory(false);
    })();
  }, [user]);

  function updateField<K extends keyof DiabetesAssessmentInput>(key: K, value: number) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const assessmentService = await getAssessmentService();
      const result = await assessmentService.predict(user.uid, {
        assessmentType: "diabetes",
        inputValues: form,
      });
      router.push(`/history/${result.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to run the diabetes assessment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Session unavailable"
        description="Sign in again to run a diabetes assessment."
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
        eyebrow="Diabetes module"
        title="Run the full diabetes risk pipeline"
        description="This form is aligned to the local diabetes dataset schema and sends your values directly to the trained FastAPI inference endpoint."
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="shell-card border-0 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-[22px] bg-[#edf6ff] p-3">
              <Activity className="h-6 w-6 text-gray-950" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-950">Clinical input set</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Enter the same features used during model training: pregnancies, glucose, blood pressure, skin
                thickness, insulin, BMI, pedigree function, and age.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <NumberField label="Pregnancies" value={form.Pregnancies} onChange={(value) => updateField("Pregnancies", value)} />
              <NumberField label="Glucose" value={form.Glucose} onChange={(value) => updateField("Glucose", value)} />
              <NumberField
                label="Blood pressure"
                value={form.BloodPressure}
                onChange={(value) => updateField("BloodPressure", value)}
              />
              <NumberField
                label="Skin thickness"
                value={form.SkinThickness}
                onChange={(value) => updateField("SkinThickness", value)}
              />
              <NumberField label="Insulin" value={form.Insulin} onChange={(value) => updateField("Insulin", value)} />
              <NumberField label="BMI" value={form.BMI} step="0.1" onChange={(value) => updateField("BMI", value)} />
              <NumberField
                label="Pedigree function"
                value={form.DiabetesPedigreeFunction}
                step="0.01"
                onChange={(value) => updateField("DiabetesPedigreeFunction", value)}
              />
              <NumberField label="Age" value={form.Age} onChange={(value) => updateField("Age", value)} />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex flex-wrap justify-end gap-3 border-t border-black/5 pt-5">
              <Button type="button" variant="outline" onClick={() => setForm(DEFAULT_FORM)}>
                Reset values
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Running diabetes assessment..." : "Run diabetes assessment"}
              </Button>
            </div>
          </form>
        </Card>

        {loadingHistory ? (
          <div className="h-60 animate-pulse rounded-[28px] bg-white/70" />
        ) : (
          <RecentAssessmentList title="Recent diabetes assessments" records={history} />
        )}
      </div>
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
