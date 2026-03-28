let authServicePromise: Promise<typeof import("@/services/auth.service")> | null = null;
let profileServicePromise: Promise<typeof import("@/services/profile.service")> | null = null;
let assessmentServicePromise: Promise<typeof import("@/services/assessment.service")> | null = null;
let insightsServicePromise: Promise<typeof import("@/services/insights.service")> | null = null;
let recordsServicePromise: Promise<typeof import("@/services/records.service")> | null = null;
let adminServicePromise: Promise<typeof import("@/services/admin.service")> | null = null;
let aiServicePromise: Promise<typeof import("@/services/ai.service")> | null = null;
let pdfServicePromise: Promise<typeof import("@/services/pdf.service")> | null = null;

export async function getAuthService() {
  authServicePromise ??= import("@/services/auth.service");
  return (await authServicePromise).authService;
}

export async function getProfileService() {
  profileServicePromise ??= import("@/services/profile.service");
  return (await profileServicePromise).profileService;
}

export async function getAssessmentService() {
  assessmentServicePromise ??= import("@/services/assessment.service");
  return (await assessmentServicePromise).assessmentService;
}

export async function getInsightsService() {
  insightsServicePromise ??= import("@/services/insights.service");
  return (await insightsServicePromise).insightsService;
}

export async function getRecordsService() {
  recordsServicePromise ??= import("@/services/records.service");
  return (await recordsServicePromise).recordsService;
}

export async function getAdminService() {
  adminServicePromise ??= import("@/services/admin.service");
  return (await adminServicePromise).adminService;
}

export async function getAiService() {
  aiServicePromise ??= import("@/services/ai.service");
  return (await aiServicePromise).aiService;
}

export async function getPdfService() {
  pdfServicePromise ??= import("@/services/pdf.service");
  return (await pdfServicePromise).pdfService;
}
