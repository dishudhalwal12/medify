import { PageIntro } from "@/components/layout/PageIntro";
import { SymptomLikelihoodWorkbench } from "@/components/assessments/SymptomLikelihoodWorkbench";

export default function SymptomCheckerWorkspacePage() {
  return (
    <div>
      <PageIntro
        eyebrow="Symptom-led screening"
        title="Estimate disease likelihood from reported symptoms"
        description="Patients can start with the disease they suspect, describe symptoms in plain language, and get an interpretable chance estimate before moving into deeper structured assessments."
      />

      <SymptomLikelihoodWorkbench />
    </div>
  );
}
