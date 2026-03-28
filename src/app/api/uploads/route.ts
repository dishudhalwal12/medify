import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const PUBLIC_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public");
const LOCAL_UPLOAD_ROOT = path.join(PUBLIC_DIR, "local-uploads");

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "file";
}

function assertSafeRelativePath(relativePath: string) {
  const normalized = relativePath.replace(/^\/+/, "");
  if (!normalized.startsWith("local-uploads/")) {
    throw new Error("Invalid upload path.");
  }

  const absolutePath = path.join(PUBLIC_DIR, normalized);
  if (!absolutePath.startsWith(LOCAL_UPLOAD_ROOT)) {
    throw new Error("Upload path escapes the local upload directory.");
  }

  return { normalized, absolutePath };
}

function contentTypeFromPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const desiredPath = String(formData.get("path") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
  }

  if (!desiredPath) {
    return NextResponse.json({ error: "Missing upload path." }, { status: 400 });
  }

  try {
    const sanitizedPath = desiredPath
      .split("/")
      .map((segment) => sanitizeSegment(segment))
      .join("/");

    const relativePath = `local-uploads/${sanitizedPath}`;
    const absolutePath = path.join(PUBLIC_DIR, relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, bytes);

    const downloadUrl = `/api/uploads?path=${encodeURIComponent(`local://${relativePath}`)}`;

    return NextResponse.json({
      storagePath: `local://${relativePath}`,
      downloadUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save local upload." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storagePath = searchParams.get("path");

  if (!storagePath) {
    return NextResponse.json({ error: "Missing path parameter." }, { status: 400 });
  }

  try {
    const relativePath = storagePath.startsWith("local://")
      ? storagePath.slice("local://".length)
      : storagePath;

    const { absolutePath, normalized } = assertSafeRelativePath(relativePath);
    const fileBuffer = await readFile(absolutePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFromPath(normalized),
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read local upload." },
      { status: 404 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const storagePath = searchParams.get("path");

  if (!storagePath) {
    return NextResponse.json({ error: "Missing path parameter." }, { status: 400 });
  }

  try {
    const relativePath = storagePath.startsWith("local://")
      ? storagePath.slice("local://".length)
      : storagePath;

    const { absolutePath } = assertSafeRelativePath(relativePath);
    await unlink(absolutePath);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete local upload." },
      { status: 500 }
    );
  }
}
