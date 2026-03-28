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

async function runPythonCommand(args: string[]) {
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
  const output = await runPythonCommand(["health"]);
  return JSON.parse(output) as { status: string };
}

export async function getMlModelStatus() {
  const output = await runPythonCommand(["models-status"]);
  return JSON.parse(output) as {
    models: Array<Record<string, unknown>>;
  };
}

export async function runMlPrediction(moduleName: string, payload: Record<string, unknown>) {
  const output = await runPythonCommand(["predict", moduleName, JSON.stringify(payload)]);
  return JSON.parse(output) as Record<string, unknown>;
}
