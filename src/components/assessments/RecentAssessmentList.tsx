"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { AssessmentRecord } from "@/types";

export function RecentAssessmentList({
  title,
  records,
}: {
  title: string;
  records: AssessmentRecord[];
}) {
  return (
    <Card className="shell-card border-0 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Previous results</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-950">{title}</h3>
        </div>
        <Link href="/history" className="text-sm font-semibold text-gray-700">
          Open history
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {records.length > 0 ? (
          records.slice(0, 4).map((record) => (
            <div
              key={record.id}
              className="rounded-[22px] bg-[#f7f4ef] px-4 py-4 transition hover:bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-950">{record.predictionLabel}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {(record.probability * 100).toFixed(1)}% probability ·{" "}
                    {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusPill level={record.riskLevel} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/history/${record.id}`}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  Open full report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] bg-[#f7f4ef] px-4 py-6 text-sm leading-7 text-gray-600">
            No saved assessments for this module yet.
          </div>
        )}
      </div>
    </Card>
  );
}
