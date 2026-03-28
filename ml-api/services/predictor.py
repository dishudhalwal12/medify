from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from schemas.prediction import ContributingFactor, PredictionResponse
from utils.modeling import MODELS_DIR, read_metadata, read_model


def format_value(value: Any) -> str:
    if isinstance(value, bool):
        return "True" if value else "False"
    if isinstance(value, (float, np.floating)):
        return f"{float(value):.2f}"
    return str(value)


def aggregate_logistic_contributions(model, metadata: dict[str, Any], input_frame: pd.DataFrame):
    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["classifier"]
    transformed = preprocessor.transform(input_frame)
    vector = transformed[0]
    if hasattr(vector, "toarray"):
        vector = vector.toarray()[0]

    coefficients = np.asarray(metadata["explainability"]["coefficients"])
    source_map = metadata["explainability"]["source_map"]
    baselines = metadata["baselines"]
    contributions = []

    for feature_name, indices in source_map.items():
        contribution = float(np.sum(vector[indices] * coefficients[indices]))
        baseline = baselines[feature_name]
        raw_value = input_frame.iloc[0][feature_name]
        direction = "up" if contribution > 0 else "down"
        contributions.append(
            ContributingFactor(
                feature=feature_name,
                label=baseline["label"],
                direction=direction,
                impactScore=abs(contribution),
                value=format_value(raw_value),
                explanation=(
                    "This value pushed the model toward higher risk."
                    if direction == "up"
                    else "This value pulled the model away from the higher-risk class."
                ),
            )
        )

    return contributions


def aggregate_deterministic_importance(metadata: dict[str, Any], input_frame: pd.DataFrame):
    importances = metadata["explainability"]["global_importance"]
    baselines = metadata["baselines"]
    contributions = []

    for feature_name, importance in importances.items():
        baseline = baselines[feature_name]
        raw_value = input_frame.iloc[0][feature_name]

        if baseline["type"] == "numeric":
            diff_signal = baseline["positive_median"] - baseline["negative_median"]
            local_delta = float(raw_value) - baseline["overall_median"]
            direction_score = local_delta * diff_signal
            impact = abs(local_delta) / baseline["std"]
            direction = "up" if direction_score > 0 else "down"
            explanation = (
                "Relative to the training baseline, this numeric value aligns more strongly with higher-risk cases."
                if direction == "up"
                else "Relative to the training baseline, this numeric value aligns more closely with lower-risk cases."
            )
        else:
            positive_mode = baseline["positive_mode"]
            negative_mode = baseline["negative_mode"]
            if str(raw_value) == positive_mode and positive_mode != negative_mode:
                direction = "up"
                impact = 1.0
                explanation = "This categorical value is more common among higher-risk cases in the training data."
            elif str(raw_value) == negative_mode and positive_mode != negative_mode:
                direction = "down"
                impact = 1.0
                explanation = "This categorical value is more common among lower-risk cases in the training data."
            else:
                direction = "neutral"
                impact = 0.35
                explanation = "This value had a limited directional effect in the deterministic approximation."

        contributions.append(
            ContributingFactor(
                feature=feature_name,
                label=baseline["label"],
                direction=direction,
                impactScore=float(importance) * float(impact),
                value=format_value(raw_value),
                explanation=explanation,
            )
        )

    return contributions


def get_risk_level(probability: float) -> str:
    if probability >= 0.7:
        return "High"
    if probability >= 0.4:
        return "Moderate"
    return "Low"


def get_module_copy(module_name: str, is_positive: bool, risk_level: str) -> tuple[str, str]:
    if module_name == "diabetes":
        return (
            "Elevated diabetes risk detected" if is_positive else "Lower diabetes risk profile",
            (
                "A clinician should review your glucose-related indicators, especially if this result matches symptoms or prior abnormal labs."
                if is_positive
                else "Your result aligns with a lower diabetes-risk profile. Keep monitoring routine glucose and lifestyle markers."
            ),
        )

    if module_name == "heart":
        return (
            "Cardiovascular risk pattern detected" if is_positive else "Lower heart disease risk profile",
            (
                "Review this result with a clinician, especially if you have chest pain, exercise intolerance, or a family history of heart disease."
                if is_positive
                else "Your result aligns with a lower cardiovascular-risk profile. Maintain regular blood pressure and cholesterol monitoring."
            ),
        )

    if module_name == "kidney":
        return (
            "Kidney disease risk pattern detected" if is_positive else "Lower kidney disease risk profile",
            (
                "This pattern suggests kidney-related markers deserve follow-up. Review creatinine, urea, blood pressure, and urine findings with a clinician."
                if is_positive
                else "Your values align with a lower kidney-risk profile. Continue monitoring renal markers and blood pressure during routine follow-up."
            ),
        )

    return (
        "Liver disease risk pattern detected" if is_positive else "Lower liver disease risk profile",
        (
            "This result suggests liver-related values deserve follow-up. Consider discussing bilirubin and enzyme values with a physician."
            if is_positive
            else "Your liver markers align with a lower-risk profile, but repeat review is still useful when symptoms or abnormal reports are present."
        ),
    )


