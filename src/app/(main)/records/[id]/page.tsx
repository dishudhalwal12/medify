"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Sparkles, Trash2 } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { RecoveryState } from "@/components/ui/recovery-state";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { aiService } from "@/services/ai.service";
import { assessmentService } from "@/services/assessment.service";
import { recordsService } from "@/services/records.service";
import { AssessmentRecord, MedicalExplanationResult, UploadRecord } from "@/types";

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const recordId = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const [record, setRecord] = useState<UploadRecord | null>(null);
  const [linkedAssessment, setLinkedAssessment] = useState<AssessmentRecord | null>(null);
  const [draftText, setDraftText] = useState("");
  const [summary, setSummary] = useState<MedicalExplanationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRecord = useCallback(async () => {
    if (!recordId) return;

    try {
      const nextRecord = await recordsService.getRecordById(recordId);
      setRecord(nextRecord);

      if (nextRecord?.linkedAssessmentId) {
        const assessment = await assessmentService.getAssessmentById(nextRecord.linkedAssessmentId);
        setLinkedAssessment(assessment);
      } else {
        setLinkedAssessment(null);
      }

      setSummary(
        nextRecord?.aiSummary
          ? {
              explanation: nextRecord.aiSummary,
              nextSteps: [],
            }
          : null
      );
      setDraftText(nextRecord?.extractedText || "");
      setError(null);
    } catch (loadError) {
      console.error("Failed to load record detail", loadError);
      setError(loadError instanceof Error ? loadError.message : "Unable to load this record.");
      setRecord(null);
      setLinkedAssessment(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    void refreshRecord();
  }, [refreshRecord]);

  async function handleSummarize() {
    if (!record || !draftText.trim()) return;

    setSummarizing(true);
    setError(null);

    try {
      const result = await aiService.summarizeRecord({
        uploadId: record.id,
        text: draftText,
        category: record.category,
      });
      await recordsService.saveSummary(record.id, result.explanation, draftText);
      setSummary(result);
      await refreshRecord();
    } catch (summaryError) {
      setError(summaryError instanceof Error ? summaryError.message : "Unable to summarize this record.");
    } finally {
      setSummarizing(false);
    }
  }

  async function handleDelete() {
    if (!record) return;
    try {
      await recordsService.deleteRecord(record);
      router.push("/records");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this record.");
    }
  }

  if (loading) {
    return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;
  }

  if (!user) {
    return (
      <EmptyState
        icon={FileText}
        title="Record unavailable"
        description="The requested record could not be loaded."
      />
    );
  }

  if (!record) {
    return (
      <RecoveryState
        title="Record detail unavailable"
        description={error || "The requested record could not be loaded."}
        actionLabel="Retry record"
        onAction={() => void refreshRecord()}
      />
    );
  }

  return (
    <div>
      <Link href="/records" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
        <ArrowLeft className="h-4 w-4" />
        Back to records
      </Link>

      <PageIntro
        eyebrow="Record detail"
        title={record.fileName}
        description="Review metadata, download the stored file, inspect linked assessments, and generate an assistive summary when extracted text is available."
      />

      <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Record metadata</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusPill
              level={record.category === "xray" ? "High" : record.category === "lab-report" ? "Moderate" : "Low"}
              label={record.category.replace("-", " ")}
            />
            {record.linkedAssessmentId ? (
              <span className="rounded-full bg-[#f7f4ef] px-3 py-1 text-xs font-semibold text-gray-600">
                Linked to assessment
              </span>
            ) : null}
          </div>
          <div className="mt-5 space-y-3 text-sm leading-7 text-gray-600">
            <p>Uploaded at: {new Date(record.createdAt).toLocaleString()}</p>
            <p>File type: {record.fileType}</p>
            <p>File size: {(record.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
            <p>Storage path: {record.storagePath}</p>
            {record.notes ? <p>Notes: {record.notes}</p> : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {record.downloadUrl ? (
              <a href={record.downloadUrl} target="_blank" rel="noreferrer">
                <Button>Open file</Button>
              </a>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await recordsService.archiveRecord(record.id, !record.archived);
                await refreshRecord();
              }}
            >
              {record.archived ? "Unarchive" : "Archive"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>

          {linkedAssessment ? (
            <div className="mt-8 rounded-[24px] bg-[#f7f4ef] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Linked assessment</p>
              <h3 className="mt-3 text-xl font-semibold text-gray-950">{linkedAssessment.predictionLabel}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">{linkedAssessment.recommendation}</p>
              <div className="mt-4">
                <Link href={`/history/${linkedAssessment.id}`} className="text-sm font-semibold text-gray-900">
                  Open linked report
                </Link>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="shell-card border-0 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-gray-950" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">AI assistive summary</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">Summarize report text</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Paste extracted text from the report because OCR is not live yet. Gemini is used only for explanation
                and summarization, not diagnosis.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Label className="mb-2 block text-sm font-medium text-gray-700">Extracted or pasted report text</Label>
            <Textarea
              rows={10}
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              placeholder="Paste report findings or lab text here to generate a patient-friendly summary."
            />
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={handleSummarize} disabled={summarizing || !draftText.trim()}>
              {summarizing ? "Generating summary..." : "Generate summary"}
            </Button>
          </div>

          {summary ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] bg-[#17181f] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">Summary</p>
                <p className="mt-3 text-sm leading-7 text-white/78">{summary.explanation}</p>
              </div>
              {summary.nextSteps.length > 0 ? (
                <div className="rounded-[24px] bg-[#f7f4ef] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Next steps</p>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-gray-600">
                    {summary.nextSteps.map((step) => (
                      <p key={step}>{step}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] bg-[#f7f4ef] p-5 text-sm leading-7 text-gray-600">
              No summary saved yet. You can still view and download the raw record above.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
