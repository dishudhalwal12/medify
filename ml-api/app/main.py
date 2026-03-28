from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.health import router as health_router
from routes.models import router as models_router
from routes.predict import router as predict_router


app = FastAPI(
    title="Symptora ML API",
    version="1.0.0",
    description="Inference and model health service for Symptora tabular and X-ray assessments.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(models_router)
app.include_router(predict_router)
