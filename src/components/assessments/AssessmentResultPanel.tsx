"use client";

import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { AssessmentRecord } from "@/types";

export function AssessmentResultPanel({
  result,
  accentClassName,
  onReset,
}: {
  result: AssessmentRecord;
  accentClassName?: string;
  onReset?: () => void;
}) {
  function handleOpenFullReport() {
    const reportSection = document.getElementById("full-report");
    if (!reportSection) {
      return;
    }

    reportSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Card className={`shell-card border-0 p-6 ${accentClassName || ""}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Latest saved result</p>
          <h3 className="mt-3 text-3xl font-semibold text-gray-950">{result.predictionLabel}</h3>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            {(result.probability * 100).toFixed(1)}% probability and {(result.confidenceScore * 100).toFixed(1)}%
            confidence from {result.modelName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusPill level={result.riskLevel} />
          <div className="rounded-full bg-[#f7f4ef] px-4 py-2 text-sm font-medium text-gray-700">{result.riskBand}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-900">Top contributing factors</p>
          </div>
          <div className="space-y-3">
            {result.contributingFactors.map((factor) => (
              <div key={`${factor.feature}-${factor.label}`} className="rounded-[22px] bg-[#f7f4ef] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-950">{factor.label}</p>
                    <p className="mt-1 text-sm text-gray-500">Observed value: {factor.value}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {factor.direction}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-gray-600">{factor.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[26px] bg-[#17181f] p-5 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">Recommendation</p>
            <p className="mt-3 text-sm leading-7 text-white/78">{result.recommendation}</p>
          </div>
          {result.warnings.length > 0 ? (
            <div className="rounded-[26px] bg-[#fff4ef] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[#aa5a2c]">Warnings</p>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#8a4d27]">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {onReset ? (
              <Button type="button" variant="outline" onClick={onReset}>
                Re-enter values
              </Button>
            ) : null}
            <Button type="button" onClick={handleOpenFullReport}>
              Open full result
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
