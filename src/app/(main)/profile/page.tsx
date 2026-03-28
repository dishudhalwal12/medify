"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Droplets, HeartPulse, ShieldPlus } from "lucide-react";

import { ListEditor } from "@/components/profile/ListEditor";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecoveryState } from "@/components/ui/recovery-state";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from "@/lib/assessment-options";
import { getProfileCompletion, mergeProfileWithDefaults } from "@/lib/profile";
import { getProfileService } from "@/services/loaders";
import { HealthProfile } from "@/types";

type SaveState = "idle" | "saving" | "saved" | "error";
type ValidationErrors = Partial<Record<string, string>>;

function toNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  return Number(value);
}

function validateProfile(profile: HealthProfile) {
  const errors: ValidationErrors = {};

  if (!profile.fullName.trim()) errors.fullName = "Full name is required.";
  if (profile.age !== undefined && (profile.age < 1 || profile.age > 120)) errors.age = "Age should be between 1 and 120.";
  if (profile.height !== undefined && (profile.height < 50 || profile.height > 260)) errors.height = "Height should be between 50 and 260 cm.";
  if (profile.weight !== undefined && (profile.weight < 20 || profile.weight > 400)) errors.weight = "Weight should be between 20 and 400 kg.";

  const { systolicBP, diastolicBP, fastingGlucose, cholesterol } = profile.baselineValues || {};
  if (systolicBP !== undefined && (systolicBP < 60 || systolicBP > 260)) errors["baselineValues.systolicBP"] = "Systolic BP should be between 60 and 260.";
  if (diastolicBP !== undefined && (diastolicBP < 40 || diastolicBP > 180)) errors["baselineValues.diastolicBP"] = "Diastolic BP should be between 40 and 180.";
  if (fastingGlucose !== undefined && (fastingGlucose < 40 || fastingGlucose > 400)) errors["baselineValues.fastingGlucose"] = "Fasting glucose should be between 40 and 400.";
  if (cholesterol !== undefined && (cholesterol < 80 || cholesterol > 400)) errors["baselineValues.cholesterol"] = "Cholesterol should be between 80 and 400.";

  return errors;
}

