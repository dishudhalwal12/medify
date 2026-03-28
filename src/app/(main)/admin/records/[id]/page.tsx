"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AdminTabs } from "@/components/admin/AdminTabs";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { assessmentService } from "@/services/assessment.service";
import { recordsService } from "@/services/records.service";
import { AssessmentRecord, UploadRecord } from "@/types";

export default function AdminRecordDetailPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<UploadRecord | null>(null);
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    recordsService.getRecordById(params.id).then(async (payload) => {
      setRecord(payload);
      if (payload?.linkedAssessmentId) {
        setAssessment(await assessmentService.getAssessmentById(payload.linkedAssessmentId));
      } else {
        setAssessment(null);
      }
      setLoading(false);
    });
  }, [params?.id]);

  if (loading) {
    return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;
  }

  if (!record) {
    return <EmptyState title="Record not found" description="The selected record could not be loaded." />;
  }

  return (
    <div>
      <PageIntro
        eyebrow="Admin"
        title={record.fileName}
        description="Inspect record metadata, linked assessments, and the stored download target."
      />
      <AdminTabs />

      <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Record metadata</p>
          <div className="mt-5 space-y-3 text-sm leading-7 text-gray-600">
            <p>User ID: {record.uid}</p>
            <p>Category: {record.category}</p>
            <p>File type: {record.fileType}</p>
            <p>Storage path: {record.storagePath}</p>
          </div>
          <div className="mt-5">
            <a href={record.downloadUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-900">
              Open stored file
            </a>
          </div>
        </Card>

        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Linked assessment</p>
          {assessment ? (
            <div className="mt-5 rounded-[22px] bg-[#f7f4ef] p-4">
              <p className="font-semibold text-gray-950">{assessment.predictionLabel}</p>
              <p className="mt-2 text-sm text-gray-500 capitalize">{assessment.assessmentType}</p>
              <p className="mt-2 text-sm leading-7 text-gray-600">{assessment.recommendation}</p>
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] bg-[#f7f4ef] p-4 text-sm text-gray-600">No linked assessment.</div>
          )}
          <div className="mt-5">
            <Link href="/admin/records" className="text-sm font-semibold text-gray-900">
              Back to records
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
