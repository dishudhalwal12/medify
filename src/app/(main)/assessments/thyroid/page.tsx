import { PageIntro } from "@/components/layout/PageIntro";
import { SymptomLikelihoodWorkbench } from "@/components/assessments/SymptomLikelihoodWorkbench";

export default function ThyroidAssessmentPage() {
  return (
    <div>
      <PageIntro
        eyebrow="Symptom-only checker"
        title="Thyroid disorder checker"
        description="Screen weight, temperature tolerance, heartbeat, hair, skin, bowel, mood, and sleep patterns without needing a trained dataset."
      />

      <SymptomLikelihoodWorkbench initialDiseaseId="thyroid-disorder" />
    </div>
  );
}