def predict_tabular(module_name: str, payload: dict[str, Any]) -> PredictionResponse:
    try:
        metadata = read_metadata(module_name)
        model = read_model(module_name)
    except FileNotFoundError as exc:
        return PredictionResponse(
            status="unavailable",
            predictionLabel=f"{module_name.title()} model unavailable",
            probability=0.0,
            confidenceScore=0.0,
            riskLevel="Low",
            contributingFactors=[],
            recommendation="The assessment contract is implemented, but the trained artifact is missing. Train the model in ml-api/models before using this route live.",
            modelName=module_name,
            modelVersion="unavailable",
            warnings=[str(exc)],
        )
    except Exception as exc:
        return PredictionResponse(
            status="error",
            predictionLabel=f"{module_name.title()} model error",
            probability=0.0,
            confidenceScore=0.0,
            riskLevel="Low",
            contributingFactors=[],
            recommendation="The trained model could not be loaded cleanly in the current environment. Retrain the artifact and try again.",
            modelName=module_name,
            modelVersion="error",
            warnings=[str(exc)],
        )

    try:
        schema = metadata["schema"]
        input_frame = pd.DataFrame([payload])[schema["input_columns"]]

        probabilities = model.predict_proba(input_frame)[0]
        positive_probability = float(probabilities[1])
        confidence_score = float(max(probabilities))
        prediction = int(positive_probability >= 0.5)
        risk_level = get_risk_level(positive_probability)
        prediction_label, recommendation = get_module_copy(module_name, prediction == 1, risk_level)

        explainability_type = metadata["explainability"]["type"]
        if explainability_type == "logistic_regression":
            factors = aggregate_logistic_contributions(model, metadata, input_frame)
        else:
            factors = aggregate_deterministic_importance(metadata, input_frame)

        factors = sorted(factors, key=lambda item: item.impactScore, reverse=True)[:5]

        return PredictionResponse(
            status="ok",
            predictionLabel=prediction_label,
            probability=positive_probability,
            confidenceScore=confidence_score,
            riskLevel=risk_level,
            contributingFactors=factors,
            recommendation=recommendation,
            modelName=metadata["best_model"],
            modelVersion=metadata["version"],
            warnings=[],
        )
    except Exception as exc:
        return PredictionResponse(
            status="error",
            predictionLabel=f"{module_name.title()} prediction failed",
            probability=0.0,
            confidenceScore=0.0,
            riskLevel="Low",
            contributingFactors=[],
            recommendation="The model endpoint received the request but could not finish inference. Verify the payload and retrain the artifact if needed.",
            modelName=metadata.get("best_model", module_name),
            modelVersion=metadata.get("version", "error"),
            warnings=[str(exc)],
        )


def predict_xray_unavailable(image_url: str) -> PredictionResponse:
    xray_dir = Path(__file__).resolve().parents[1] / "data" / "xray"
    artifact_candidates = [MODELS_DIR / "xray_model.keras", MODELS_DIR / "xray_model.h5"]
    warnings = []

    if not xray_dir.exists():
        warnings.append(f"X-ray dataset directory not found: {xray_dir}")

    if not any(path.exists() for path in artifact_candidates):
        warnings.append(
            f"X-ray model artifact not found. Expected one of: {artifact_candidates[0]} or {artifact_candidates[1]}"
        )

    return PredictionResponse(
        status="unavailable",
        predictionLabel="Chest X-ray model unavailable",
        probability=0.0,
        confidenceScore=0.0,
        riskLevel="Low",
        contributingFactors=[],
        recommendation="Upload storage is ready, but live X-ray inference will stay unavailable until the dataset directory and trained model artifact are added.",
        modelName="xray",
        modelVersion="unavailable",
        warnings=warnings,
    )
