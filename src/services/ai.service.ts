import { MedicalExplanationResult, RecordSummaryPayload } from "@/types";

async function postJson<TInput, TOutput>(path: string, body: TInput): Promise<TOutput> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as TOutput & {
    explanation?: string;
    unavailableReason?: string;
  };

  if (!response.ok) {
    throw new Error(payload.unavailableReason || payload.explanation || "AI assistance is currently unavailable.");
  }

  return payload;
}

class AIService {
  explainAssessment(input: {
    assessmentId?: string;
    assessmentType: string;
    predictionLabel: string;
    probability: number;
    riskLevel: string;
    factors: string[];
    recommendation: string;
  }) {
    return postJson<typeof input, MedicalExplanationResult>("/api/ai/explain", input);
  }

  summarizeRecord(payload: RecordSummaryPayload) {
    return postJson<RecordSummaryPayload, MedicalExplanationResult>("/api/ai/summarize", payload);
  }
}

export const aiService = new AIService();
