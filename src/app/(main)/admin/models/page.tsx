"use client";

import { useEffect, useState } from "react";

import { AdminTabs } from "@/components/admin/AdminTabs";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecoveryState } from "@/components/ui/recovery-state";
import { adminService } from "@/services/admin.service";
import { ModelMetadata } from "@/types";

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getModelMetadata().then(setModels).catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load model metadata.");
    });
  }, []);

  if (error) {
    return (
      <RecoveryState
        title="Model metadata unavailable"
        description={error}
        actionLabel="Retry models"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div>
      <PageIntro
        eyebrow="Admin"
        title="Model metadata"
        description="Track deployed model versions, evaluation metrics, and readiness status."
      />
      <AdminTabs />

      <div className="grid gap-4 md:grid-cols-2">
        {models.length > 0 ? models.map((model) => (
          <Card key={`${model.taskType}-${model.version}`} className="shell-card border-0 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-gray-400">{model.taskType}</p>
            <h3 className="mt-2 text-2xl font-semibold text-gray-950">{model.modelName}</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Metric label="Accuracy" value={model.accuracy.toFixed(3)} />
              <Metric label="Precision" value={model.precision.toFixed(3)} />
              <Metric label="Recall" value={model.recall.toFixed(3)} />
              <Metric label="F1" value={model.f1Score.toFixed(3)} />
            </div>
            <p className="mt-5 text-sm text-gray-500">
              Version {model.version} · {model.status} · trained {new Date(model.trainedAt).toLocaleString()}
            </p>
          </Card>
        )) : <EmptyState title="No model metadata found" description="The admin layer could not find stored model metadata or a live model status response." />}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-[#f7f4ef] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-gray-950">{value}</p>
    </div>
  );
}
