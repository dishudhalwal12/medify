import { serverTimestamp } from "firebase/firestore";

import { AssessmentRecord, InsightSummary } from "@/types";
import { buildInsightSummary } from "@/lib/scoring";
import { getDocument, upsertDocument } from "@/services/firebase/firestore";
import { profileService } from "@/services/profile.service";

class InsightsService {
  async buildAndStore(uid: string, assessments: AssessmentRecord[]) {
    const profile = await profileService.getProfile(uid);
    const summary = buildInsightSummary(uid, profile, assessments);

    await upsertDocument("insights", uid, {
      ...summary,
      updatedAt: serverTimestamp(),
    });

    return summary;
  }

  async getInsight(uid: string): Promise<InsightSummary | null> {
    return getDocument<InsightSummary>("insights", uid);
  }
}

export const insightsService = new InsightsService();
