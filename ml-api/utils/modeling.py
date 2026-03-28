from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score


MODEL_VERSION = "1.0.0"
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def evaluate_model(model, x_test: pd.DataFrame, y_test: pd.Series) -> dict[str, float]:
    predictions = model.predict(x_test)
    return {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "precision": float(precision_score(y_test, predictions, zero_division=0)),
        "recall": float(recall_score(y_test, predictions, zero_division=0)),
        "f1_score": float(f1_score(y_test, predictions, zero_division=0)),
    }


def feature_label(feature_name: str) -> str:
    return feature_name.replace("_", " ").replace(".", " ").strip().title()


def get_baselines(x_frame: pd.DataFrame, y_values: pd.Series) -> dict[str, dict[str, Any]]:
    baselines: dict[str, dict[str, Any]] = {}
    positive = x_frame[y_values == 1]
    negative = x_frame[y_values == 0]

    for column in x_frame.columns:
        series = x_frame[column]
        if pd.api.types.is_numeric_dtype(series):
            overall_std = float(series.std()) if pd.notna(series.std()) and float(series.std()) > 0 else 1.0
            baselines[column] = {
                "type": "numeric",
                "overall_median": float(series.median()),
                "positive_median": float(positive[column].median()) if not positive.empty else float(series.median()),
                "negative_median": float(negative[column].median()) if not negative.empty else float(series.median()),
                "std": overall_std,
                "label": feature_label(column),
            }
        else:
            baselines[column] = {
                "type": "categorical",
                "overall_mode": str(series.mode(dropna=True).iloc[0]) if not series.mode(dropna=True).empty else "",
                "positive_mode": str(positive[column].mode(dropna=True).iloc[0]) if not positive[column].mode(dropna=True).empty else "",
                "negative_mode": str(negative[column].mode(dropna=True).iloc[0]) if not negative[column].mode(dropna=True).empty else "",
                "label": feature_label(column),
            }

    return baselines


def logistic_explainability(model, x_train: pd.DataFrame, x_test: pd.DataFrame, y_test: pd.Series) -> dict[str, Any]:
    pipeline = model
    preprocessor = pipeline.named_steps["preprocessor"]
    classifier = pipeline.named_steps["classifier"]
    transformed_names = list(preprocessor.get_feature_names_out())
    coefficients = classifier.coef_[0].tolist()
    source_map: dict[str, list[int]] = {}
    input_columns = sorted(x_train.columns.tolist(), key=len, reverse=True)

    for index, name in enumerate(transformed_names):
        suffix = name.split("__", 1)[-1]
        feature_name = suffix
        for candidate in input_columns:
            if suffix == candidate or suffix.startswith(f"{candidate}_"):
                feature_name = candidate
                break
        source_map.setdefault(feature_name, []).append(index)

    global_importance = {}
    for feature_name, indices in source_map.items():
        score = float(sum(abs(coefficients[idx]) for idx in indices))
        global_importance[feature_name] = score

    return {
        "type": "logistic_regression",
        "transformed_features": transformed_names,
        "coefficients": coefficients,
        "source_map": source_map,
        "global_importance": global_importance,
    }


def generic_importance(model, x_test: pd.DataFrame, y_test: pd.Series, model_type: str) -> dict[str, Any]:
    importance = permutation_importance(
        model,
        x_test,
        y_test,
        n_repeats=10,
        random_state=42,
        scoring="f1",
    )
    values = {
        feature_name: float(score)
        for feature_name, score in zip(x_test.columns.tolist(), importance.importances_mean.tolist())
    }
    return {
        "type": model_type,
        "global_importance": values,
    }


def write_artifacts(
    module_name: str,
    model,
    best_model_name: str,
    metrics: dict[str, Any],
    schema: dict[str, Any],
    explainability: dict[str, Any],
    baselines: dict[str, Any],
) -> None:
    model_path = MODELS_DIR / f"{module_name}_model.joblib"
    metadata_path = MODELS_DIR / f"{module_name}_metadata.json"
    metrics_path = MODELS_DIR / f"{module_name}_metrics.json"

    joblib.dump(model, model_path)

    payload = {
      "module": module_name,
      "version": MODEL_VERSION,
      "best_model": best_model_name,
      "metrics": metrics,
      "schema": schema,
      "baselines": baselines,
      "explainability": explainability,
    }

    metadata_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")


def read_metadata(module_name: str) -> dict[str, Any]:
    metadata_path = MODELS_DIR / f"{module_name}_metadata.json"
    if not metadata_path.exists():
        raise FileNotFoundError(f"Metadata file not found for {module_name}: {metadata_path}")
    return json.loads(metadata_path.read_text(encoding="utf-8"))


def read_model(module_name: str):
    model_path = MODELS_DIR / f"{module_name}_model.joblib"
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found for {module_name}: {model_path}")
    return joblib.load(model_path)
