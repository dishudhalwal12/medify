export type DiseaseSlug = "diabetes" | "heart-disease" | "liver-disorder";

export type SymptomDefinition = {
  id: string;
  label: string;
  weight: number;
  aliases: string[];
};

export type DiseaseDefinition = {
  id: DiseaseSlug;
  name: string;
  tagline: string;
  description: string;
  highlight: string;
  caution: string;
  nextSteps: string[];
  symptoms: SymptomDefinition[];
};

export const DISEASE_PROFILES: DiseaseDefinition[] = [
  {
    id: "diabetes",
    name: "Diabetes Risk",
    tagline: "Glucose and insulin-related warning pattern",
    description:
      "Use this when the patient suspects high blood sugar, uncontrolled glucose, or classic metabolic symptoms.",
    highlight: "Useful for thirst, fatigue, blurred vision, and slow recovery signs.",
    caution: "This screen estimates likelihood from reported symptoms. Lab values and clinician review still matter.",
    nextSteps: [
      "Review recent glucose, HbA1c, and medication history.",
      "Escalate promptly if symptoms are worsening or the patient feels faint.",
      "Pair with the diabetes assessment when lab values are available.",
    ],
    symptoms: [
      { id: "thirst", label: "Increased thirst", weight: 16, aliases: ["thirst", "very thirsty", "dry mouth"] },
      { id: "urination", label: "Frequent urination", weight: 16, aliases: ["urination", "urinate", "peeing often", "frequent pee"] },
      { id: "fatigue", label: "Unusual fatigue", weight: 10, aliases: ["fatigue", "tired", "weakness", "low energy"] },
      { id: "blurred-vision", label: "Blurred vision", weight: 12, aliases: ["blurred vision", "blurry vision"] },
      { id: "weight-loss", label: "Unexpected weight loss", weight: 12, aliases: ["weight loss", "losing weight"] },
      { id: "slow-healing", label: "Slow wound healing", weight: 12, aliases: ["slow healing", "cuts not healing", "wound healing"] },
      { id: "tingling", label: "Tingling in hands or feet", weight: 10, aliases: ["tingling", "numbness", "pins and needles"] },
      { id: "infections", label: "Repeated skin or urinary infections", weight: 12, aliases: ["infection", "uti", "urinary infection", "skin infection"] },
    ],
  },
  {
    id: "heart-disease",
    name: "Heart Disease Risk",
    tagline: "Cardiovascular warning pattern",
    description:
      "Use this when the patient is concerned about circulation, exertion-related symptoms, or chest discomfort.",
    highlight: "Best for chest pain, breathlessness, exercise intolerance, and swelling-related concerns.",
    caution: "Chest pain, breathlessness at rest, or heavy sweating should not wait for a UI result.",
    nextSteps: [
      "Review blood pressure, ECG history, and family history.",
      "Escalate urgently for severe chest pain, fainting, or symptoms at rest.",
      "Move into the heart assessment if structured clinical values are available.",
    ],
    symptoms: [
      { id: "chest-pain", label: "Chest pain or pressure", weight: 18, aliases: ["chest pain", "chest pressure", "tight chest"] },
      { id: "shortness-breath", label: "Shortness of breath", weight: 16, aliases: ["shortness of breath", "breathless", "difficulty breathing"] },
      { id: "exertion-fatigue", label: "Fatigue during activity", weight: 12, aliases: ["fatigue on walking", "tired on stairs", "exercise fatigue"] },
      { id: "palpitations", label: "Irregular heartbeat or palpitations", weight: 12, aliases: ["palpitations", "irregular heartbeat", "racing heart"] },
      { id: "dizziness", label: "Dizziness or light-headedness", weight: 10, aliases: ["dizziness", "light headed", "lightheaded"] },
      { id: "swelling", label: "Swelling in legs or ankles", weight: 10, aliases: ["leg swelling", "ankle swelling", "swelling feet"] },
      { id: "radiating-pain", label: "Pain radiating to arm, shoulder, or jaw", weight: 16, aliases: ["jaw pain", "arm pain", "shoulder pain"] },
      { id: "cold-sweat", label: "Cold sweat or nausea with discomfort", weight: 14, aliases: ["cold sweat", "nausea", "sweating"] },
    ],
  },
  {
    id: "liver-disorder",
    name: "Liver Disorder Risk",
    tagline: "Liver function warning pattern",
    description:
      "Use this when the patient is worried about jaundice, abdominal discomfort, appetite loss, or abnormal liver indicators.",
    highlight: "Designed for symptom-first screening before moving into the liver module.",
    caution: "Yellowing of the eyes, confusion, or abdominal swelling deserves rapid clinical review.",
    nextSteps: [
      "Check bilirubin, enzyme markers, and any known hepatitis or alcohol history.",
      "Review recent appetite change, abdominal symptoms, and urine or stool color.",
      "Open the liver assessment when lab values are available.",
    ],
    symptoms: [
      { id: "jaundice", label: "Yellow eyes or skin", weight: 18, aliases: ["yellow eyes", "yellow skin", "jaundice"] },
      { id: "abdominal-pain", label: "Right upper abdominal pain", weight: 14, aliases: ["upper abdominal pain", "right side pain", "abdominal pain"] },
      { id: "abdominal-swelling", label: "Abdominal swelling or bloating", weight: 12, aliases: ["abdominal swelling", "bloating", "swollen stomach"] },
      { id: "dark-urine", label: "Dark urine", weight: 12, aliases: ["dark urine", "tea colored urine"] },
      { id: "pale-stools", label: "Pale stools", weight: 12, aliases: ["pale stool", "light stool"] },
      { id: "appetite-loss", label: "Loss of appetite or nausea", weight: 10, aliases: ["loss of appetite", "nausea", "can't eat"] },
      { id: "itching", label: "Itchy skin", weight: 8, aliases: ["itching", "itchy skin"] },
      { id: "liver-fatigue", label: "Persistent fatigue", weight: 10, aliases: ["fatigue", "weakness", "tired all the time"] },
    ],
  },
];

