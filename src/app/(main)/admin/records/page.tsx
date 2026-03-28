"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminTabs } from "@/components/admin/AdminTabs";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecoveryState } from "@/components/ui/recovery-state";
import { adminService } from "@/services/admin.service";
import { UploadRecord } from "@/types";

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getAllRecords().then(setRecords).catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load admin records.");
    });
  }, []);

  if (error) {
    return (
      <RecoveryState
        title="Admin records unavailable"
        description={error}
        actionLabel="Retry records"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Admin"
        title="Records review"
        description="Review uploaded files across users and open individual record detail pages."
      />
      <AdminTabs />

      <Card className="shell-card border-0 p-6">
        <div className="space-y-3">
          {records.length > 0 ? records.map((record) => (
            <Link key={record.id} href={`/admin/records/${record.id}`} className="block rounded-[22px] bg-[#f7f4ef] p-4 hover:bg-white">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-950">{record.fileName}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {record.uid} · {record.category} · {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                  {record.linkedAssessmentId ? "Linked" : "Standalone"}
                </span>
              </div>
            </Link>
          )) : <EmptyState title="No uploaded records yet" description="Once users store reports or X-rays, they will appear here." />}
        </div>
      </Card>
    </div>
  );
}
