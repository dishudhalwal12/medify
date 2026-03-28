import { NextResponse } from "next/server";

import { getMlHealth } from "@/lib/ml-runtime";

export const runtime = "nodejs";

export async function GET() {
  try {
    const payload = await getMlHealth();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "ML health check failed.",
      },
      { status: 500 }
    );
  }
}
