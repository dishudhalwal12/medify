import { MedicalExplanationResult, RecordSummaryPayload } from "@/types";

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function extractHighlights(text: string) {
  return text
    .split(/[\n.]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .slice(0, 3);
}

export function buildRecordSummary(payload: RecordSummaryPayload): MedicalExplanationResult {
  const cleaned = normalizeText(payload.text);
  const highlights = extractHighlights(payload.text);
  const summaryBase =
    highlights.length > 0
      ? highlights.join(". ")
      : cleaned.slice(0, 260) || "The uploaded record did not contain enough readable text to summarize clearly.";

  const categoryLabel = payload.category.replace("-", " ");

  return {
    explanation: `This ${categoryLabel} looks like it is mainly saying: ${summaryBase}. Please treat this as a plain-language summary of the uploaded text, not a diagnosis.`,
    nextSteps: [
      "Read the original report alongside this summary so no important detail is missed.",
      "If any wording is unclear, ask your doctor or clinic to explain the result directly.",
      "Keep the file saved in Symptora so it stays linked to future assessments.",
    ],
  };
}
