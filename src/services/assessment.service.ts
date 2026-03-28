import { where } from "firebase/firestore";

import {
  AssessmentRecord,
  AssessmentType,
  ContributingFactor,
  PredictionResponse,
  TabularAssessmentInput,
} from "@/types";
import { getRiskBand } from "@/lib/scoring";
import {
  addDocument,
  getDocument,
  listDocuments,
  listUserDocuments,
  updateDocument,
} from "@/services/firebase/firestore";
import { profileService } from "@/services/profile.service";
import { insightsService } from "@/services/insights.service";

const EXTERNAL_ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_BASE_URL?.trim();
const DEFAULT_EXTERNAL_ML_API_BASE_URL = "http://127.0.0.1:8000";
const INTERNAL_ML_API_BASE_URL = "/api/ml";

function assertMlBaseUrl() {
  if (!EXTERNAL_ML_API_BASE_URL || EXTERNAL_ML_API_BASE_URL === DEFAULT_EXTERNAL_ML_API_BASE_URL) {
    return INTERNAL_ML_API_BASE_URL;
  }

  return EXTERNAL_ML_API_BASE_URL.replace(/\/$/, "");
}

async function postPrediction<TBody>(path: string, body: TBody): Promise<PredictionResponse> {
  try {
    const response = await fetch(`${assertMlBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as PredictionResponse;

    if (!response.ok) {
      throw new Error(payload.recommendation || "Failed to run the assessment.");
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "The assessment engine could not be reached. Refresh the app and run `npm run dev:stack` from the project root if the problem continues."
      );
    }

    throw error instanceof Error ? error : new Error("Failed to run the assessment.");
  }
}

class AssessmentService {
  async predict(uid: string, input: TabularAssessmentInput): Promise<AssessmentRecord> {
    const endpoint = `/predict/${input.assessmentType}`;
    const prediction = await postPrediction(endpoint, input.inputValues);
    return this.saveAssessment(
      uid,
      input.assessmentType,
      input.inputValues as unknown as Record<string, unknown>,
      prediction
    );
  }

  async analyzeXray(uid: string, xrayImageUrl: string, linkedUploadId?: string) {
    const prediction = await postPrediction("/predict/xray", {
      imageUrl: xrayImageUrl,
    });

    return this.saveAssessment(
      uid,
      "xray",
      {
        imageUrl: xrayImageUrl,
      },
      prediction,
      linkedUploadId,
      xrayImageUrl
    );
  }

  async saveAssessment(
    uid: string,
    assessmentType: AssessmentType,
    inputValues: Record<string, unknown>,
    prediction: PredictionResponse,
    linkedUploadId?: string,
    xrayImageUrl?: string
  ): Promise<AssessmentRecord> {
    const profile = await profileService.getProfile(uid);
    const lifestyleScore = profile
      ? Math.max(
          35,
          100 -
            (profile.smokingStatus === "frequent" ? 18 : 0) -
            (profile.activityLevel === "low" ? 12 : 0) -
            (profile.sleepPattern === "poor" ? 10 : 0)
        )
      : 45;
    const overallHealthScore = Math.max(
      20,
      Math.round(lifestyleScore * 0.45 + (1 - prediction.probability) * 55)
    );

    const recordId = await addDocument("assessments", {
      uid,
      assessmentType,
      inputValues,
      predictionLabel: prediction.predictionLabel,
      probability: prediction.probability,
      confidenceScore: prediction.confidenceScore,
      riskLevel: prediction.riskLevel,
      contributingFactors: prediction.contributingFactors,
      recommendation: prediction.recommendation,
      overallHealthScore,
      lifestyleScore,
      riskBand: getRiskBand(overallHealthScore),
      linkedUploadId,
      xrayImageUrl,
      modelName: prediction.modelName,
      modelVersion: prediction.modelVersion,
      warnings: prediction.warnings,
      status: prediction.status,
    });

    const record = await this.getAssessmentById(recordId);
    if (!record) {
      throw new Error("Assessment was saved but could not be reloaded.");
    }

    const history = await this.getHistory(uid);
    await insightsService.buildAndStore(uid, history);

    if (linkedUploadId) {
      await updateDocument("uploads", linkedUploadId, {
        linkedAssessmentId: record.id,
      });
    }

    return record;
  }

  async getHistory(uid: string, type?: AssessmentType) {
    if (!type) {
      return listUserDocuments<AssessmentRecord>("assessments", uid, 50);
    }

    return listDocuments<AssessmentRecord>("assessments", [where("uid", "==", uid), where("assessmentType", "==", type)], 25);
  }

  async getAssessmentById(id: string): Promise<AssessmentRecord | null> {
    return getDocument<AssessmentRecord>("assessments", id);
  }

  async getRelatedAssessments(uid: string, assessmentType: AssessmentType) {
    return this.getHistory(uid, assessmentType);
  }

  async getLatestAssessment(uid: string) {
    const history = await this.getHistory(uid);
    return history[0] ?? null;
  }

  async saveExplanation(id: string, explanation: string, nextSteps: string[]) {
    await updateDocument("assessments", id, {
      explanation,
      explanationNextSteps: nextSteps,
    });
  }

  serializeFactors(factors: ContributingFactor[]) {
    return factors.map((factor) => `${factor.label}: ${factor.explanation}`).join("\n");
  }
}

export const assessmentService = new AssessmentService();
