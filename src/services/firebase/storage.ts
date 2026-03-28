async function uploadFileLocally(path: string, file: File) {
  const formData = new FormData();
  formData.append("path", path);
  formData.append("file", file);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as {
    storagePath?: string;
    downloadUrl?: string;
    error?: string;
  };

  if (!response.ok || !payload.storagePath || !payload.downloadUrl) {
    throw new Error(payload.error || "Local upload failed.");
  }

  return payload;
}

async function removeLocalFile(path: string) {
  const response = await fetch(`/api/uploads?path=${encodeURIComponent(path)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: "Local delete failed." }))) as {
      error?: string;
    };
    throw new Error(payload.error || "Local delete failed.");
  }
}

export async function uploadFileToStorage(
  path: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  onProgress?.(15);
  const result = await uploadFileLocally(path, file);
  onProgress?.(100);
  return result;
}

export async function removeFileFromStorage(path: string) {
  await removeLocalFile(path);
}
