import { HealthProfile, ProfileCompletion } from "@/types";

export const DEFAULT_PROFILE_FIELDS: Pick<
  HealthProfile,
  | "smokingStatus"
  | "alcoholUse"
  | "activityLevel"
  | "sleepPattern"
  | "familyHistory"
  | "existingConditions"
  | "allergies"
  | "medications"
  | "baselineValues"
  | "emergencyNote"
> = {
  smokingStatus: "never",
  alcoholUse: "none",
  activityLevel: "moderate",
  sleepPattern: "fair",
  familyHistory: [],
  existingConditions: [],
  allergies: [],
  medications: [],
  baselineValues: {},
  emergencyNote: "",
};

const PROFILE_FIELDS: Array<keyof HealthProfile | `baselineValues.${string}`> = [
  "fullName",
  "age",
  "gender",
  "height",
  "weight",
  "bloodGroup",
  "smokingStatus",
  "alcoholUse",
  "activityLevel",
  "sleepPattern",
  "baselineValues.systolicBP",
  "baselineValues.diastolicBP",
  "baselineValues.fastingGlucose",
  "baselineValues.cholesterol",
];

export const ONBOARDING_STEPS = [
  {
    id: "identity",
    title: "Identity",
    description: "The demographic and physical values that power the rest of the workspace.",
    fields: ["fullName", "age", "gender", "height", "weight", "bloodGroup"] as const,
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    description: "Daily habits used by your lifestyle score and recommendation logic.",
    fields: ["smokingStatus", "alcoholUse", "activityLevel", "sleepPattern"] as const,
  },
  {
    id: "baseline",
    title: "Baseline values",
    description: "Blood pressure and core lab values used by the dashboard, insights, and history views.",
    fields: [
      "baselineValues.systolicBP",
      "baselineValues.diastolicBP",
      "baselineValues.fastingGlucose",
      "baselineValues.cholesterol",
    ] as const,
  },
  {
    id: "history",
    title: "History",
    description: "Keep relevant history on file, or leave the list empty when nothing applies yet.",
    fields: ["familyHistory", "existingConditions", "allergies", "medications"] as const,
  },
] as const;

export const REQUIRED_ONBOARDING_FIELDS: Array<(typeof ONBOARDING_STEPS)[number]["fields"][number]> = [
  "fullName",
  "age",
  "gender",
  "height",
  "weight",
  "bloodGroup",
  "smokingStatus",
  "alcoholUse",
  "activityLevel",
  "sleepPattern",
  "baselineValues.systolicBP",
  "baselineValues.diastolicBP",
  "baselineValues.fastingGlucose",
  "baselineValues.cholesterol",
];

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}

export function createDefaultProfile(uid = "", fullName = ""): HealthProfile {
  return {
    uid,
    fullName,
    ...DEFAULT_PROFILE_FIELDS,
    updatedAt: new Date().toISOString(),
  };
}

export function mergeProfileWithDefaults(
  profile: Partial<HealthProfile> | null | undefined,
  fallback: { uid?: string; fullName?: string } = {}
): HealthProfile {
  return {
    ...createDefaultProfile(fallback.uid, fallback.fullName),
    ...(profile || {}),
    uid: profile?.uid || fallback.uid || "",
    fullName: profile?.fullName || fallback.fullName || "",
    familyHistory: profile?.familyHistory || [],
    existingConditions: profile?.existingConditions || [],
    allergies: profile?.allergies || [],
    medications: profile?.medications || [],
    baselineValues: profile?.baselineValues || {},
  };
}

export function getMissingProfileFields(
  profile: HealthProfile | null,
  fields: Array<keyof HealthProfile | `baselineValues.${string}`> = PROFILE_FIELDS
) {
  if (!profile) {
    return [...fields];
  }

  return fields.filter((field) => {
    if (field.startsWith("baselineValues.")) {
      const key = field.replace("baselineValues.", "") as keyof HealthProfile["baselineValues"];
      return !hasValue(profile.baselineValues?.[key]);
    }

    return !hasValue(profile[field as keyof HealthProfile]);
  });
}

export function getProfileCompletion(profile: HealthProfile | null): ProfileCompletion {
  const missing = getMissingProfileFields(profile);

  const completedFields = PROFILE_FIELDS.length - missing.length;

  return {
    completedFields,
    totalFields: PROFILE_FIELDS.length,
    percentage: Math.round((completedFields / PROFILE_FIELDS.length) * 100),
    missing,
  };
}

export function getOnboardingProgress(profile: HealthProfile | null) {
  const missing = getMissingProfileFields(profile, [...REQUIRED_ONBOARDING_FIELDS]);
  const completedFields = REQUIRED_ONBOARDING_FIELDS.length - missing.length;

  return {
    completedFields,
    totalFields: REQUIRED_ONBOARDING_FIELDS.length,
    percentage: Math.round((completedFields / REQUIRED_ONBOARDING_FIELDS.length) * 100),
    missing,
  };
}

export function isOnboardingComplete(profile: HealthProfile | null) {
  return getOnboardingProgress(profile).missing.length === 0;
}
