from fastapi import APIRouter

from services.model_registry import get_model_status

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/status")
def model_status():
    return get_model_status()
