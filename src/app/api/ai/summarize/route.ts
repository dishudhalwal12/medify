import { NextResponse } from "next/server";

import { summarizeRecordWithGemini } from "@/services/gemini.server";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      uploadId: string;
      text: string;
      category: "lab-report" | "prescription" | "xray" | "other";
    };

    const result = await summarizeRecordWithGemini(payload);
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
