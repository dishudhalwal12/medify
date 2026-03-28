from __future__ import annotations

from pathlib import Path
import sys

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from scripts.training_common import train_and_save

DATA_PATH = BASE_DIR / "data" / "diabetes.csv"


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    frame = pd.read_csv(DATA_PATH)
    target_column = "Outcome"
    x_frame = frame.drop(columns=[target_column])
    y_values = frame[target_column].astype(int)

    def pipeline_factory(estimator):
        numeric_transformer = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, x_frame.columns.tolist()),
            ]
        )

        return Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("classifier", estimator),
            ]
        )

    train_and_save(
        module_name="diabetes",
        x_frame=x_frame,
        y_values=y_values,
        pipeline_factory=pipeline_factory,
        schema={
            "target_column": target_column,
            "positive_label": 1,
            "negative_label": 0,
            "dropped_columns": [],
        },
    )


if __name__ == "__main__":
    main()
