"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Save } from "lucide-react";

import { ListEditor } from "@/components/profile/ListEditor";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecoveryState } from "@/components/ui/recovery-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from "@/lib/assessment-options";
import {
  ONBOARDING_STEPS,
  getOnboardingProgress,
  mergeProfileWithDefaults,
} from "@/lib/profile";
import { profileService } from "@/services/profile.service";
import { HealthProfile } from "@/types";

type SaveState = "idle" | "saving" | "saved" | "error";
type DraftErrors = Partial<Record<string, string>>;

function toNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  return Number(value);
}

function validateRequiredNumber(
  value: number | undefined,
  label: string,
  min: number,
  max: number
) {
  if (value === undefined || Number.isNaN(value)) {
    return `${label} is required.`;
  }

  if (value < min || value > max) {
    return `${label} should be between ${min} and ${max}.`;
  }

  return null;
}

function validateDraft(profile: HealthProfile) {
  const errors: DraftErrors = {};

  if (!profile.fullName.trim()) errors.fullName = "Full name is required.";

  const ageError = validateRequiredNumber(profile.age, "Age", 1, 120);
  if (ageError) errors.age = ageError;

  if (!profile.gender) errors.gender = "Gender is required.";

  const heightError = validateRequiredNumber(profile.height, "Height", 50, 260);
  if (heightError) errors.height = heightError;

  const weightError = validateRequiredNumber(profile.weight, "Weight", 20, 400);
  if (weightError) errors.weight = weightError;

  if (!profile.bloodGroup) errors.bloodGroup = "Blood group is required.";
  if (!profile.smokingStatus) errors.smokingStatus = "Smoking status is required.";
  if (!profile.alcoholUse) errors.alcoholUse = "Alcohol use is required.";
  if (!profile.activityLevel) errors.activityLevel = "Activity level is required.";
  if (!profile.sleepPattern) errors.sleepPattern = "Sleep pattern is required.";

  const systolicError = validateRequiredNumber(profile.baselineValues?.systolicBP, "Systolic BP", 60, 260);
  if (systolicError) errors["baselineValues.systolicBP"] = systolicError;

  const diastolicError = validateRequiredNumber(profile.baselineValues?.diastolicBP, "Diastolic BP", 40, 180);
  if (diastolicError) errors["baselineValues.diastolicBP"] = diastolicError;

  const glucoseError = validateRequiredNumber(profile.baselineValues?.fastingGlucose, "Fasting glucose", 40, 400);
  if (glucoseError) errors["baselineValues.fastingGlucose"] = glucoseError;

  const cholesterolError = validateRequiredNumber(profile.baselineValues?.cholesterol, "Cholesterol", 80, 400);
  if (cholesterolError) errors["baselineValues.cholesterol"] = cholesterolError;

  return errors;
}

function getStepErrors(stepIndex: number, draft: HealthProfile) {
  const errors = validateDraft(draft);
  const fields = ONBOARDING_STEPS[stepIndex].fields;

  return Object.fromEntries(Object.entries(errors).filter(([key]) => fields.includes(key as never)));
}

function getFirstStepWithErrors(errors: DraftErrors) {
  return Math.max(
    0,
    ONBOARDING_STEPS.findIndex((step) => step.fields.some((field) => errors[field]))
  );
}

