import { NextResponse } from "next/server";

import { buildRecordSummary } from "@/lib/record-summarizer";
import { summarizeRecordWithGemini } from "@/services/gemini.server";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      uploadId: string;
      text: string;
      category: "lab-report" | "prescription" | "xray" | "other";
    };

    const result = process.env.GEMINI_API_KEY
      ? await summarizeRecordWithGemini(payload)
      : buildRecordSummary(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        explanation: "AI record summary is currently unavailable.",
        nextSteps: [],
        unavailableReason: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
