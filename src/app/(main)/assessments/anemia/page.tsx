import { PageIntro } from "@/components/layout/PageIntro";
import { SymptomLikelihoodWorkbench } from "@/components/assessments/SymptomLikelihoodWorkbench";

export default function AnemiaAssessmentPage() {
  return (
    <div>
      <PageIntro
        eyebrow="Symptom-only checker"
        title="Anemia risk checker"
        description="Screen tiredness, paleness, dizziness, breathlessness, and bleeding clues without needing a trained dataset."
      />

      <SymptomLikelihoodWorkbench initialDiseaseId="anemia" />
    </div>
  );
}
