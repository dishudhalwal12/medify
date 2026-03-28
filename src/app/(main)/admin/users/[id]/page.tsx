"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AdminTabs } from "@/components/admin/AdminTabs";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { adminService } from "@/services/admin.service";
import { AssessmentRecord, UploadRecord, UserDocument } from "@/types";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDocument | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    adminService.getUserDetail(params.id).then((payload) => {
      setUser(payload.user);
      setAssessments(payload.assessments);
      setUploads(payload.uploads);
      setLoading(false);
    });
  }, [params?.id]);

  if (loading) {
    return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;
  }

  if (!user) {
    return <EmptyState title="User not found" description="The requested user record could not be loaded." />;
  }

  return (
    <div>
      <PageIntro
        eyebrow="Admin"
        title={user.fullName}
        description="Review this user’s account metadata, recent assessments, and uploaded medical records."
      />
      <AdminTabs />

      <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Account metadata</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>Created: {new Date(user.createdAt).toLocaleString()}</p>
            <p>Last login: {new Date(user.lastLoginAt).toLocaleString()}</p>
          </div>
        </Card>

        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Recent assessments</p>
          <div className="mt-5 space-y-3">
            {assessments.length > 0 ? (
              assessments.map((item) => (
                <div key={item.id} className="rounded-[22px] bg-[#f7f4ef] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold capitalize text-gray-950">{item.assessmentType}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.predictionLabel}</p>
                    </div>
                    <StatusPill level={item.riskLevel} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] bg-[#f7f4ef] p-4 text-sm text-gray-600">No assessments saved yet.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Uploads</p>
          <div className="mt-5 space-y-3">
            {uploads.length > 0 ? (
              uploads.map((upload) => (
                <div key={upload.id} className="rounded-[22px] bg-[#f7f4ef] p-4">
                  <p className="font-semibold text-gray-950">{upload.fileName}</p>
                  <p className="mt-1 text-sm text-gray-500">{upload.category}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] bg-[#f7f4ef] p-4 text-sm text-gray-600">No uploads found.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
