"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, FileText, Sparkles } from "lucide-react";

import { AssessmentResultPanel } from "@/components/assessments/AssessmentResultPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAssessmentService } from "@/services/loaders";
import { aiService } from "@/services/ai.service";
import { pdfService } from "@/services/pdf.service";
import { AssessmentRecord, MedicalExplanationResult, UploadRecord } from "@/types";

export function ResultDetailView({
  result,
  linkedRecord,
  userName,
}: {
  result: AssessmentRecord;
  linkedRecord?: UploadRecord | null;
  userName: string;
}) {
  const [explanation, setExplanation] = useState<MedicalExplanationResult | null>(
    result.explanation
      ? {
          explanation: result.explanation,
          nextSteps: result.explanationNextSteps || [],
        }
      : null
  );
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  async function handleExplain() {
    if (explanation) {
      return;
    }

    setLoadingExplanation(true);
    setError(null);

    try {
      const payload = await aiService.explainAssessment({
        assessmentId: result.id,
        assessmentType: result.assessmentType,
        predictionLabel: result.predictionLabel,
        probability: result.probability,
        riskLevel: result.riskLevel,
        factors: result.contributingFactors.slice(0, 3).map(
          (factor) => `${factor.label}: ${factor.value} (${factor.direction})`
        ),
        recommendation: result.recommendation,
      });
      setExplanation(payload);
      try {
        const assessmentService = await getAssessmentService();
        await assessmentService.saveExplanation(result.id, payload.explanation, payload.nextSteps);
      } catch (saveError) {
        console.warn("Explanation was generated but could not be cached on the assessment.", saveError);
      }
    } catch (explainError) {
      setError(explainError instanceof Error ? explainError.message : "Unable to generate explanation.");
    } finally {
      setLoadingExplanation(false);
    }
  }

  async function handlePdfExport() {
    setExportingPdf(true);
    setPdfStatus(null);

    try {
      await pdfService.downloadAssessmentReport(result, userName);
      setPdfStatus("PDF export started.");
    } catch (pdfError) {
      setPdfStatus(pdfError instanceof Error ? pdfError.message : "Unable to export the PDF right now.");
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="space-y-4">
      <AssessmentResultPanel result={result} />

      <div id="full-report" className="grid gap-4 scroll-mt-24 xl:grid-cols-[1.02fr_0.98fr]">
        <Card className="shell-card border-0 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Assessment context</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">Saved assessment inputs</h3>
            </div>
            <Button type="button" variant="outline" onClick={handlePdfExport} disabled={exportingPdf}>
              <Download className="mr-2 h-4 w-4" />
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </Button>
          </div>

          {pdfStatus ? <p className="mt-4 text-sm text-gray-500">{pdfStatus}</p> : null}

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {Object.entries(result.inputValues).map(([key, value]) => (
              <div key={key} className="rounded-[22px] bg-[#f7f4ef] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-400">{key}</p>
                <p className="mt-2 text-lg font-semibold text-gray-950">{String(value)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <MiniMetric label="Overall score" value={String(result.overallHealthScore)} />
            <MiniMetric label="Lifestyle score" value={String(result.lifestyleScore)} />
            <MiniMetric label="Created" value={new Date(result.createdAt).toLocaleDateString()} />
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="shell-card border-0 p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-gray-950" />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Plain-language explanation</p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-950">Explain this result</h3>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" onClick={handleExplain} disabled={loadingExplanation || !!explanation}>
                {loadingExplanation ? "Generating explanation..." : explanation ? "Explanation ready" : "Generate explanation"}
              </Button>
            </div>

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            {explanation ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-[#17181f] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/55">Summary</p>
                  <p className="mt-3 text-sm leading-7 text-white/78">{explanation.explanation}</p>
                </div>
                {explanation.nextSteps.length > 0 ? (
                  <div className="rounded-[24px] bg-[#f7f4ef] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Next steps</p>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-gray-600">
                      {explanation.nextSteps.map((step) => (
                        <p key={step}>{step}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] bg-[#f7f4ef] p-5 text-sm leading-7 text-gray-600">
                No assistive explanation generated yet.
              </div>
            )}
          </Card>

          <Card className="shell-card border-0 p-6">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-5 w-5 text-gray-950" />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Linked record</p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-950">Uploaded source file</h3>
              </div>
            </div>

            {linkedRecord ? (
              <div className="mt-5 rounded-[24px] bg-[#f7f4ef] p-5">
                <p className="font-semibold text-gray-950">{linkedRecord.fileName}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {linkedRecord.category.replace("-", " ")} · {new Date(linkedRecord.createdAt).toLocaleString()}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/records/${linkedRecord.id}`}>
                    <Button variant="outline">Open record</Button>
                  </Link>
                  <a href={linkedRecord.downloadUrl} target="_blank" rel="noreferrer">
                    <Button>Open file</Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] bg-[#f7f4ef] p-5 text-sm leading-7 text-gray-600">
                This assessment is not linked to an uploaded record.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-[#f7f4ef] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-gray-950">{value}</p>
    </div>
  );
}
