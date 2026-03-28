from fastapi import APIRouter, HTTPException

from schemas.prediction import (
    DiabetesPredictionRequest,
    HeartPredictionRequest,
    KidneyPredictionRequest,
    LiverPredictionRequest,
    PredictionResponse,
    XrayPredictionRequest,
)
from services.predictor import predict_tabular, predict_xray_unavailable

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("/diabetes", response_model=PredictionResponse)
def predict_diabetes(payload: DiabetesPredictionRequest):
    return predict_tabular("diabetes", payload.model_dump())


@router.post("/heart", response_model=PredictionResponse)
def predict_heart(payload: HeartPredictionRequest):
    return predict_tabular("heart", payload.model_dump())


@router.post("/liver", response_model=PredictionResponse)
def predict_liver(payload: LiverPredictionRequest):
    return predict_tabular("liver", payload.model_dump())


@router.post("/kidney", response_model=PredictionResponse)
def predict_kidney(payload: KidneyPredictionRequest):
    return predict_tabular("kidney", payload.model_dump())


@router.post("/xray", response_model=PredictionResponse)
def predict_xray(payload: XrayPredictionRequest):
    return predict_xray_unavailable(payload.imageUrl)
