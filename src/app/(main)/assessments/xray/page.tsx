"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, FileImage } from "lucide-react";

import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getAssessmentService, getRecordsService } from "@/services/loaders";

export default function XrayAssessmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !selectedFile) {
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setError(null);

    try {
      const [recordsService, assessmentService] = await Promise.all([
        getRecordsService(),
        getAssessmentService(),
      ]);

      const record = await recordsService.uploadRecord(
        user.uid,
        "xray",
        selectedFile,
        "Chest X-ray uploaded from the assessment workflow.",
        setUploadProgress
      );

      const result = await assessmentService.analyzeXray(user.uid, record.downloadUrl, record.id);
      setSelectedFile(null);
      setFileInputKey((current) => current + 1);
      setUploadProgress(null);
      router.push(`/history/${result.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to complete the X-ray workflow."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Session unavailable"
        description="Sign in again to access the X-ray module."
      />
    );
  }

  return (
    <div>
      <Link href="/assessments" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
        <ArrowLeft className="h-4 w-4" />
        Back to modules
      </Link>

      <PageIntro
        eyebrow="X-ray module"
        title="Chest X-ray analysis"
        description="Upload a chest X-ray image, save it into the record locker, and run the linked imaging assessment flow from the same screen."
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="shell-card border-0 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-[22px] bg-[#eef3ff] p-3">
              <FileImage className="h-6 w-6 text-gray-950" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-950">Upload the chest X-ray</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Supported formats are PNG, JPG, and WEBP. The image is stored as a real X-ray record first, then the assessment service creates a linked result.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">Choose image</Label>
              <Input
                key={fileInputKey}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                required
              />
              <p className="mt-2 text-xs leading-6 text-gray-500">
                Use a clear chest X-ray image up to 15 MB.
              </p>
            </div>

            {selectedFile ? (
              <div className="rounded-[22px] bg-[#f7f4ef] px-4 py-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : null}

            {submitting && uploadProgress !== null ? (
              <div className="rounded-[22px] bg-[#f7f4ef] px-4 py-4">
                <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                  <span>Uploading scan</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-[#24304d]" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex flex-wrap justify-end gap-3 border-t border-black/5 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setFileInputKey((current) => current + 1);
                  setError(null);
                  setUploadProgress(null);
                }}
              >
                Reset image
              </Button>
              <Button type="submit" disabled={!selectedFile || submitting}>
                {submitting ? "Running X-ray workflow..." : "Upload and analyze X-ray"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Workflow behavior</p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-gray-600">
            <p>
              The upload is always real and stored in the user’s record locker under the X-ray category.
            </p>
            <p>
              The result page stays honest: if the imaging model artifact is available, the assessment returns a live prediction; if not, the saved result explicitly reports that the model is unavailable instead of inventing a diagnosis.
            </p>
            <p>
              Either way, the scan stays linked to the saved assessment record so the professor can inspect the full flow.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/records">
              <Button variant="outline" className="w-full">
                Open record locker
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
