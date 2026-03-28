import { NextResponse } from "next/server";

import { buildAssessmentExplanation } from "@/lib/assessment-explainer";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      assessmentId?: string;
      assessmentType: string;
      predictionLabel: string;
      probability: number;
      riskLevel: string;
      factors: string[];
      recommendation: string;
    };

    const result = buildAssessmentExplanation({
      assessmentType: payload.assessmentType,
      predictionLabel: payload.predictionLabel,
      probability: payload.probability,
      riskLevel: payload.riskLevel as "Low" | "Moderate" | "High",
      factors: payload.factors,
      recommendation: payload.recommendation,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        explanation: "AI explanation is currently unavailable.",
        nextSteps: [],
        unavailableReason: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
