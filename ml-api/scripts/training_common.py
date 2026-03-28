from __future__ import annotations

from typing import Any, Callable

import sys
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from utils.modeling import (
    MODEL_VERSION,
    evaluate_model,
    generic_importance,
    get_baselines,
    logistic_explainability,
    write_artifacts,
)


def build_candidate_models() -> dict[str, object]:
    return {
        "logistic_regression": LogisticRegression(max_iter=2500, random_state=42),
        "random_forest": RandomForestClassifier(n_estimators=300, max_depth=12, random_state=42),
        "svm": SVC(probability=True, kernel="rbf", C=1.0, gamma="scale", random_state=42),
    }


def train_and_save(
    module_name: str,
    x_frame: pd.DataFrame,
    y_values: pd.Series,
    pipeline_factory: Callable[[object], Pipeline],
    schema: dict[str, Any],
) -> None:
    x_train, x_test, y_train, y_test = train_test_split(
        x_frame,
        y_values,
        test_size=0.2,
        random_state=42,
        stratify=y_values,
    )

    candidates = build_candidate_models()
    best_model_name = ""
    best_model = None
    best_metrics = {}
    best_f1 = -1.0
    all_metrics: dict[str, dict[str, float]] = {}

    for model_name, estimator in candidates.items():
        pipeline = pipeline_factory(estimator)
        pipeline.fit(x_train, y_train)
        metrics = evaluate_model(pipeline, x_test, y_test)
        all_metrics[model_name] = metrics

        if metrics["f1_score"] > best_f1:
            best_f1 = metrics["f1_score"]
            best_model_name = model_name
            best_model = pipeline
            best_metrics = metrics

    if best_model is None:
        raise RuntimeError(f"No model could be trained for {module_name}.")

    if best_model_name == "logistic_regression":
        explainability = logistic_explainability(best_model, x_train, x_test, y_test)
    else:
        explainability = generic_importance(best_model, x_test, y_test, best_model_name)

    baselines = get_baselines(x_frame, y_values)

    metrics_payload = {
        "best_metrics": best_metrics,
        "all_results": all_metrics,
        "trainedAt": pd.Timestamp.utcnow().isoformat(),
    }

    write_artifacts(
        module_name=module_name,
        model=best_model,
        best_model_name=best_model_name,
        metrics=metrics_payload,
        schema={**schema, "input_columns": x_frame.columns.tolist()},
        explainability=explainability,
        baselines=baselines,
    )

    print(f"[OK] Trained {module_name} with best model {best_model_name}")
