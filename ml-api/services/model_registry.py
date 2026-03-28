from __future__ import annotations

from pathlib import Path

from utils.modeling import MODELS_DIR, read_metadata


def get_model_status() -> dict[str, list[dict[str, object]]]:
    items = []
    for module_name in ("diabetes", "heart", "kidney", "liver", "xray"):
        model_path = MODELS_DIR / f"{module_name}_model.joblib"
        metadata_path = MODELS_DIR / f"{module_name}_metadata.json"
        if module_name == "xray":
            keras_candidates = [
                MODELS_DIR / "xray_model.keras",
                MODELS_DIR / "xray_model.h5",
            ]
            has_xray_model = any(path.exists() for path in keras_candidates)
            items.append(
                {
                    "modelName": "xray",
                    "ready": has_xray_model,
                    "status": "ready" if has_xray_model else "missing",
                    "artifactPath": str(next((path for path in keras_candidates if path.exists()), keras_candidates[0])),
                }
            )
            continue

        if model_path.exists() and metadata_path.exists():
            metadata = read_metadata(module_name)
            items.append(
                {
                    "modelName": module_name,
                    "ready": True,
                    "status": "ready",
                    "version": metadata["version"],
                    "bestModel": metadata["best_model"],
                    "metrics": metadata["metrics"]["best_metrics"],
                    "artifactPath": str(model_path),
                }
            )
        else:
            items.append(
                {
                    "modelName": module_name,
                    "ready": False,
                    "status": "missing",
                    "artifactPath": str(model_path),
                }
            )

    return {"models": items}
