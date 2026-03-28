from __future__ import annotations

from pathlib import Path
import sys

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from scripts.training_common import train_and_save

DATA_PATH = BASE_DIR / "data" / "kidney.csv"


def clean_kidney_frame(frame: pd.DataFrame) -> pd.DataFrame:
    cleaned = frame.copy()

    for column in cleaned.columns:
        if cleaned[column].dtype == object:
            cleaned[column] = (
                cleaned[column]
                .astype(str)
                .str.strip()
                .replace({"?": np.nan, "nan": np.nan})
            )

    for column in ("pcv", "wc", "rc"):
        cleaned[column] = pd.to_numeric(cleaned[column], errors="coerce")

    cleaned["classification"] = cleaned["classification"].map({"ckd": 1, "notckd": 0}).astype(int)

    return cleaned


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    frame = clean_kidney_frame(pd.read_csv(DATA_PATH))
    target_column = "classification"
    dropped_columns = ["id"]
    x_frame = frame.drop(columns=dropped_columns + [target_column])
    y_values = frame[target_column].astype(int)

    numeric_features = x_frame.select_dtypes(include=["number", "float64", "int64"]).columns.tolist()
    categorical_features = [feature for feature in x_frame.columns.tolist() if feature not in numeric_features]

    def pipeline_factory(estimator):
        numeric_transformer = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )
        categorical_transformer = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore")),
            ]
        )

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, numeric_features),
                ("cat", categorical_transformer, categorical_features),
            ]
        )

        return Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("classifier", estimator),
            ]
        )

    train_and_save(
        module_name="kidney",
        x_frame=x_frame,
        y_values=y_values,
        pipeline_factory=pipeline_factory,
        schema={
            "target_column": target_column,
            "positive_label": 1,
            "negative_label": 0,
            "target_mapping": {
                "classification=ckd": "higher kidney disease risk class",
                "classification=notckd": "lower kidney disease risk class",
            },
            "dropped_columns": dropped_columns,
        },
    )


if __name__ == "__main__":
    main()