function metricCard(label: string, value: string, helper: string, tone?: "ink" | "accent") {
  return (
    <Card className={`${tone === "ink" ? "ink-panel text-white" : "shell-card"} border-0 p-5`}>
      <p className={`text-xs uppercase tracking-[0.28em] ${tone === "ink" ? "text-white/55" : "text-gray-400"}`}>
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold ${tone === "ink" ? "text-white" : "text-gray-950"}`}>{value}</p>
      <p className={`mt-2 text-sm leading-6 ${tone === "ink" ? "text-white/72" : "text-gray-600"}`}>{helper}</p>
    </Card>
  );
}

export default function ProfilePage() {
  const { user, profile, profileError, refreshProfile } = useAuth();
  const [draftOverride, setDraftOverride] = useState<HealthProfile | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const baseProfile = useMemo(
    () => (user && profile ? mergeProfileWithDefaults(profile, { uid: user.uid, fullName: user.fullName }) : null),
    [profile, user]
  );
  const draft = draftOverride?.uid === user?.uid ? draftOverride : baseProfile;

  const completion = useMemo(() => getProfileCompletion(draft), [draft]);
  const bmi =
    draft?.height && draft.weight
      ? (draft.weight / ((draft.height / 100) * (draft.height / 100))).toFixed(1)
      : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !draft) {
      return;
    }

    const errors = validateProfile(draft);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSaveState("error");
      setSaveError("Fix the highlighted fields before saving your profile.");
      return;
    }

    setSaveState("saving");
    setSaveError(null);

    try {
      const profileService = await getProfileService();
      const updated = await profileService.updateProfile(user.uid, {
        ...draft,
        uid: user.uid,
      });
      setDraftOverride(mergeProfileWithDefaults(updated, { uid: user.uid, fullName: draft.fullName }));
      setSaveState("saved");
      await refreshProfile();
    } catch (error) {
      setSaveState("error");
      setSaveError(error instanceof Error ? error.message : "We could not save your profile right now.");
    }
  }

  function updateDraft<K extends keyof HealthProfile>(key: K, value: HealthProfile[K]) {
    setDraftOverride((current) => {
      const source = current?.uid === user?.uid ? current : baseProfile;
      return source ? { ...source, [key]: value } : current;
    });
  }

  if (!user || !draft) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Profile unavailable"
        description="We could not load your health profile right now."
        actionLabel="Retry"
        onAction={() => void refreshProfile()}
      />
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Health profile"
        title="Manage the baseline behind every assessment"
        description="Your profile is the long-form health record that keeps scores, recommendations, and saved results grounded in your actual baseline."
      />

      {profileError ? (
        <div className="mb-4">
          <RecoveryState
            title="Profile sync is currently degraded"
            description={profileError}
            actionLabel="Retry profile sync"
            onAction={() => void refreshProfile()}
          />
        </div>
      ) : null}

      {saveError ? (
        <div className="mb-4">
          <RecoveryState
            title="Profile changes were not saved"
            description={saveError}
            actionLabel="Retry save"
            onAction={() => {
              const form = document.getElementById("profile-form") as HTMLFormElement | null;
              form?.requestSubmit();
            }}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        {metricCard(
          "Profile completeness",
          `${completion.percentage}%`,
          `${completion.completedFields}/${completion.totalFields} baseline fields are currently on file.`,
          "ink"
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {metricCard("Body mass index", bmi || "Pending", "Calculated from the saved height and weight values.")}
          {metricCard(
            "Lifestyle snapshot",
            `${draft.activityLevel || "moderate"}`,
            `Smoking: ${draft.smokingStatus || "never"} · Sleep: ${draft.sleepPattern || "fair"}`
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {saveState === "saved" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
        {saveState === "error" ? <AlertCircle className="h-4 w-4 text-red-500" /> : null}
        <p className="text-sm text-gray-600">
          {saveState === "saving"
            ? "Saving profile updates..."
            : saveState === "saved"
              ? "Profile saved successfully."
              : "Keep this baseline current so saved assessments stay clinically honest."}
        </p>
      </div>

      <form id="profile-form" className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Card className="shell-card border-0 p-6">
          <div className="flex items-center gap-3">
            <ShieldPlus className="h-5 w-5 text-gray-950" />
            <div>
              <h3 className="text-xl font-semibold text-gray-950">Identity and physical baseline</h3>
              <p className="mt-1 text-sm leading-7 text-gray-600">
                Review the details that shape your scores, chart context, and first-line recommendations.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Full name" error={validationErrors.fullName}>
              <Input value={draft.fullName} onChange={(event) => updateDraft("fullName", event.target.value)} />
            </Field>
            <Field label="Age" error={validationErrors.age}>
              <Input type="number" value={draft.age ?? ""} onChange={(event) => updateDraft("age", toNumber(event.target.value))} />
            </Field>
            <Field label="Gender">
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
            <Field label="Blood group">
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
            <Field label="Height (cm)" error={validationErrors.height}>
              <Input type="number" value={draft.height ?? ""} onChange={(event) => updateDraft("height", toNumber(event.target.value))} />
            </Field>
            <Field label="Weight (kg)" error={validationErrors.weight}>
              <Input type="number" value={draft.weight ?? ""} onChange={(event) => updateDraft("weight", toNumber(event.target.value))} />
            </Field>
            <Field label="Emergency note" className="md:col-span-2 xl:col-span-2">
              <Textarea
                rows={4}
                value={draft.emergencyNote || ""}
                onChange={(event) => updateDraft("emergencyNote", event.target.value || undefined)}
                placeholder="Anything clinicians should know quickly in an urgent review."
              />
            </Field>
          </div>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
          <Card className="shell-card border-0 p-6">
            <div className="flex items-center gap-3">
              <HeartPulse className="h-5 w-5 text-gray-950" />
              <div>
                <h3 className="text-xl font-semibold text-gray-950">Lifestyle markers</h3>
                <p className="mt-1 text-sm leading-7 text-gray-600">
                  These fields feed the lifestyle score and keep the dashboard honest about what it knows.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <SelectField
                label="Smoking status"
                value={draft.smokingStatus || "never"}
                onChange={(value) => updateDraft("smokingStatus", value as HealthProfile["smokingStatus"])}
                options={[
                  { value: "never", label: "Never" },
                  { value: "former", label: "Former" },
                  { value: "occasional", label: "Occasional" },
                  { value: "frequent", label: "Frequent" },
                ]}
              />
              <SelectField
                label="Alcohol use"
                value={draft.alcoholUse || "none"}
                onChange={(value) => updateDraft("alcoholUse", value as HealthProfile["alcoholUse"])}
                options={[
                  { value: "none", label: "None" },
                  { value: "social", label: "Social" },
                  { value: "weekly", label: "Weekly" },
                  { value: "frequent", label: "Frequent" },
                ]}
              />
              <SelectField
                label="Activity level"
                value={draft.activityLevel || "moderate"}
                onChange={(value) => updateDraft("activityLevel", value as HealthProfile["activityLevel"])}
                options={[
                  { value: "low", label: "Low" },
                  { value: "moderate", label: "Moderate" },
                  { value: "high", label: "High" },
                ]}
              />
              <SelectField
                label="Sleep pattern"
                value={draft.sleepPattern || "fair"}
                onChange={(value) => updateDraft("sleepPattern", value as HealthProfile["sleepPattern"])}
                options={[
                  { value: "poor", label: "Poor" },
                  { value: "fair", label: "Fair" },
                  { value: "good", label: "Good" },
                ]}
              />
            </div>

            <div className="mt-6 rounded-[24px] bg-[#f7f4ef] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Completion status</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/6">
                <div className="h-full rounded-full bg-[#17181f] transition-all" style={{ width: `${completion.percentage}%` }} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <StatusPill
                  level={completion.percentage >= 80 ? "Low" : completion.percentage >= 55 ? "Moderate" : "High"}
                  label={completion.percentage >= 80 ? "Ready for assessments" : "Baseline still improving"}
                />
              </div>
            </div>
          </Card>

          <Card className="shell-card border-0 p-6">
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-gray-950" />
              <div>
                <h3 className="text-xl font-semibold text-gray-950">Medical history and baseline labs</h3>
                <p className="mt-1 text-sm leading-7 text-gray-600">
                  Keep your relevant conditions, medications, allergies, and core lab values together in one place.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Systolic BP" error={validationErrors["baselineValues.systolicBP"]}>
                <Input
                  type="number"
                  value={draft.baselineValues?.systolicBP ?? ""}
                  onChange={(event) =>
                    setDraftOverride((current) => {
                      const source = current?.uid === user?.uid ? current : baseProfile;
                      return source
                        ? {
                            ...source,
                            baselineValues: {
                              ...source.baselineValues,
                              systolicBP: toNumber(event.target.value),
                            },
                          }
                        : current;
                    })
                  }
                />
              </Field>
              <Field label="Diastolic BP" error={validationErrors["baselineValues.diastolicBP"]}>
                <Input
                  type="number"
                  value={draft.baselineValues?.diastolicBP ?? ""}
                  onChange={(event) =>
                    setDraftOverride((current) => {
                      const source = current?.uid === user?.uid ? current : baseProfile;
                      return source
                        ? {
                            ...source,
                            baselineValues: {
                              ...source.baselineValues,
                              diastolicBP: toNumber(event.target.value),
                            },
                          }
                        : current;
                    })
                  }
                />
              </Field>
              <Field label="Fasting glucose" error={validationErrors["baselineValues.fastingGlucose"]}>
                <Input
                  type="number"
                  value={draft.baselineValues?.fastingGlucose ?? ""}
                  onChange={(event) =>
                    setDraftOverride((current) => {
                      const source = current?.uid === user?.uid ? current : baseProfile;
                      return source
                        ? {
                            ...source,
                            baselineValues: {
                              ...source.baselineValues,
                              fastingGlucose: toNumber(event.target.value),
                            },
                          }
                        : current;
                    })
                  }
                />
              </Field>
              <Field label="Cholesterol" error={validationErrors["baselineValues.cholesterol"]}>
                <Input
                  type="number"
                  value={draft.baselineValues?.cholesterol ?? ""}
                  onChange={(event) =>
                    setDraftOverride((current) => {
                      const source = current?.uid === user?.uid ? current : baseProfile;
                      return source
                        ? {
                            ...source,
                            baselineValues: {
                              ...source.baselineValues,
                              cholesterol: toNumber(event.target.value),
                            },
                          }
                        : current;
                    })
                  }
                />
              </Field>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <ListEditor
                label="Family history"
                values={draft.familyHistory}
                onChange={(values) => updateDraft("familyHistory", values)}
                placeholder="Add a family history item"
                helper="Use this for major hereditary context, or leave it empty when nothing applies."
              />
              <ListEditor
                label="Existing conditions"
                values={draft.existingConditions}
                onChange={(values) => updateDraft("existingConditions", values)}
                placeholder="Add an existing condition"
                helper="Examples: hypertension, fatty liver, asthma."
              />
              <ListEditor
                label="Allergies"
                values={draft.allergies}
                onChange={(values) => updateDraft("allergies", values)}
                placeholder="Add an allergy"
                helper="Include medication, food, or environmental allergies."
              />
              <ListEditor
                label="Medications"
                values={draft.medications}
                onChange={(values) => updateDraft("medications", values)}
                placeholder="Add a medication"
                helper="Add active medications, supplements, or recurring therapies."
              />
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button size="lg" type="submit" disabled={saveState === "saving"}>
            {saveState === "saving" ? "Saving profile..." : "Save profile changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="space-y-2">
        <Label>{label}</Label>
        {children}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Field label={label}>
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
