import { NextResponse } from "next/server";

import { runMlPrediction } from "@/lib/ml-runtime";

export const runtime = "nodejs";

const ALLOWED_MODULES = new Set(["diabetes", "heart", "kidney", "liver", "xray"]);

export async function POST(
  request: Request,
  context: { params: Promise<{ module: string }> }
) {
  const { module } = await context.params;

  if (!ALLOWED_MODULES.has(module)) {
    return NextResponse.json(
      { error: `Unsupported module: ${module}` },
      { status: 404 }
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await runMlPrediction(module, payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        predictionLabel: `${module} prediction failed`,
        probability: 0,
        confidenceScore: 0,
        riskLevel: "Low",
        contributingFactors: [],
        recommendation:
          error instanceof Error
            ? error.message
            : "The local ML prediction route failed.",
        modelName: module,
        modelVersion: "error",
        warnings: [],
      },
      { status: 500 }
    );
  }
}
