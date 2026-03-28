import { MedicalExplanationResult, RiskLevel } from "@/types";

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildFactorPhrase(factors: string[]) {
  const clean = factors
    .map((factor) => factor.split(":")[0]?.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (clean.length === 0) {
    return "a few of the numbers entered";
  }

  if (clean.length === 1) {
    return clean[0];
  }

  if (clean.length === 2) {
    return `${clean[0]} and ${clean[1]}`;
  }

  return `${clean[0]}, ${clean[1]}, and ${clean[2]}`;
}

function buildModulePhrase(assessmentType: string) {
  switch (assessmentType) {
    case "heart":
      return "heart-related";
    case "diabetes":
      return "blood-sugar";
    case "kidney":
      return "kidney-related";
    case "liver":
      return "liver-related";
    case "xray":
      return "chest imaging";
    default:
      return titleCase(assessmentType).toLowerCase();
  }
}

function buildExplanation({
  assessmentType,
  probability,
  riskLevel,
  factors,
}: {
  assessmentType: string;
  probability: number;
  riskLevel: RiskLevel;
  factors: string[];
}) {
  const percent = `${(probability * 100).toFixed(1)}%`;
  const factorPhrase = buildFactorPhrase(factors);
  const modulePhrase = buildModulePhrase(assessmentType);

  if (riskLevel === "High") {
    return `This result needs attention. It doesn't prove that you have a condition, but it does mean your ${modulePhrase} result is landing close to higher-risk cases in the training data, with an estimated chance around ${percent}. The biggest things pushing this result up were ${factorPhrase}. Please don't panic, but don't brush it off either. If you're having symptoms right now or you're feeling worse, talk to a doctor as soon as you can.`;
  }

  if (riskLevel === "Moderate") {
    return `This result is not an emergency by itself, but it is something to take seriously. Your ${modulePhrase} assessment came back in the middle range, with an estimated chance around ${percent}. The main values influencing that result were ${factorPhrase}. Think of this as a sign to check in, ask questions, and make sure a clinician reviews the full picture instead of relying on this score alone.`;
  }

  return `This result looks more reassuring. Your ${modulePhrase} assessment is leaning toward the lower-risk side, with an estimated chance around ${percent}. The values that stood out most in the calculation were ${factorPhrase}, but overall the pattern did not strongly match higher-risk cases. That said, this is still only a screening result, so if you have ongoing symptoms or personal concerns, it's completely reasonable to discuss it with a doctor.`;
}

function buildNextSteps({
  assessmentType,
  riskLevel,
  recommendation,
}: {
  assessmentType: string;
  riskLevel: RiskLevel;
  recommendation: string;
}) {
  const moduleLabel = titleCase(assessmentType);

  if (riskLevel === "High") {
    return [
      `Arrange a doctor visit soon and show them this ${moduleLabel} result.`,
      "If you have worrying symptoms right now, get urgent medical help instead of waiting.",
      recommendation || "Use this result as a reason to get a proper clinical review quickly.",
    ];
  }

  if (riskLevel === "Moderate") {
    return [
      `Book a follow-up and review this ${moduleLabel} result with a clinician.`,
      "Compare this result with your symptoms, past reports, and any recent lab values.",
      recommendation || "Ask what follow-up tests or checks would make sense next.",
    ];
  }

  return [
    "Keep this result for your records in case you need it later.",
    "If symptoms continue or something feels off, get medical advice anyway.",
    recommendation || "Use the result as one signal, not the final word on your health.",
  ];
}

export function buildAssessmentExplanation(payload: {
  assessmentType: string;
  predictionLabel: string;
  probability: number;
  riskLevel: RiskLevel;
  factors: string[];
  recommendation: string;
}): MedicalExplanationResult {
  return {
    explanation: buildExplanation(payload),
    nextSteps: buildNextSteps(payload),
  };
}
