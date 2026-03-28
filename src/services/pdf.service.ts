import { PDFPage, PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";

import { AssessmentRecord, AuthUser } from "@/types";

function drawLine(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  color = rgb(0.8, 0.83, 0.87)
) {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    color,
    thickness: 1,
  });
}

class PdfService {
  async downloadAssessmentReport(assessment: AssessmentRecord, fullName: string, email = "") {
    return this.downloadAssessment(
      {
        uid: "local-export",
        email,
        fullName,
        role: "user",
      },
      assessment
    );
  }

  async downloadAssessment(user: AuthUser, assessment: AssessmentRecord) {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const regular = await doc.embedFont(StandardFonts.Helvetica);

    page.drawRectangle({
      x: 0,
      y: 760,
      width: 595,
      height: 82,
      color: rgb(0.1, 0.11, 0.15),
    });

    page.drawText("Symptora Assessment Summary", {
      x: 40,
      y: 800,
      size: 22,
      font: bold,
      color: rgb(0.97, 0.96, 0.95),
    });

    page.drawText("Educational support tool. Not a clinical diagnosis.", {
      x: 40,
      y: 780,
      size: 10,
      font: regular,
      color: rgb(0.82, 0.82, 0.84),
    });

    const sectionStart = 720;
    const lineHeight = 18;
    const rows = [
      `Patient: ${user.fullName}`,
      `Email: ${user.email}`,
      `Assessment: ${assessment.assessmentType.toUpperCase()}`,
      `Date: ${format(new Date(assessment.createdAt), "PPP p")}`,
      `Prediction: ${assessment.predictionLabel}`,
      `Probability: ${(assessment.probability * 100).toFixed(1)}%`,
      `Confidence: ${(assessment.confidenceScore * 100).toFixed(1)}%`,
      `Risk Level: ${assessment.riskLevel}`,
      `Overall Health Score: ${assessment.overallHealthScore}/100`,
      `Lifestyle Score: ${assessment.lifestyleScore}/100`,
    ];

    page.drawText("Summary", {
      x: 40,
      y: sectionStart,
      size: 14,
      font: bold,
      color: rgb(0.12, 0.14, 0.18),
    });

    rows.forEach((row, index) => {
      page.drawText(row, {
        x: 40,
        y: sectionStart - 32 - index * lineHeight,
        size: 11,
        font: regular,
        color: rgb(0.18, 0.2, 0.24),
      });
    });

    const factorsY = sectionStart - 250;
    drawLine(page, 40, factorsY + 16, 515);
    page.drawText("Key Factors", {
      x: 40,
      y: factorsY,
      size: 14,
      font: bold,
      color: rgb(0.12, 0.14, 0.18),
    });

    assessment.contributingFactors.slice(0, 5).forEach((factor, index) => {
      page.drawText(`- ${factor.label}: ${factor.explanation}`, {
        x: 40,
        y: factorsY - 28 - index * 18,
        size: 10,
        font: regular,
        color: rgb(0.2, 0.22, 0.25),
        maxWidth: 510,
      });
    });

    const recommendationY = factorsY - 150;
    drawLine(page, 40, recommendationY + 16, 515);
    page.drawText("Recommendation", {
      x: 40,
      y: recommendationY,
      size: 14,
      font: bold,
      color: rgb(0.12, 0.14, 0.18),
    });
    page.drawText(assessment.recommendation, {
      x: 40,
      y: recommendationY - 24,
      size: 11,
      font: regular,
      color: rgb(0.2, 0.22, 0.25),
      maxWidth: 510,
      lineHeight: 15,
    });

    page.drawText(
      "Disclaimer: Symptora is an academic healthcare support platform and should not replace licensed medical advice.",
      {
        x: 40,
        y: 60,
        size: 9,
        font: regular,
        color: rgb(0.42, 0.44, 0.48),
        maxWidth: 510,
      }
    );

    const bytes = await doc.save();
    const normalizedBytes = Uint8Array.from(bytes);
    const blob = new Blob([normalizedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `symptora-${assessment.assessmentType}-${assessment.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const pdfService = new PdfService();
