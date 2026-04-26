import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PYTHON_CANDIDATES = [
  process.env.SYMPTORA_PYTHON_BIN,
  "/usr/local/bin/python3",
  "python3",
].filter((value): value is string => Boolean(value));

const CLI_SCRIPT = path.join(process.cwd(), "ml-api", "scripts", "predict_cli.py");
const EXTERNAL_ML_API_URL = process.env.ML_API_URL?.replace(/\/$/, "");

async function fetchExternalMl(pathname: string, init?: RequestInit) {
  if (!EXTERNAL_ML_API_URL) {
    return null;
  }

  const response = await fetch(`${EXTERNAL_ML_API_URL}${pathname}`, init);

  if (!response.ok) {
    throw new Error(`External ML API failed with ${response.status}.`);
  }

  return response.json() as Promise<unknown>;
}

function assertLocalMlRuntimeAvailable() {
  if (process.env.VERCEL && !EXTERNAL_ML_API_URL) {
    throw new Error(
      "ML_API_URL is not configured. On Vercel, deploy the Python ML API separately and add its base URL as ML_API_URL."
    );
  }
}

async function runPythonCommand(args: string[]) {
  assertLocalMlRuntimeAvailable();
  let lastError: unknown;

  for (const pythonBin of PYTHON_CANDIDATES) {
    try {
      const { stdout } = await execFileAsync(pythonBin, [CLI_SCRIPT, ...args], {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 8,
      });

      return stdout.trim();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to execute the Python ML runtime.");
}

export async function getMlHealth() {
  const external = await fetchExternalMl("/health");
  if (external) {
    return external as { status: string };
  }

  const output = await runPythonCommand(["health"]);
  return JSON.parse(output) as { status: string };
}

export async function getMlModelStatus() {
  const external = await fetchExternalMl("/models/status");
  if (external) {
    return external as { models: Array<Record<string, unknown>> };
  }

  const output = await runPythonCommand(["models-status"]);
  return JSON.parse(output) as {
    models: Array<Record<string, unknown>>;
  };
}

export async function runMlPrediction(moduleName: string, payload: Record<string, unknown>) {
  const external = await fetchExternalMl(`/predict/${moduleName}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (external) {
    return external as Record<string, unknown>;
  }

  const output = await runPythonCommand(["predict", moduleName, JSON.stringify(payload)]);
  return JSON.parse(output) as Record<string, unknown>;
}
