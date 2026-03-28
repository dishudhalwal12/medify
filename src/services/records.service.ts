import { where } from "firebase/firestore";

import { UploadCategory, UploadRecord } from "@/types";
import {
  addDocument,
  getDocument,
  listDocuments,
  listUserDocuments,
  removeDocument,
  updateDocument,
} from "@/services/firebase/firestore";

export const STORAGE_AVAILABLE = true;

async function uploadFileToStorage(
  path: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  const formData = new FormData();
  formData.append("path", path);
  formData.append("file", file);

  onProgress?.(15);

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

  onProgress?.(100);
  return payload;
}

async function removeFileFromStorage(path: string) {
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

function getUploadFolder(category: UploadCategory) {
  switch (category) {
    case "lab-report":
      return "reports";
    case "prescription":
      return "prescriptions";
    case "xray":
      return "xrays";
    default:
      return "other";
  }
}

function sanitizeFileName(fileName: string) {
  const extensionIndex = fileName.lastIndexOf(".");
  const extension = extensionIndex >= 0 ? fileName.slice(extensionIndex) : "";
  const baseName = extensionIndex >= 0 ? fileName.slice(0, extensionIndex) : fileName;

  const safeBaseName = baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "record";

  return `${safeBaseName}${extension.toLowerCase()}`;
}

function buildStoragePath(uid: string, category: UploadCategory, fileName: string) {
  const folder = getUploadFolder(category);
  const safeName = sanitizeFileName(fileName);
  const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `users/${uid}/${folder}/${uniqueId}-${safeName}`;
}

class RecordsService {
  async getRecords(uid: string, includeArchived = false) {
    const documents = await listUserDocuments<UploadRecord>("uploads", uid, 80);
    return includeArchived ? documents : documents.filter((item) => !item.archived);
  }

  async getRecordById(id: string) {
    return getDocument<UploadRecord>("uploads", id);
  }

  async getXrayRecords(uid: string) {
    return listDocuments<UploadRecord>(
      "uploads",
      [where("uid", "==", uid), where("category", "==", "xray")],
      30
    );
  }

  async archiveRecord(id: string, archived = true) {
    await updateDocument("uploads", id, { archived });
  }

  async saveSummary(id: string, aiSummary: string, extractedText?: string) {
    await updateDocument("uploads", id, {
      aiSummary,
      extractedText,
    });
  }

  async deleteRecord(record: UploadRecord) {
    if (record.storagePath) {
      await removeFileFromStorage(record.storagePath);
    }

    await removeDocument("uploads", record.id);
  }

  async uploadRecord(
    uid: string,
    category: UploadCategory,
    file: File,
    notes?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadRecord> {
    const storagePath = buildStoragePath(uid, category, file.name);
    const uploadedFile = await uploadFileToStorage(storagePath, file, onProgress);
    const docId = await addDocument("uploads", {
      uid,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      category,
      storagePath: uploadedFile.storagePath,
      downloadUrl: uploadedFile.downloadUrl,
      fileSizeBytes: file.size,
      archived: false,
      notes: notes || "",
    });

    const record = await this.getRecordById(docId);
    if (!record) {
      throw new Error("Record was saved but could not be reloaded.");
    }

    return record;
  }
}

export const recordsService = new RecordsService();