export type SymptomLikelihoodResult = {
  disease: DiseaseDefinition;
  probability: number;
  band: "Low watch" | "Moderate watch" | "High attention";
  explanation: string;
  matchedSymptoms: SymptomDefinition[];
  noteMatches: SymptomDefinition[];
  missingSignals: SymptomDefinition[];
  confidenceLabel: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getDiseaseProfile(id: DiseaseSlug) {
  return DISEASE_PROFILES.find((profile) => profile.id === id) ?? DISEASE_PROFILES[0];
}

export function inferSymptomLikelihood(input: {
  diseaseId: DiseaseSlug;
  selectedSymptoms: string[];
  notes: string;
}): SymptomLikelihoodResult {
  const disease = getDiseaseProfile(input.diseaseId);
  const normalizedNotes = input.notes.toLowerCase();

  const noteMatches = disease.symptoms.filter((symptom) =>
    symptom.aliases.some((alias) => normalizedNotes.includes(alias))
  );

  const matchedIds = new Set([...input.selectedSymptoms, ...noteMatches.map((symptom) => symptom.id)]);
  const matchedSymptoms = disease.symptoms.filter((symptom) => matchedIds.has(symptom.id));
  const totalWeight = disease.symptoms.reduce((sum, symptom) => sum + symptom.weight, 0);
  const matchedWeight = matchedSymptoms.reduce((sum, symptom) => sum + symptom.weight, 0);
  const coverage = totalWeight === 0 ? 0 : matchedWeight / totalWeight;
  const strongSignals = matchedSymptoms.filter((symptom) => symptom.weight >= 14).length;

  const probability =
    matchedSymptoms.length === 0
      ? 8
      : clamp(Math.round(12 + coverage * 70 + strongSignals * 4 + Math.min(input.selectedSymptoms.length, 4)), 12, 94);

  const band =
    probability >= 70 ? "High attention" : probability >= 40 ? "Moderate watch" : "Low watch";

  const confidenceLabel =
    matchedSymptoms.length >= 5
      ? "Stronger match across multiple symptoms"
      : matchedSymptoms.length >= 3
        ? "Useful early pattern match"
        : "Preliminary symptom signal";

  const missingSignals = disease.symptoms
    .filter((symptom) => !matchedIds.has(symptom.id))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  const explanation =
    matchedSymptoms.length === 0
      ? `Select symptoms or describe them in notes to estimate how closely the reported pattern matches ${disease.name.toLowerCase()}.`
      : `The current estimate is driven mainly by ${matchedSymptoms
          .slice(0, 3)
          .map((symptom) => symptom.label.toLowerCase())
          .join(", ")}. This gives an early indication of how closely the reported symptoms align with a ${disease.name.toLowerCase()} pattern.`;

  return {
    disease,
    probability,
    band,
    explanation,
    matchedSymptoms,
    noteMatches,
    missingSignals,
    confidenceLabel,
  };
}
