"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";

import { ResultDetailView } from "@/components/assessments/ResultDetailView";
import { PageIntro } from "@/components/layout/PageIntro";
import { EmptyState } from "@/components/ui/empty-state";
import { RecoveryState } from "@/components/ui/recovery-state";
import { useAuth } from "@/hooks/useAuth";
import { getAssessmentService, getRecordsService } from "@/services/loaders";
import { AssessmentRecord, UploadRecord } from "@/types";

export default function ResultDetailPage() {
  const params = useParams<{ id: string }>();
  const resultId = params?.id;
  const { user } = useAuth();
  const [result, setResult] = useState<AssessmentRecord | null>(null);
  const [linkedRecord, setLinkedRecord] = useState<UploadRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultId) return;

    let cancelled = false;

    async function loadResult() {
      try {
        const [assessmentService, recordsService] = await Promise.all([
          getAssessmentService(),
          getRecordsService(),
        ]);
        const assessment = await assessmentService.getAssessmentById(resultId);
        if (cancelled) return;

        setResult(assessment);
        setError(null);

        if (assessment?.linkedUploadId) {
          const upload = await recordsService.getRecordById(assessment.linkedUploadId);
          if (cancelled) return;
          setLinkedRecord(upload);
        } else {
          setLinkedRecord(null);
        }
      } catch (error) {
        console.error("Failed to load result detail", error);
        if (cancelled) return;
        setResult(null);
        setLinkedRecord(null);
        setError(error instanceof Error ? error.message : "The requested result could not be loaded.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadResult();

    return () => {
      cancelled = true;
    };
  }, [resultId]);

  if (loading) {
    return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;
  }

  if (!user) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Result unavailable"
        description="The requested assessment result could not be loaded."
      />
    );
  }

  if (!result) {
    return (
      <RecoveryState
        title="Result detail unavailable"
        description={error || "The requested assessment result could not be loaded."}
        actionLabel="Retry result"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div>
      <Link href="/history" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
        <ArrowLeft className="h-4 w-4" />
        Back to history
      </Link>

      <PageIntro
        eyebrow="Result detail"
        title={`${result.assessmentType} assessment result`}
        description="Inspect the saved model response, contributing factors, linked records, and patient-friendly interpretation for this assessment."
      />

      <ResultDetailView result={result} linkedRecord={linkedRecord} userName={user.fullName} />
    </div>
  );
}
