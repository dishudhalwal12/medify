"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, FileText, Search, Trash2 } from "lucide-react";
import Link from "next/link";

import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecoveryState } from "@/components/ui/recovery-state";
import { StatusPill } from "@/components/ui/status-pill";
import { useAuth } from "@/hooks/useAuth";
import type { UploadCategory, UploadRecord } from "@/types";

const CATEGORY_OPTIONS: Array<{ value: UploadCategory; label: string }> = [
  { value: "lab-report", label: "Lab report" },
  { value: "prescription", label: "Prescription" },
  { value: "xray", label: "X-ray" },
  { value: "other", label: "Other" },
];

type SortOption = "newest" | "oldest" | "category";

async function getRecordsService() {
  const recordsModule = await import("@/services/records.service");
  return recordsModule.recordsService;
}

export default function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<UploadCategory>("lab-report");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<UploadCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [query, setQuery] = useState("");

  const refreshRecords = useCallback(async (showLoading = true) => {
    if (!user) return;
    if (showLoading) setLoading(true);
    try {
      const service = await getRecordsService();
      const nextRecords = await service.getRecords(user.uid);
      setRecords(nextRecords);
      setError(null);
    } catch (loadError) {
      console.error("Failed to load records", loadError);
      setError(loadError instanceof Error ? loadError.message : "Unable to load records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refreshRecords(false);
  }, [refreshRecords, user]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !selectedFile) return;
    setError(null);
    setSaving(true);
    setUploadProgress(0);
    try {
      const service = await getRecordsService();
      await service.uploadRecord(user.uid, category, selectedFile, notes.trim(), setUploadProgress);
      setSelectedFile(null);
      setFileInputKey((current) => current + 1);
      setNotes("");
      setUploadProgress(null);
      await refreshRecords();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save record.");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(record: UploadRecord) {
    try {
      setError(null);
      const service = await getRecordsService();
      await service.archiveRecord(record.id, !record.archived);
      await refreshRecords();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Unable to update archive state.");
    }
  }

  async function handleDelete(record: UploadRecord) {
    try {
      setError(null);
      const service = await getRecordsService();
      await service.deleteRecord(record);
      await refreshRecords();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this record.");
    }
  }

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    const next = records.filter((record) => {
      const matchesFilter = filter === "all" ? true : record.category === filter;
      const matchesQuery =
        record.fileName.toLowerCase().includes(normalizedQuery) ||
        record.category.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });

    if (sort === "oldest") return next.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    if (sort === "category") return next.sort((a, b) => a.category.localeCompare(b.category));
    return next.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [filter, query, records, sort]);

  if (!user) {
    return (
      <EmptyState icon={FileText} title="Records unavailable" description="Sign in again to access your record locker." />
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Records locker"
        title="Log and manage your medical records"
        description="Upload lab reports, prescriptions, and imaging records into one secure history so linked assessments can open the exact source file later."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="shell-card border-0 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Record center</p>
          <h3 className="mt-3 text-2xl font-semibold text-gray-950">Upload a medical record</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Choose a category, attach the file, and add optional notes for context such as doctor, clinic, or observations.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSave}>
            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">Category</Label>
              <select
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                value={category}
                onChange={(e) => setCategory(e.target.value as UploadCategory)}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">Choose file</Label>
              <Input
                key={fileInputKey}
                type="file"
                accept={category === "xray" ? "image/png,image/jpeg,image/webp" : ".pdf,image/png,image/jpeg,image/webp"}
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                required
              />
              <p className="mt-2 text-xs leading-6 text-gray-500">
                {category === "xray"
                  ? "Chest X-ray uploads accept PNG, JPG, and WEBP files up to 15 MB."
                  : "Reports accept PDF, PNG, JPG, and WEBP files up to 10 MB."}
              </p>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-gray-700">Notes (optional)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none"
                placeholder="Any observations, doctor name, hospital, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {selectedFile ? (
              <div className="rounded-[22px] bg-[#f7f4ef] px-4 py-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : null}

            {saving && uploadProgress !== null ? (
              <div className="rounded-[22px] bg-[#f7f4ef] px-4 py-4">
                <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                  <span>Uploading file</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-[#24304d]" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" disabled={!selectedFile || saving} className="w-full">
              {saving ? "Uploading record..." : "Upload record"}
            </Button>
          </form>
        </Card>

        <Card className="shell-card border-0 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Stored records</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-950">Record library</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files" />
              </div>
              <select
                className="flex h-11 rounded-xl border border-gray-200 bg-transparent px-3 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                value={filter}
                onChange={(e) => setFilter(e.target.value as UploadCategory | "all")}
              >
                <option value="all">All categories</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                className="flex h-11 rounded-xl border border-gray-200 bg-transparent px-3 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {error && !loading ? (
              <RecoveryState
                title="Record library unavailable"
                description={error}
                actionLabel="Retry records"
                onAction={() => void refreshRecords()}
              />
            ) : loading ? (
              <div className="h-48 animate-pulse rounded-[28px] bg-[#f7f4ef]" />
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div key={record.id} className="rounded-[24px] bg-[#f7f4ef] p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <Link href={`/records/${record.id}`} className="text-lg font-semibold text-gray-950">
                        {record.fileName}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusPill
                          level={record.category === "xray" ? "High" : record.category === "lab-report" ? "Moderate" : "Low"}
                          label={record.category.replace("-", " ")}
                        />
                        {record.linkedAssessmentId ? (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">Linked assessment</span>
                        ) : null}
                        {record.archived ? (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">Archived</span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        Uploaded on {new Date(record.createdAt).toLocaleString()}
                      </p>
                      {record.notes ? <p className="mt-2 text-sm text-gray-600">{record.notes}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/records/${record.id}`}>
                        <Button variant="outline">Open</Button>
                      </Link>
                      <Button type="button" variant="ghost" onClick={() => handleArchive(record)}>
                        <Archive className="mr-2 h-4 w-4" />
                        {record.archived ? "Unarchive" : "Archive"}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => handleDelete(record)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={FileText}
                title="No records found"
                description="Upload your first record above to start building your medical locker."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
