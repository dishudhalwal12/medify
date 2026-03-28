import { NextResponse } from "next/server";

import { getMlModelStatus } from "@/lib/ml-runtime";

export const runtime = "nodejs";

export async function GET() {
  try {
    const payload = await getMlModelStatus();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        models: [],
        error: error instanceof Error ? error.message : "Model status check failed.",
      },
      { status: 500 }
    );
  }
}
