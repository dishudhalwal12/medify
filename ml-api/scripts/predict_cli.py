from __future__ import annotations

import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from services.model_registry import get_model_status
from services.predictor import predict_tabular, predict_xray_unavailable


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing command"}))
        return 1

    command = sys.argv[1]

    if command == "health":
        print(json.dumps({"status": "ok"}))
        return 0

    if command == "models-status":
        print(json.dumps(get_model_status()))
        return 0

    if command == "predict":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Usage: predict <module> <payload-json>"}))
            return 1

        module_name = sys.argv[2]
        payload = json.loads(sys.argv[3])

        if module_name == "xray":
            result = predict_xray_unavailable(payload.get("imageUrl", ""))
        else:
            result = predict_tabular(module_name, payload)

        print(result.model_dump_json())
        return 0

    print(json.dumps({"error": f"Unknown command: {command}"}))
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
