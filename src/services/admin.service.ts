import { getDocs, limit, orderBy, query, where } from "firebase/firestore";

import { AdminStats, AssessmentRecord, ModelMetadata, UploadRecord, UserDocument } from "@/types";
import { auth, db } from "@/services/firebase/client";
import { getCollection, listDocuments } from "@/services/firebase/firestore";

const EXTERNAL_ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_BASE_URL?.trim();
const DEFAULT_EXTERNAL_ML_API_BASE_URL = "http://127.0.0.1:8000";
const INTERNAL_ML_API_BASE_URL = "/api/ml";

function getMlBaseUrl() {
  if (!EXTERNAL_ML_API_BASE_URL || EXTERNAL_ML_API_BASE_URL === DEFAULT_EXTERNAL_ML_API_BASE_URL) {
    return INTERNAL_ML_API_BASE_URL;
  }

  return EXTERNAL_ML_API_BASE_URL.replace(/\/$/, "");
}

async function fetchMlModelMetadata(): Promise<ModelMetadata[]> {
  try {
    const response = await fetch(`${getMlBaseUrl()}/models/status`);

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      models: Array<{
        modelName: string;
        status: "ready" | "missing" | "training";
        version?: string;
        metrics?: {
          accuracy?: number;
          precision?: number;
          recall?: number;
          f1?: number;
          f1_score?: number;
        };
      }>;
    };

    return payload.models.map((item) => ({
      modelName: item.modelName,
      version: item.version || "unavailable",
      taskType: item.modelName as ModelMetadata["taskType"],
      accuracy: item.metrics?.accuracy || 0,
      precision: item.metrics?.precision || 0,
      recall: item.metrics?.recall || 0,
      f1Score: item.metrics?.f1 || item.metrics?.f1_score || 0,
      trainedAt: new Date().toISOString(),
      status: item.status,
    }));
  } catch {
    return [];
  }
}

async function getHealthStatus(): Promise<AdminStats["health"]> {
  const firebase = db && auth ? "online" : "offline";

  let mlApi: AdminStats["health"]["mlApi"] = "offline";
  try {
    const response = await fetch(`${getMlBaseUrl()}/health`);
    mlApi = response.ok ? "online" : "degraded";
  } catch {
    mlApi = "offline";
  }

  const gemini = process.env.NEXT_PUBLIC_GEMINI_ENABLED === "true" ? "online" : "missing_key";

  return {
    firebase,
    mlApi,
    gemini,
  };
}

class AdminService {
  async getDashboardStats(): Promise<AdminStats> {
    if (!db) {
      throw new Error("Firebase is not configured.");
    }

    const [usersSnapshot, assessments, uploads, storedModels, health] = await Promise.all([
      getDocs(query(getCollection<UserDocument>("users"), orderBy("createdAt", "desc"), limit(12))),
      listDocuments<AssessmentRecord>("assessments", [], 20),
      listDocuments<UploadRecord>("uploads", [], 20),
      listDocuments<ModelMetadata>("modelMetadata", [], 10),
      getHealthStatus(),
    ]);

    const models = storedModels.length > 0 ? storedModels : await fetchMlModelMetadata();

    const recentUsers = usersSnapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as UserDocument),
    })) as unknown as UserDocument[];

    const usageByModule: AdminStats["usageByModule"] = {
      diabetes: 0,
      heart: 0,
      kidney: 0,
      liver: 0,
      xray: 0,
    };

    assessments.forEach((record) => {
      usageByModule[record.assessmentType] += 1;
    });

    const storageUsageMb = uploads.reduce(
      (sum, upload) => sum + (typeof upload.fileSizeBytes === "number" ? upload.fileSizeBytes : 0),
      0
    ) / (1024 * 1024);

    return {
      totalUsers: usersSnapshot.size,
      totalAssessments: assessments.length,
      totalUploads: uploads.length,
      usageByModule,
      storageUsageMb: Number(storageUsageMb.toFixed(1)),
      recentUsers,
      recentAssessments: assessments,
      recentUploads: uploads,
      modelMetadata: models,
      health,
    };
  }

  async getUserDirectory() {
    return listDocuments<UserDocument>("users", [], 80);
  }

  async getAllRecords() {
    return listDocuments<UploadRecord>("uploads", [], 120);
  }

  async getAllAssessments() {
    return listDocuments<AssessmentRecord>("assessments", [], 120);
  }

  async getModelMetadata() {
    const storedModels = await listDocuments<ModelMetadata>("modelMetadata", [], 20);
    return storedModels.length > 0 ? storedModels : fetchMlModelMetadata();
  }

  async getSystemHealth() {
    return getHealthStatus();
  }

  async getUserDetail(uid: string) {
    const [user, assessments, uploads] = await Promise.all([
      import("@/services/firebase/firestore").then(({ getDocument }) =>
        getDocument<UserDocument>("users", uid)
      ),
      listDocuments<AssessmentRecord>("assessments", [where("uid", "==", uid)], 30),
      listDocuments<UploadRecord>("uploads", [where("uid", "==", uid)], 30),
    ]);

    return {
      user,
      assessments,
      uploads,
    };
  }
}

export const adminService = new AdminService();
