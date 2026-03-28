export type UserRole = "user" | "admin";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type SmokingStatus = "never" | "former" | "occasional" | "frequent";

export type AlcoholUse = "none" | "social" | "weekly" | "frequent";

export type ActivityLevel = "low" | "moderate" | "high";

export type SleepPattern = "poor" | "fair" | "good";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type AssessmentType = "diabetes" | "heart" | "kidney" | "liver" | "xray";

export type RiskLevel = "Low" | "Moderate" | "High";

export type RiskBand = "Stable" | "Monitor" | "Action Needed";

export type UploadCategory = "lab-report" | "prescription" | "xray" | "other";

export type UploadStatus = "idle" | "uploading" | "completed" | "failed";

export type FactorDirection = "up" | "down" | "neutral";

export interface AuthUser {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UserDocument {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
}

export interface BaselineValues {
  systolicBP?: number;
  diastolicBP?: number;
  fastingGlucose?: number;
  cholesterol?: number;
}

export interface HealthProfile {
  uid: string;
  fullName: string;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  bloodGroup?: BloodGroup;
  smokingStatus?: SmokingStatus;
  alcoholUse?: AlcoholUse;
  activityLevel?: ActivityLevel;
  sleepPattern?: SleepPattern;
  familyHistory: string[];
  existingConditions: string[];
  allergies: string[];
  medications: string[];
  baselineValues: BaselineValues;
  emergencyNote?: string;
  onboardingCompletedAt?: string;
  onboardingLastSavedAt?: string;
  onboardingLastStep?: number;
  updatedAt: string;
}

export interface ProfileCompletion {
  completedFields: number;
  totalFields: number;
  percentage: number;
  missing: string[];
}

export interface DiabetesAssessmentInput {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
}

export interface HeartAssessmentInput {
  age: number;
  sex: string;
  cp: string;
  trestbps: number;
  chol: number;
  fbs: boolean;
  restecg: string;
  thalch: number;
  exang: boolean;
  oldpeak: number;
  slope: string;
  ca: string;
  thal: string;
}

export interface LiverAssessmentInput {
  Age: number;
  Gender: string;
  Total_Bilirubin: number;
  Direct_Bilirubin: number;
  Alkaline_Phosphotase: number;
  Alamine_Aminotransferase: number;
  Aspartate_Aminotransferase: number;
  Total_Protiens: number;
  Albumin: number;
  Albumin_and_Globulin_Ratio: number;
}

export interface KidneyAssessmentInput {
  age: number;
  bp: number;
  sg: number;
  al: number;
  su: number;
  rbc: string;
  pc: string;
  pcc: string;
  ba: string;
  bgr: number;
  bu: number;
  sc: number;
  sod: number;
  pot: number;
  hemo: number;
  pcv: number;
  wc: number;
  rc: number;
  htn: string;
  dm: string;
  cad: string;
  appet: string;
  pe: string;
  ane: string;
}

export type TabularAssessmentInput =
  | { assessmentType: "diabetes"; inputValues: DiabetesAssessmentInput }
  | { assessmentType: "heart"; inputValues: HeartAssessmentInput }
  | { assessmentType: "kidney"; inputValues: KidneyAssessmentInput }
  | { assessmentType: "liver"; inputValues: LiverAssessmentInput };

export interface ContributingFactor {
  feature: string;
  label: string;
  direction: FactorDirection;
  impactScore: number;
  value: string;
  explanation: string;
}

export interface PredictionResponse {
  status: "ok" | "unavailable" | "error";
  predictionLabel: string;
  probability: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  contributingFactors: ContributingFactor[];
  recommendation: string;
  modelName: string;
  modelVersion: string;
  warnings: string[];
}

export interface AssessmentRecord extends PredictionResponse {
  id: string;
  uid: string;
  assessmentType: AssessmentType;
  inputValues: Record<string, unknown>;
  overallHealthScore: number;
  lifestyleScore: number;
  riskBand: RiskBand;
  linkedUploadId?: string;
  xrayImageUrl?: string;
  explanation?: string;
  explanationNextSteps?: string[];
  createdAt: string;
}

export interface UploadRecord {
  id: string;
  uid: string;
  fileName: string;
  fileType: string;
  category: UploadCategory;
  storagePath: string;
  downloadUrl: string;
  fileSizeBytes: number;
  notes?: string;
  extractedText?: string;
  aiSummary?: string;
  linkedAssessmentId?: string;
  archived?: boolean;
  createdAt: string;
}

export interface UploadProgressState {
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface TrendPoint {
  date: string;
  probability: number;
  confidenceScore: number;
  overallHealthScore: number;
}

export interface InsightSummary {
  uid: string;
  overallHealthScore: number;
  lifestyleScore: number;
  riskBand: RiskBand;
  profileCompleteness: number;
  trend: TrendPoint[];
  recommendations: string[];
  latestAssessment?: AssessmentRecord | null;
  updatedAt: string;
}

export interface ModelMetadata {
  modelName: string;
  version: string;
  taskType: AssessmentType;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainedAt: string;
  status: "ready" | "missing" | "training";
}

export interface AdminStats {
  totalUsers: number;
  totalAssessments: number;
  totalUploads: number;
  usageByModule: Record<AssessmentType, number>;
  storageUsageMb: number;
  recentUsers: UserDocument[];
  recentAssessments: AssessmentRecord[];
  recentUploads: UploadRecord[];
  modelMetadata: ModelMetadata[];
  health: {
    mlApi: "online" | "offline" | "degraded";
    gemini: "online" | "offline" | "missing_key";
    firebase: "online" | "offline";
  };
}

export interface MedicalExplanationResult {
  explanation: string;
  summary?: string;
  nextSteps: string[];
  unavailableReason?: string;
}

export interface RecordSummaryPayload {
  uploadId: string;
  text: string;
  category: UploadCategory;
}

export interface AppSettings {
  remindersEnabled: boolean;
  summaryGenerationEnabled: boolean;
  dataExportFormat: "pdf";
}
