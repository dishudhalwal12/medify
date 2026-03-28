from pydantic import BaseModel, Field, HttpUrl


class ContributingFactor(BaseModel):
    feature: str
    label: str
    direction: str
    impactScore: float
    value: str
    explanation: str


class PredictionResponse(BaseModel):
    status: str
    predictionLabel: str
    probability: float
    confidenceScore: float
    riskLevel: str
    contributingFactors: list[ContributingFactor]
    recommendation: str
    modelName: str
    modelVersion: str
    warnings: list[str]


class DiabetesPredictionRequest(BaseModel):
    Pregnancies: int = Field(ge=0, le=20)
    Glucose: float = Field(ge=0, le=300)
    BloodPressure: float = Field(ge=0, le=200)
    SkinThickness: float = Field(ge=0, le=120)
    Insulin: float = Field(ge=0, le=1000)
    BMI: float = Field(ge=0, le=80)
    DiabetesPedigreeFunction: float = Field(ge=0, le=3)
    Age: int = Field(ge=1, le=120)


class HeartPredictionRequest(BaseModel):
    age: int = Field(ge=1, le=120)
    sex: str
    cp: str
    trestbps: float = Field(ge=50, le=260)
    chol: float = Field(ge=50, le=700)
    fbs: bool
    restecg: str
    thalch: float = Field(ge=30, le=250)
    exang: bool
    oldpeak: float = Field(ge=0, le=10)
    slope: str
    ca: str
    thal: str


class LiverPredictionRequest(BaseModel):
    Age: int = Field(ge=1, le=120)
    Gender: str
    Total_Bilirubin: float = Field(ge=0, le=80)
    Direct_Bilirubin: float = Field(ge=0, le=40)
    Alkaline_Phosphotase: float = Field(ge=0, le=2500)
    Alamine_Aminotransferase: float = Field(ge=0, le=2500)
    Aspartate_Aminotransferase: float = Field(ge=0, le=2500)
    Total_Protiens: float = Field(ge=0, le=15)
    Albumin: float = Field(ge=0, le=10)
    Albumin_and_Globulin_Ratio: float = Field(ge=0, le=5)


class KidneyPredictionRequest(BaseModel):
    age: int = Field(ge=1, le=120)
    bp: float = Field(ge=0, le=250)
    sg: float = Field(ge=1, le=2)
    al: float = Field(ge=0, le=5)
    su: float = Field(ge=0, le=5)
    rbc: str
    pc: str
    pcc: str
    ba: str
    bgr: float = Field(ge=0, le=500)
    bu: float = Field(ge=0, le=400)
    sc: float = Field(ge=0, le=80)
    sod: float = Field(ge=0, le=200)
    pot: float = Field(ge=0, le=20)
    hemo: float = Field(ge=0, le=25)
    pcv: float = Field(ge=0, le=70)
    wc: float = Field(ge=0, le=30000)
    rc: float = Field(ge=0, le=10)
    htn: str
    dm: str
    cad: str
    appet: str
    pe: str
    ane: str


class XrayPredictionRequest(BaseModel):
    imageUrl: str
