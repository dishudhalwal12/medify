from __future__ import annotations

from pathlib import Path
import sys

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from scripts.training_common import train_and_save

DATA_PATH = BASE_DIR / "data" / "liver.csv"


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    frame = pd.read_csv(DATA_PATH)
    target_column = "Dataset"
    frame[target_column] = frame[target_column].map({1: 1, 2: 0})
    x_frame = frame.drop(columns=[target_column])
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
        module_name="liver",
        x_frame=x_frame,
        y_values=y_values,
        pipeline_factory=pipeline_factory,
        schema={
            "target_column": target_column,
            "positive_label": 1,
            "negative_label": 0,
            "target_mapping": {
                "Dataset=1": "higher liver disease risk class",
                "Dataset=2": "lower liver disease risk class",
            },
            "dropped_columns": [],
        },
    )


if __name__ == "__main__":
    main()