export default function OnboardingPage() {
  const { user, profile, profileError, profileLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [draftOverride, setDraftOverride] = useState<HealthProfile | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<DraftErrors>({});
  const storedDraft = useMemo(() => {
    if (!user || profileLoading || typeof window === "undefined") {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(`symptora-onboarding-draft:${user.uid}`);
      return raw ? (JSON.parse(raw) as Partial<HealthProfile>) : null;
    } catch {
      return null;
    }
  }, [profileLoading, user]);
  const baseProfile = useMemo(
    () =>
      user && !profileLoading
        ? mergeProfileWithDefaults(profile || storedDraft, {
            uid: user.uid,
            fullName: user.fullName,
          })
        : null,
    [profile, profileLoading, storedDraft, user]
  );
  const draft = draftOverride?.uid === user?.uid ? draftOverride : baseProfile;
  const lastSavedAt = draft?.onboardingLastSavedAt || null;

  useEffect(() => {
    if (!user || !draft || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(`symptora-onboarding-draft:${user.uid}`, JSON.stringify(draft));
  }, [draft, user]);

  const progress = useMemo(() => getOnboardingProgress(draft), [draft]);
  const activeStep = ONBOARDING_STEPS[stepIndex];
  const bootstrapWarning =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("bootstrap") === "retry";

  async function persistDraft(nextStep: number, complete = false) {
    if (!user || !draft) {
      return false;
    }

    setSaveState("saving");
    setSaveError(null);

    try {
      const timestamp = new Date().toISOString();
      const updated = await profileService.updateProfile(user.uid, {
        ...draft,
        uid: user.uid,
        fullName: draft.fullName.trim() || user.fullName,
        onboardingLastSavedAt: timestamp,
        onboardingLastStep: nextStep,
        onboardingCompletedAt: complete ? timestamp : draft.onboardingCompletedAt,
      });

      setDraftOverride(mergeProfileWithDefaults(updated, { uid: user.uid, fullName: user.fullName }));
      setSaveState("saved");
      await refreshProfile();

      if (complete && typeof window !== "undefined") {
        window.localStorage.removeItem(`symptora-onboarding-draft:${user.uid}`);
      }

      return true;
    } catch (error) {
      setSaveState("error");
      setSaveError(error instanceof Error ? error.message : "We could not save your onboarding answers.");
      return false;
    }
  }

  async function handleNext() {
    if (!draft) {
      return;
    }

    const errors = getStepErrors(stepIndex, draft);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSaveState("error");
      return;
    }

    const success = await persistDraft(stepIndex + 2);

    if (success) {
      setStepIndex((current) => Math.min(current + 1, ONBOARDING_STEPS.length - 1));
    }
  }

  async function handleBack() {
    const nextStep = Math.max(stepIndex, 1);

    await persistDraft(nextStep);
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  async function handleComplete() {
    if (!draft) {
      return;
    }

    const errors = validateDraft(draft);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStepIndex(getFirstStepWithErrors(errors));
      setSaveState("error");
      setSaveError("Finish the required baseline fields before entering the dashboard.");
      return;
    }

    const success = await persistDraft(ONBOARDING_STEPS.length, true);

    if (success) {
      router.replace("/dashboard?welcome=1");
    }
  }

  function updateDraft<K extends keyof HealthProfile>(key: K, value: HealthProfile[K]) {
    setDraftOverride((current) => {
      const source = current?.uid === user?.uid ? current : baseProfile;
      return source ? { ...source, [key]: value } : current;
    });
  }

  function updateBaseline(
    key: keyof NonNullable<HealthProfile["baselineValues"]>,
    value: number | undefined
  ) {
    setDraftOverride((current) => {
      const source = current?.uid === user?.uid ? current : baseProfile;

      return source
        ? {
            ...source,
            baselineValues: {
              ...source.baselineValues,
              [key]: value,
            },
          }
        : current;
    });
  }

  if (!user || profileLoading || !draft) {
    return (
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto h-[520px] max-w-6xl animate-pulse rounded-[32px] bg-white/70" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl">
        <PageIntro
          eyebrow="Onboarding"
          title="Build your baseline before you enter the workspace"
          description="This first-run intake collects the health details Symptora needs before the main dashboard becomes useful. Your answers are saved as you move through the steps."
        />

        {bootstrapWarning || profileError || saveError ? (
          <div className="mb-6">
            <RecoveryState
              title="Health workspace setup needs attention"
              description={
                saveError ||
                profileError ||
                "Your account exists, but the workspace profile setup needed another pass before onboarding could continue."
              }
              actionLabel="Retry profile sync"
              onAction={() => void refreshProfile()}
            />
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
          <Card className="ink-panel border-0 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">Baseline readiness</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-semibold text-white">{progress.percentage}%</p>
                <p className="mt-3 max-w-sm text-sm leading-7 text-white/74">
                  Complete the minimum intake once so the dashboard, scores, and recommendations start from real baseline data.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                {progress.completedFields}/{progress.totalFields} required answers saved
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#f5b08a] transition-all" style={{ width: `${progress.percentage}%` }} />
            </div>

            <div className="mt-6 grid gap-3">
              {ONBOARDING_STEPS.map((step, index) => {
                const isActive = index === stepIndex;
                const isComplete = index < stepIndex;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setStepIndex(index)}
                    className={`rounded-[24px] border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-white/25 bg-white/12 text-white"
                        : "border-white/8 bg-white/5 text-white/72 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/50">Step {index + 1}</p>
                        <p className="mt-2 text-lg font-semibold">{step.title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/68">{step.description}</p>
                      </div>
                      <div className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                        {isComplete ? "Done" : isActive ? "Current" : "Pending"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="shell-card border-0 p-6 md:p-8">
            <div className="flex flex-col gap-4 border-b border-black/5 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Step {stepIndex + 1}</p>
                <h3 className="mt-2 text-3xl font-semibold text-gray-950">{activeStep.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">{activeStep.description}</p>
              </div>
              <div className="text-sm text-gray-500">
                {lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}` : "Draft saved locally on this device"}
              </div>
            </div>

            <div className="mt-6">
              {activeStep.id === "identity" ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Full name" error={fieldErrors.fullName}>
                    <Input
                      value={draft.fullName}
                      onChange={(event) => updateDraft("fullName", event.target.value)}
                      placeholder="Aarav Sharma"
                    />
                  </Field>
                  <Field label="Age" error={fieldErrors.age}>
                    <Input
                      type="number"
                      value={draft.age ?? ""}
                      onChange={(event) => updateDraft("age", toNumber(event.target.value))}
                    />
                  </Field>
                  <Field label="Gender" error={fieldErrors.gender}>
                    <select
                      className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      value={draft.gender || ""}
                      onChange={(event) => updateDraft("gender", (event.target.value || undefined) as HealthProfile["gender"])}
                    >
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Height (cm)" error={fieldErrors.height}>
                    <Input
                      type="number"
                      value={draft.height ?? ""}
                      onChange={(event) => updateDraft("height", toNumber(event.target.value))}
                    />
                  </Field>
                  <Field label="Weight (kg)" error={fieldErrors.weight}>
                    <Input
                      type="number"
                      value={draft.weight ?? ""}
                      onChange={(event) => updateDraft("weight", toNumber(event.target.value))}
                    />
                  </Field>
                  <Field label="Blood group" error={fieldErrors.bloodGroup}>
                    <select
                      className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      value={draft.bloodGroup || ""}
                      onChange={(event) => updateDraft("bloodGroup", (event.target.value || undefined) as HealthProfile["bloodGroup"])}
                    >
                      <option value="">Select blood group</option>
                      {BLOOD_GROUP_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              ) : null}

              {activeStep.id === "lifestyle" ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Smoking status"
                    value={draft.smokingStatus || "never"}
                    error={fieldErrors.smokingStatus}
                    options={[
                      { value: "never", label: "Never" },
                      { value: "former", label: "Former" },
                      { value: "occasional", label: "Occasional" },
                      { value: "frequent", label: "Frequent" },
                    ]}
                    onChange={(value) => updateDraft("smokingStatus", value as HealthProfile["smokingStatus"])}
                  />
                  <SelectField
                    label="Alcohol use"
                    value={draft.alcoholUse || "none"}
                    error={fieldErrors.alcoholUse}
                    options={[
                      { value: "none", label: "None" },
                      { value: "social", label: "Social" },
                      { value: "weekly", label: "Weekly" },
                      { value: "frequent", label: "Frequent" },
                    ]}
                    onChange={(value) => updateDraft("alcoholUse", value as HealthProfile["alcoholUse"])}
                  />
                  <SelectField
                    label="Activity level"
                    value={draft.activityLevel || "moderate"}
                    error={fieldErrors.activityLevel}
                    options={[
                      { value: "low", label: "Low" },
                      { value: "moderate", label: "Moderate" },
                      { value: "high", label: "High" },
                    ]}
                    onChange={(value) => updateDraft("activityLevel", value as HealthProfile["activityLevel"])}
                  />
                  <SelectField
                    label="Sleep pattern"
                    value={draft.sleepPattern || "fair"}
                    error={fieldErrors.sleepPattern}
                    options={[
                      { value: "poor", label: "Poor" },
                      { value: "fair", label: "Fair" },
                      { value: "good", label: "Good" },
                    ]}
                    onChange={(value) => updateDraft("sleepPattern", value as HealthProfile["sleepPattern"])}
                  />
                </div>
              ) : null}

              {activeStep.id === "baseline" ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Systolic BP" error={fieldErrors["baselineValues.systolicBP"]}>
                    <Input
                      type="number"
                      value={draft.baselineValues?.systolicBP ?? ""}
                      onChange={(event) => updateBaseline("systolicBP", toNumber(event.target.value))}
                    />
                  </Field>
                  <Field label="Diastolic BP" error={fieldErrors["baselineValues.diastolicBP"]}>
                    <Input
                      type="number"
                      value={draft.baselineValues?.diastolicBP ?? ""}
                      onChange={(event) => updateBaseline("diastolicBP", toNumber(event.target.value))}
                    />
                  </Field>
                  <Field label="Fasting glucose" error={fieldErrors["baselineValues.fastingGlucose"]}>
                    <Input
                      type="number"
                      value={draft.baselineValues?.fastingGlucose ?? ""}
                      onChange={(event) => updateBaseline("fastingGlucose", toNumber(event.target.value))}
                    />
                  </Field>
                  <Field label="Cholesterol" error={fieldErrors["baselineValues.cholesterol"]}>
                    <Input
                      type="number"
                      value={draft.baselineValues?.cholesterol ?? ""}
                      onChange={(event) => updateBaseline("cholesterol", toNumber(event.target.value))}
                    />
                  </Field>
                </div>
              ) : null}

              {activeStep.id === "history" ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <ListEditor
                    label="Family history"
                    values={draft.familyHistory}
                    onChange={(values) => updateDraft("familyHistory", values)}
                    placeholder="Add a condition"
                    helper="Add major family history items, or leave it empty if none apply."
                  />
                  <ListEditor
                    label="Existing conditions"
                    values={draft.existingConditions}
                    onChange={(values) => updateDraft("existingConditions", values)}
                    placeholder="Add an existing condition"
                    helper="Examples: asthma, fatty liver, hypertension."
                  />
                  <ListEditor
                    label="Allergies"
                    values={draft.allergies}
                    onChange={(values) => updateDraft("allergies", values)}
                    placeholder="Add an allergy"
                    helper="Food, medication, and environmental allergies can all go here."
                  />
                  <ListEditor
                    label="Medications"
                    values={draft.medications}
                    onChange={(values) => updateDraft("medications", values)}
                    placeholder="Add a medication"
                    helper="Add active medications, or leave the section empty if none are relevant."
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-black/5 pt-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {saveState === "saved" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                {saveState === "error" ? <AlertCircle className="h-4 w-4 text-red-600" /> : null}
                {saveState === "saving" ? <Save className="h-4 w-4 text-gray-600" /> : null}
                <span>
                  {saveState === "saving"
                    ? "Saving your baseline..."
                    : saveState === "saved"
                      ? "Saved to your health profile."
                      : saveState === "error"
                        ? "Fix the highlighted fields or retry saving."
                        : "Move step by step. Nothing is lost if you pause and come back."}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => void persistDraft(stepIndex + 1)} disabled={saveState === "saving"}>
                  Save progress
                </Button>
                <Button type="button" variant="outline" onClick={handleBack} disabled={stepIndex === 0 || saveState === "saving"}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                {stepIndex < ONBOARDING_STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext} disabled={saveState === "saving"}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleComplete} disabled={saveState === "saving"}>
                    {saveState === "saving" ? "Finishing onboarding..." : "Complete onboarding"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  error,
  options,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} error={error}>
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
    </Field>
  );
}
