import { AssessmentRecord, HealthProfile, InsightSummary, RiskBand } from "@/types";
import { getProfileCompletion } from "@/lib/profile";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function scoreLifestyle(profile: HealthProfile | null): number {
  if (!profile) return 30;

  let score = 70;

  if (profile.smokingStatus === "former") score -= 6;
  if (profile.smokingStatus === "occasional") score -= 12;
  if (profile.smokingStatus === "frequent") score -= 22;

  if (profile.alcoholUse === "social") score -= 4;
  if (profile.alcoholUse === "weekly") score -= 8;
  if (profile.alcoholUse === "frequent") score -= 14;

  if (profile.activityLevel === "moderate") score += 8;
  if (profile.activityLevel === "high") score += 14;
  if (profile.activityLevel === "low") score -= 10;

  if (profile.sleepPattern === "fair") score -= 4;
  if (profile.sleepPattern === "poor") score -= 12;
  if (profile.sleepPattern === "good") score += 6;

  return clamp(score);
}

function scoreRiskTrend(assessments: AssessmentRecord[]): number {
  if (assessments.length === 0) return 68;

  const latest = assessments
    .slice()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 6);

  const averageProbability =
    latest.reduce((sum, record) => sum + record.probability * 100, 0) / latest.length;

  return clamp(100 - averageProbability);
}

export function getRiskBand(overallHealthScore: number): RiskBand {
  if (overallHealthScore >= 75) return "Stable";
  if (overallHealthScore >= 50) return "Monitor";
  return "Action Needed";
}

export function buildInsightSummary(
  uid: string,
  profile: HealthProfile | null,
  assessments: AssessmentRecord[]
): InsightSummary {
  const profileCompletion = getProfileCompletion(profile);
  const lifestyleScore = scoreLifestyle(profile);
  const riskTrendScore = scoreRiskTrend(assessments);
  const overallHealthScore = clamp(
    lifestyleScore * 0.35 + riskTrendScore * 0.45 + profileCompletion.percentage * 0.2
  );
  const riskBand = getRiskBand(overallHealthScore);

  const recommendations = [
    profileCompletion.percentage < 85
      ? "Complete your health profile to improve the quality of your assessments."
      : "Keep your profile up to date so trend scores stay clinically useful.",
    lifestyleScore < 60
      ? "Lifestyle indicators suggest you should focus on sleep, activity, and substance-use habits."
      : "Lifestyle signals look steady. Maintain your current routine and reassess regularly.",
  ];

  if (assessments.length > 0) {
    const latest = assessments[0];
    recommendations.push(
      `Your latest ${latest.assessmentType} assessment is ${latest.riskLevel.toLowerCase()} risk. Review the contributing factors and follow-up guidance.`
    );
  } else {
    recommendations.push("Run your first assessment to unlock trend tracking and result summaries.");
  }

  return {
    uid,
    overallHealthScore,
    lifestyleScore,
    riskBand,
    profileCompleteness: profileCompletion.percentage,
    trend: assessments
      .slice()
      .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
      .map((record) => ({
        date: record.createdAt,
        probability: Number((record.probability * 100).toFixed(2)),
        confidenceScore: Number((record.confidenceScore * 100).toFixed(2)),
        overallHealthScore: record.overallHealthScore,
      })),
    recommendations,
    latestAssessment: assessments[0] ?? null,
    updatedAt: new Date().toISOString(),
  };
}
