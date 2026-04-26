export type DiseaseSlug =
  | "diabetes"
  | "heart-disease"
  | "liver-disorder"
  | "kidney-disease"
  | "anemia"
  | "thyroid-disorder"
  | "respiratory-infection"
  | "migraine"
  | "hypertension"
  | "uti"
  | "gastroenteritis"
  | "allergic-rhinitis"
  | "asthma-flare"
  | "anxiety-panic";

export type SymptomSeverity = "mild" | "moderate" | "severe";
export type SymptomDuration = "today" | "few-days" | "week-plus" | "recurrent";

export type SymptomDefinition = {
  id: string;
  label: string;
  weight: number;
  aliases: string[];
};

export type DiseaseDefinition = {
  id: DiseaseSlug;
  name: string;
  tagline: string;
  description: string;
  highlight: string;
  caution: string;
  nextSteps: string[];
  measurements: string[];
  redFlags: string[];
  symptoms: SymptomDefinition[];
};

export type DiseaseMatchPreview = {
  disease: DiseaseDefinition;
  probability: number;
  matchedCount: number;
};

export const DISEASE_PROFILES: DiseaseDefinition[] = [
  {
    id: "diabetes",
    name: "Diabetes Risk",
    tagline: "Glucose and insulin-related warning pattern",
    description:
      "Use this when the patient suspects high blood sugar, uncontrolled glucose, or classic metabolic symptoms.",
    highlight: "Useful for thirst, fatigue, blurred vision, and slow recovery signs.",
    caution: "This screen estimates likelihood from reported symptoms. Lab values and clinician review still matter.",
    nextSteps: [
      "Review recent glucose, HbA1c, and medication history.",
      "Escalate promptly if symptoms are worsening or the patient feels faint.",
      "Pair with the diabetes assessment when lab values are available.",
    ],
    measurements: ["Fasting glucose", "HbA1c", "Blood pressure", "Weight and BMI"],
    redFlags: ["Vomiting", "confusion", "deep breathing", "fainting", "severe dehydration"],
    symptoms: [
      { id: "thirst", label: "Increased thirst", weight: 16, aliases: ["thirst", "very thirsty", "dry mouth"] },
      { id: "urination", label: "Frequent urination", weight: 16, aliases: ["urination", "urinate", "peeing often", "frequent pee"] },
      { id: "fatigue", label: "Unusual fatigue", weight: 10, aliases: ["fatigue", "tired", "weakness", "low energy"] },
      { id: "blurred-vision", label: "Blurred vision", weight: 12, aliases: ["blurred vision", "blurry vision"] },
      { id: "weight-loss", label: "Unexpected weight loss", weight: 12, aliases: ["weight loss", "losing weight"] },
      { id: "slow-healing", label: "Slow wound healing", weight: 12, aliases: ["slow healing", "cuts not healing", "wound healing"] },
      { id: "tingling", label: "Tingling in hands or feet", weight: 10, aliases: ["tingling", "numbness", "pins and needles"] },
      { id: "infections", label: "Repeated skin or urinary infections", weight: 12, aliases: ["infection", "uti", "urinary infection", "skin infection"] },
    ],
  },
  {
    id: "heart-disease",
    name: "Heart Disease Risk",
    tagline: "Cardiovascular warning pattern",
    description:
      "Use this when the patient is concerned about circulation, exertion-related symptoms, or chest discomfort.",
    highlight: "Best for chest pain, breathlessness, exercise intolerance, and swelling-related concerns.",
    caution: "Chest pain, breathlessness at rest, or heavy sweating should not wait for a UI result.",
    nextSteps: [
      "Review blood pressure, ECG history, and family history.",
      "Escalate urgently for severe chest pain, fainting, or symptoms at rest.",
      "Move into the heart assessment if structured clinical values are available.",
    ],
    measurements: ["Blood pressure", "Pulse", "SpO2", "ECG", "Lipid profile"],
    redFlags: ["severe chest pain", "fainting", "pain at rest", "blue lips", "heavy sweating"],
    symptoms: [
      { id: "chest-pain", label: "Chest pain or pressure", weight: 18, aliases: ["chest pain", "chest pressure", "tight chest"] },
      { id: "shortness-breath", label: "Shortness of breath", weight: 16, aliases: ["shortness of breath", "breathless", "difficulty breathing"] },
      { id: "exertion-fatigue", label: "Fatigue during activity", weight: 12, aliases: ["fatigue on walking", "tired on stairs", "exercise fatigue"] },
      { id: "palpitations", label: "Irregular heartbeat or palpitations", weight: 12, aliases: ["palpitations", "irregular heartbeat", "racing heart"] },
      { id: "dizziness", label: "Dizziness or light-headedness", weight: 10, aliases: ["dizziness", "light headed", "lightheaded"] },
      { id: "swelling", label: "Swelling in legs or ankles", weight: 10, aliases: ["leg swelling", "ankle swelling", "swelling feet"] },
      { id: "radiating-pain", label: "Pain radiating to arm, shoulder, or jaw", weight: 16, aliases: ["jaw pain", "arm pain", "shoulder pain"] },
      { id: "cold-sweat", label: "Cold sweat or nausea with discomfort", weight: 14, aliases: ["cold sweat", "nausea", "sweating"] },
    ],
  },
  {
    id: "liver-disorder",
    name: "Liver Disorder Risk",
    tagline: "Liver function warning pattern",
    description:
      "Use this when the patient is worried about jaundice, abdominal discomfort, appetite loss, or abnormal liver indicators.",
    highlight: "Designed for symptom-first screening before moving into the liver module.",
    caution: "Yellowing of the eyes, confusion, or abdominal swelling deserves rapid clinical review.",
    nextSteps: [
      "Check bilirubin, enzyme markers, and any known hepatitis or alcohol history.",
      "Review recent appetite change, abdominal symptoms, and urine or stool color.",
      "Open the liver assessment when lab values are available.",
    ],
    measurements: ["Bilirubin", "ALT and AST", "Albumin", "INR", "Hepatitis screen"],
    redFlags: ["confusion", "vomiting blood", "black stool", "severe abdominal swelling", "yellow eyes"],
    symptoms: [
      { id: "jaundice", label: "Yellow eyes or skin", weight: 18, aliases: ["yellow eyes", "yellow skin", "jaundice"] },
      { id: "abdominal-pain", label: "Right upper abdominal pain", weight: 14, aliases: ["upper abdominal pain", "right side pain", "abdominal pain"] },
      { id: "abdominal-swelling", label: "Abdominal swelling or bloating", weight: 12, aliases: ["abdominal swelling", "bloating", "swollen stomach"] },
      { id: "dark-urine", label: "Dark urine", weight: 12, aliases: ["dark urine", "tea colored urine"] },
      { id: "pale-stools", label: "Pale stools", weight: 12, aliases: ["pale stool", "light stool"] },
      { id: "appetite-loss", label: "Loss of appetite or nausea", weight: 10, aliases: ["loss of appetite", "nausea", "can't eat"] },
      { id: "itching", label: "Itchy skin", weight: 8, aliases: ["itching", "itchy skin"] },
      { id: "liver-fatigue", label: "Persistent fatigue", weight: 10, aliases: ["fatigue", "weakness", "tired all the time"] },
    ],
  },
  {
    id: "kidney-disease",
    name: "Kidney Disease Risk",
    tagline: "Renal warning pattern",
    description:
      "Use this when the patient reports urinary changes, swelling, tiredness, or blood pressure-related concerns.",
    highlight: "Useful before the structured kidney module when lab values are not available yet.",
    caution: "Very low urine output, severe swelling, confusion, or breathlessness needs urgent clinical review.",
    nextSteps: [
      "Ask about urine output, frothy urine, swelling, and blood pressure history.",
      "Check creatinine, urea, eGFR, electrolytes, and urine protein when available.",
      "Move into the kidney assessment once renal chemistry and urine findings are ready.",
    ],
    measurements: ["Creatinine", "eGFR", "Urea", "Urine protein", "Blood pressure"],
    redFlags: ["very low urine", "no urine", "severe swelling", "confusion", "breathlessness"],
    symptoms: [
      { id: "urine-change", label: "Change in urination", weight: 16, aliases: ["less urine", "more urine", "urine change", "no urine"] },
      { id: "foamy-urine", label: "Foamy urine", weight: 12, aliases: ["foamy urine", "frothy urine", "bubbles in urine"] },
      { id: "kidney-swelling", label: "Swelling in face, legs, or ankles", weight: 14, aliases: ["face swelling", "leg swelling", "ankle swelling", "swollen feet"] },
      { id: "kidney-fatigue", label: "Persistent fatigue", weight: 10, aliases: ["fatigue", "weakness", "tired"] },
      { id: "high-bp", label: "High blood pressure history", weight: 12, aliases: ["high bp", "high blood pressure", "hypertension"] },
      { id: "back-pain", label: "Flank or lower back pain", weight: 10, aliases: ["flank pain", "kidney pain", "lower back pain"] },
      { id: "nausea-metallic", label: "Nausea or metallic taste", weight: 8, aliases: ["nausea", "metallic taste", "bad taste"] },
      { id: "kidney-breathless", label: "Breathlessness with swelling", weight: 16, aliases: ["breathless", "shortness of breath", "breathing problem"] },
    ],
  },
  {
    id: "anemia",
    name: "Anemia Risk",
    tagline: "Low hemoglobin warning pattern",
    description:
      "Use this when the patient reports tiredness, paleness, dizziness, or exertion intolerance.",
    highlight: "No dataset is needed because this screen maps common reported symptoms to a likelihood band.",
    caution: "Fainting, chest pain, pregnancy with severe weakness, or black stools should be reviewed urgently.",
    nextSteps: [
      "Ask about diet, heavy bleeding, pregnancy, chronic disease, and recent infections.",
      "Check hemoglobin, ferritin, B12, folate, and stool blood when clinically relevant.",
      "Review medications and bleeding history before suggesting supplementation.",
    ],
    measurements: ["Hemoglobin", "Ferritin", "B12", "Folate", "Stool occult blood"],
    redFlags: ["fainting", "chest pain", "black stool", "pregnant", "severe weakness"],
    symptoms: [
      { id: "pale-skin", label: "Pale skin or gums", weight: 14, aliases: ["pale", "pale gums", "pale skin"] },
      { id: "anemia-fatigue", label: "Extreme tiredness", weight: 14, aliases: ["fatigue", "very tired", "weakness"] },
      { id: "dizzy", label: "Dizziness", weight: 10, aliases: ["dizzy", "dizziness", "lightheaded"] },
      { id: "anemia-breathless", label: "Breathless on activity", weight: 12, aliases: ["breathless", "shortness of breath", "tired on stairs"] },
      { id: "fast-heart", label: "Fast heartbeat", weight: 10, aliases: ["fast heartbeat", "palpitations", "racing heart"] },
      { id: "cold-hands", label: "Cold hands or feet", weight: 8, aliases: ["cold hands", "cold feet"] },
      { id: "headache", label: "Headache", weight: 8, aliases: ["headache", "head pain"] },
      { id: "heavy-bleeding", label: "Heavy or recent bleeding", weight: 16, aliases: ["heavy bleeding", "heavy periods", "blood loss"] },
    ],
  },
  {
    id: "thyroid-disorder",
    name: "Thyroid Disorder Risk",
    tagline: "Metabolic speed warning pattern",
    description:
      "Use this when weight, temperature tolerance, mood, bowel, or heartbeat changes suggest thyroid imbalance.",
    highlight: "Works as a symptom-only screen for both underactive and overactive thyroid patterns.",
    caution: "Severe palpitations, confusion, very high fever, or neck swelling with breathing trouble needs urgent review.",
    nextSteps: [
      "Ask about weight trend, heat or cold intolerance, bowel changes, and family thyroid history.",
      "Check TSH and free T4 first, then antibodies or ultrasound if advised.",
      "Review pregnancy status and thyroid medication use before interpreting symptoms.",
    ],
    measurements: ["TSH", "Free T4", "Pulse", "Weight trend", "Thyroid antibodies"],
    redFlags: ["severe palpitations", "confusion", "high fever", "breathing trouble", "neck swelling"],
    symptoms: [
      { id: "weight-change", label: "Unexplained weight change", weight: 14, aliases: ["weight gain", "weight loss", "losing weight"] },
      { id: "temperature-intolerance", label: "Heat or cold intolerance", weight: 12, aliases: ["heat intolerance", "cold intolerance", "always cold", "always hot"] },
      { id: "thyroid-fatigue", label: "Fatigue or sluggishness", weight: 10, aliases: ["fatigue", "sluggish", "low energy"] },
      { id: "hair-skin", label: "Hair fall or dry skin", weight: 10, aliases: ["hair fall", "hair loss", "dry skin"] },
      { id: "bowel-change", label: "Constipation or frequent stools", weight: 10, aliases: ["constipation", "frequent stools", "diarrhea"] },
      { id: "thyroid-palpitations", label: "Palpitations or tremor", weight: 14, aliases: ["palpitations", "tremor", "shaky hands"] },
      { id: "neck-fullness", label: "Neck fullness or swelling", weight: 12, aliases: ["neck swelling", "goiter", "neck fullness"] },
      { id: "mood-sleep", label: "Mood or sleep changes", weight: 8, aliases: ["anxiety", "low mood", "insomnia", "sleepy"] },
    ],
  },
  {
    id: "respiratory-infection",
    name: "Respiratory Infection Risk",
    tagline: "Cough, fever, and breathing pattern",
    description:
      "Use this for common respiratory symptom screening when the patient reports cough, fever, throat, or breathing symptoms.",
    highlight: "Helps separate mild watchful-waiting patterns from symptoms that need a clinician sooner.",
    caution: "Breathlessness at rest, low oxygen, blue lips, confusion, or chest pain needs urgent care.",
    nextSteps: [
      "Ask duration, fever pattern, exposure history, vaccination status, and oxygen saturation if available.",
      "Consider COVID, flu, strep, or chest evaluation depending on local guidance and severity.",
      "Encourage hydration and isolation precautions when infectious symptoms are present.",
    ],
    measurements: ["Temperature", "SpO2", "Respiratory rate", "Pulse", "COVID or flu test"],
    redFlags: ["breathless at rest", "blue lips", "confusion", "chest pain", "low oxygen"],
    symptoms: [
      { id: "cough", label: "Cough", weight: 12, aliases: ["cough", "coughing"] },
      { id: "fever", label: "Fever or chills", weight: 14, aliases: ["fever", "chills", "high temperature"] },
      { id: "sore-throat", label: "Sore throat", weight: 8, aliases: ["sore throat", "throat pain"] },
      { id: "runny-nose", label: "Runny or blocked nose", weight: 8, aliases: ["runny nose", "blocked nose", "congestion"] },
      { id: "body-ache", label: "Body aches", weight: 8, aliases: ["body ache", "body pain", "muscle pain"] },
      { id: "breathing-difficulty", label: "Difficulty breathing", weight: 18, aliases: ["difficulty breathing", "breathless", "shortness of breath"] },
      { id: "phlegm", label: "Phlegm or colored sputum", weight: 10, aliases: ["phlegm", "sputum", "mucus"] },
      { id: "chest-discomfort", label: "Chest discomfort with cough", weight: 12, aliases: ["chest discomfort", "chest pain", "tight chest"] },
    ],
  },
  {
    id: "migraine",
    name: "Migraine Risk",
    tagline: "Recurring headache pattern",
    description:
      "Use this for headache cases with light sensitivity, nausea, visual aura, or recurring one-sided pain.",
    highlight: "Useful when no dataset is needed and the goal is to guide safer next questions.",
    caution: "Sudden worst headache, weakness, seizure, head injury, fever with neck stiffness, or new headache in pregnancy needs urgent care.",
    nextSteps: [
      "Ask onset speed, recurrence, triggers, aura, medicine use, and neurological symptoms.",
      "Track hydration, sleep, screen exposure, skipped meals, and menstrual pattern when relevant.",
      "Escalate if red flags are present or the headache pattern is new and severe.",
    ],
    measurements: ["Blood pressure", "Temperature", "Neurological screen", "Headache duration", "Trigger diary"],
    redFlags: ["worst headache", "weakness", "seizure", "neck stiffness", "head injury"],
    symptoms: [
      { id: "one-sided-headache", label: "One-sided throbbing headache", weight: 16, aliases: ["one-sided headache", "throbbing", "pulsing headache"] },
      { id: "light-sensitive", label: "Light sensitivity", weight: 12, aliases: ["light sensitivity", "photophobia", "bright light"] },
      { id: "sound-sensitive", label: "Sound sensitivity", weight: 8, aliases: ["sound sensitivity", "noise sensitivity"] },
      { id: "migraine-nausea", label: "Nausea or vomiting", weight: 12, aliases: ["nausea", "vomiting", "feel sick"] },
      { id: "aura", label: "Visual aura or spots", weight: 14, aliases: ["aura", "spots", "flashing lights", "zig zag"] },
      { id: "activity-worse", label: "Worse with activity", weight: 10, aliases: ["worse walking", "worse with activity", "movement makes it worse"] },
      { id: "recurring", label: "Recurring similar attacks", weight: 12, aliases: ["recurring", "again and again", "similar headache"] },
      { id: "triggered", label: "Triggered by sleep, food, stress, or screens", weight: 8, aliases: ["stress", "screen", "skipped meal", "less sleep"] },
    ],
  },
  {
    id: "hypertension",
    name: "High Blood Pressure Risk",
    tagline: "Blood pressure warning pattern",
    description:
      "Use this when headaches, dizziness, chest discomfort, or a known high BP history are part of the concern.",
    highlight: "Useful for symptom-first checks before a BP reading or clinician review is available.",
    caution: "Chest pain, severe headache, weakness, confusion, or breathlessness with high BP symptoms needs urgent care.",
    nextSteps: [
      "Take two seated blood pressure readings five minutes apart if a cuff is available.",
      "Ask about missed medicines, kidney disease, pregnancy, chest pain, weakness, and vision change.",
      "Review sodium intake, alcohol, stimulant use, and family history during follow-up.",
    ],
    measurements: ["Blood pressure", "Pulse", "Creatinine", "Urine protein", "ECG if chest symptoms"],
    redFlags: ["chest pain", "severe headache", "weakness", "confusion", "breathlessness", "pregnant"],
    symptoms: [
      { id: "bp-headache", label: "Headache or head pressure", weight: 12, aliases: ["headache", "head pressure", "heavy head"] },
      { id: "bp-dizzy", label: "Dizziness", weight: 10, aliases: ["dizzy", "dizziness", "lightheaded"] },
      { id: "bp-vision", label: "Blurred vision", weight: 12, aliases: ["blurred vision", "vision change", "blurry"] },
      { id: "bp-chest", label: "Chest discomfort", weight: 16, aliases: ["chest pain", "chest discomfort", "tight chest"] },
      { id: "bp-breathless", label: "Shortness of breath", weight: 16, aliases: ["shortness of breath", "breathless", "difficulty breathing"] },
      { id: "bp-nosebleed", label: "Nosebleed", weight: 8, aliases: ["nosebleed", "blood from nose"] },
      { id: "bp-history", label: "Known high BP or missed medicine", weight: 16, aliases: ["high bp", "hypertension", "missed bp medicine"] },
      { id: "bp-swelling", label: "Leg swelling", weight: 10, aliases: ["leg swelling", "ankle swelling", "swollen feet"] },
    ],
  },
  {
    id: "uti",
    name: "Urinary Tract Infection Risk",
    tagline: "Burning urine and bladder pattern",
    description:
      "Use this when burning urination, frequent urination, lower abdominal pain, or urine smell/color changes are reported.",
    highlight: "A practical symptom-only screen for common urinary infection concerns.",
    caution: "Fever with back pain, pregnancy, vomiting, confusion, or blood in urine should be reviewed quickly.",
    nextSteps: [
      "Ask about fever, flank pain, pregnancy, diabetes, hydration, and recent UTI history.",
      "Collect urine routine/microscopy and culture if symptoms are significant or recurrent.",
      "Escalate sooner for back pain, fever, vomiting, or pregnancy.",
    ],
    measurements: ["Temperature", "Urine routine", "Urine culture", "Blood glucose if diabetic", "Pregnancy status"],
    redFlags: ["fever with back pain", "pregnant", "vomiting", "confusion", "blood in urine", "flank pain"],
    symptoms: [
      { id: "burning-urine", label: "Burning while urinating", weight: 18, aliases: ["burning urine", "burning urination", "painful urination"] },
      { id: "frequent-urine", label: "Frequent urination", weight: 14, aliases: ["frequent urination", "urinate often", "peeing often"] },
      { id: "urgent-urine", label: "Urgency to urinate", weight: 12, aliases: ["urgency", "urgent urine", "cannot hold urine"] },
      { id: "lower-abdomen", label: "Lower abdominal pain", weight: 12, aliases: ["lower abdominal pain", "bladder pain", "pelvic pain"] },
      { id: "cloudy-urine", label: "Cloudy or smelly urine", weight: 10, aliases: ["cloudy urine", "smelly urine", "bad smell urine"] },
      { id: "uti-fever", label: "Fever or chills", weight: 14, aliases: ["fever", "chills"] },
      { id: "uti-back-pain", label: "Back or flank pain", weight: 16, aliases: ["back pain", "flank pain", "kidney pain"] },
      { id: "urine-blood", label: "Blood in urine", weight: 16, aliases: ["blood in urine", "red urine", "hematuria"] },
    ],
  },
  {
    id: "gastroenteritis",
    name: "Stomach Infection Risk",
    tagline: "Vomiting and diarrhea pattern",
    description:
      "Use this for vomiting, loose stools, cramps, dehydration, or food-related illness concerns.",
    highlight: "Helps spot dehydration and escalation needs from symptoms alone.",
    caution: "Blood in stool, severe dehydration, persistent vomiting, confusion, or severe abdominal pain needs urgent care.",
    nextSteps: [
      "Ask about stool frequency, vomiting frequency, urine output, fever, travel, and food exposure.",
      "Prioritize oral rehydration and review dehydration signs.",
      "Consider stool testing or clinician review if blood, high fever, or symptoms persist.",
    ],
    measurements: ["Temperature", "Pulse", "Blood pressure", "Hydration status", "Stool test if severe"],
    redFlags: ["blood in stool", "severe dehydration", "persistent vomiting", "confusion", "severe abdominal pain"],
    symptoms: [
      { id: "diarrhea", label: "Loose stools or diarrhea", weight: 18, aliases: ["diarrhea", "loose stool", "watery stool"] },
      { id: "vomiting", label: "Vomiting", weight: 14, aliases: ["vomiting", "throwing up", "can't keep food"] },
      { id: "stomach-cramps", label: "Abdominal cramps", weight: 12, aliases: ["stomach cramps", "abdominal cramps", "belly pain"] },
      { id: "stomach-fever", label: "Fever", weight: 10, aliases: ["fever", "temperature"] },
      { id: "dehydration", label: "Dry mouth or low urine", weight: 16, aliases: ["dry mouth", "low urine", "dehydrated", "no urine"] },
      { id: "nausea-food", label: "Nausea after food", weight: 10, aliases: ["nausea", "food poisoning", "after eating"] },
      { id: "blood-stool", label: "Blood or mucus in stool", weight: 18, aliases: ["blood in stool", "mucus stool", "bloody stool"] },
      { id: "body-weak", label: "Weakness or dizziness", weight: 8, aliases: ["weakness", "dizziness", "very weak"] },
    ],
  },
  {
    id: "allergic-rhinitis",
    name: "Allergy or Rhinitis Risk",
    tagline: "Sneezing and nasal allergy pattern",
    description:
      "Use this when sneezing, itchy eyes, runny nose, or dust/pollen triggers are the main concern.",
    highlight: "Useful for separating allergy-like symptoms from infection-like symptoms.",
    caution: "Wheezing, face swelling, blue lips, or breathing difficulty needs urgent review.",
    nextSteps: [
      "Ask about dust, pollen, pets, seasonal timing, fever, and wheezing.",
      "Review trigger avoidance, hydration, and whether symptoms recur in the same environment.",
      "Escalate if breathing symptoms, facial swelling, or high fever appears.",
    ],
    measurements: ["Temperature", "SpO2 if wheezing", "Trigger diary", "Allergy history", "Medication history"],
    redFlags: ["wheezing", "face swelling", "blue lips", "breathing difficulty", "throat swelling"],
    symptoms: [
      { id: "sneezing", label: "Repeated sneezing", weight: 16, aliases: ["sneezing", "sneeze", "continuous sneezing"] },
      { id: "runny-itchy-nose", label: "Runny or itchy nose", weight: 14, aliases: ["runny nose", "itchy nose", "nasal itching"] },
      { id: "itchy-eyes", label: "Itchy or watery eyes", weight: 14, aliases: ["itchy eyes", "watery eyes", "eye itching"] },
      { id: "blocked-nose-allergy", label: "Blocked nose", weight: 10, aliases: ["blocked nose", "nasal congestion", "stuffy nose"] },
      { id: "allergy-trigger", label: "Dust, pollen, pet, or seasonal trigger", weight: 16, aliases: ["dust", "pollen", "pet", "seasonal", "allergy"] },
      { id: "postnasal", label: "Post-nasal drip or throat clearing", weight: 8, aliases: ["post nasal", "throat clearing", "drip"] },
      { id: "no-fever", label: "No fever with recurring symptoms", weight: 8, aliases: ["no fever", "without fever", "recurring"] },
      { id: "night-morning", label: "Worse morning or night", weight: 8, aliases: ["morning", "night", "worse at night"] },
    ],
  },
  {
    id: "asthma-flare",
    name: "Asthma Flare Risk",
    tagline: "Wheeze and airway tightness pattern",
    description:
      "Use this when wheezing, cough, chest tightness, or trigger-related breathing symptoms are reported.",
    highlight: "Useful as a symptom-only airway risk screen before pulse oximetry or spirometry.",
    caution: "Breathlessness at rest, blue lips, inability to speak full sentences, or low oxygen needs urgent care.",
    nextSteps: [
      "Ask about inhaler use, prior asthma, nighttime cough, triggers, and activity limitation.",
      "Check SpO2, respiratory rate, and response to prescribed reliever inhaler if available.",
      "Escalate quickly if the patient is breathless at rest or cannot speak normally.",
    ],
    measurements: ["SpO2", "Respiratory rate", "Peak flow", "Pulse", "Inhaler response"],
    redFlags: ["breathless at rest", "blue lips", "cannot speak", "low oxygen", "silent chest"],
    symptoms: [
      { id: "wheeze", label: "Wheezing", weight: 18, aliases: ["wheezing", "wheeze", "whistling breath"] },
      { id: "asthma-breathless", label: "Shortness of breath", weight: 18, aliases: ["shortness of breath", "breathless", "difficulty breathing"] },
      { id: "chest-tightness", label: "Chest tightness", weight: 14, aliases: ["chest tightness", "tight chest"] },
      { id: "night-cough", label: "Night or early morning cough", weight: 12, aliases: ["night cough", "morning cough", "cough at night"] },
      { id: "trigger-breath", label: "Triggered by dust, exercise, cold air, or smoke", weight: 14, aliases: ["dust", "exercise", "cold air", "smoke"] },
      { id: "inhaler-use", label: "Needs reliever inhaler more often", weight: 14, aliases: ["inhaler", "salbutamol", "reliever"] },
      { id: "activity-limit", label: "Cannot do usual activity", weight: 12, aliases: ["cannot walk", "activity", "tired walking"] },
      { id: "asthma-history", label: "Known asthma history", weight: 12, aliases: ["asthma", "known asthma"] },
    ],
  },
  {
    id: "anxiety-panic",
    name: "Anxiety or Panic Pattern",
    tagline: "Stress-linked body alarm pattern",
    description:
      "Use this when sudden fear, racing heart, trembling, chest tightness, or breathlessness occurs with stress triggers.",
    highlight: "Helps collect the pattern while still checking for symptoms that should not be dismissed.",
    caution: "New chest pain, fainting, severe breathlessness, weakness, or self-harm thoughts needs urgent support.",
    nextSteps: [
      "Ask about onset, trigger, duration, prior similar episodes, caffeine/stimulants, and safety concerns.",
      "Check pulse, blood pressure, oxygen saturation, and glucose if symptoms are new or severe.",
      "Escalate if chest pain, fainting, neurological symptoms, or self-harm thoughts are present.",
    ],
    measurements: ["Pulse", "Blood pressure", "SpO2", "Glucose if needed", "Mental health safety screen"],
    redFlags: ["chest pain", "fainting", "severe breathlessness", "weakness", "self harm", "suicidal"],
    symptoms: [
      { id: "panic-fear", label: "Sudden fear or panic", weight: 18, aliases: ["panic", "fear", "sudden fear", "anxiety attack"] },
      { id: "panic-heart", label: "Racing heartbeat", weight: 14, aliases: ["racing heart", "palpitations", "fast heartbeat"] },
      { id: "panic-breath", label: "Shortness of breath", weight: 12, aliases: ["shortness of breath", "breathless", "can't breathe"] },
      { id: "panic-tremble", label: "Trembling or shaking", weight: 12, aliases: ["trembling", "shaking", "shaky"] },
      { id: "panic-sweat", label: "Sweating", weight: 10, aliases: ["sweating", "sweaty"] },
      { id: "panic-tingle", label: "Tingling or numbness", weight: 10, aliases: ["tingling", "numbness", "pins and needles"] },
      { id: "panic-trigger", label: "Stress or crowded-place trigger", weight: 12, aliases: ["stress", "crowd", "public place", "trigger"] },
      { id: "panic-recurrent", label: "Similar previous episodes", weight: 10, aliases: ["again", "previous", "recurring", "same episode"] },
    ],
  },
];

export type SymptomLikelihoodResult = {
  disease: DiseaseDefinition;
  probability: number;
  band: "Low watch" | "Moderate watch" | "High attention";
  explanation: string;
  matchedSymptoms: SymptomDefinition[];
  noteMatches: SymptomDefinition[];
  missingSignals: SymptomDefinition[];
  confidenceLabel: string;
  urgencyLabel: "Routine watch" | "Soon review" | "Urgent review";
  redFlagMatches: string[];
  alternativeMatches: DiseaseMatchPreview[];
  visitSummary: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getDiseaseProfile(id: DiseaseSlug) {
  return DISEASE_PROFILES.find((profile) => profile.id === id) ?? DISEASE_PROFILES[0];
}

export function inferSymptomLikelihood(input: {
  diseaseId: DiseaseSlug;
  selectedSymptoms: string[];
  notes: string;
  severity?: SymptomSeverity;
  duration?: SymptomDuration;
}): SymptomLikelihoodResult {
  const disease = getDiseaseProfile(input.diseaseId);
  const normalizedNotes = input.notes.toLowerCase();

  const noteMatches = disease.symptoms.filter((symptom) =>
    symptom.aliases.some((alias) => normalizedNotes.includes(alias))
  );
  const redFlagMatches = disease.redFlags.filter((flag) => normalizedNotes.includes(flag.toLowerCase()));

  const matchedIds = new Set([...input.selectedSymptoms, ...noteMatches.map((symptom) => symptom.id)]);
  const matchedSymptoms = disease.symptoms.filter((symptom) => matchedIds.has(symptom.id));
  const totalWeight = disease.symptoms.reduce((sum, symptom) => sum + symptom.weight, 0);
  const matchedWeight = matchedSymptoms.reduce((sum, symptom) => sum + symptom.weight, 0);
  const coverage = totalWeight === 0 ? 0 : matchedWeight / totalWeight;
  const strongSignals = matchedSymptoms.filter((symptom) => symptom.weight >= 14).length;

  const severityBoost = input.severity === "severe" ? 10 : input.severity === "moderate" ? 5 : 0;
  const durationBoost =
    input.duration === "recurrent" ? 8 : input.duration === "week-plus" ? 6 : input.duration === "few-days" ? 3 : 0;

  const probability =
    matchedSymptoms.length === 0
      ? 8
      : clamp(
          Math.round(12 + coverage * 70 + strongSignals * 4 + Math.min(input.selectedSymptoms.length, 4) + severityBoost + durationBoost),
          12,
          96
        );

  const band =
    probability >= 70 ? "High attention" : probability >= 40 ? "Moderate watch" : "Low watch";

  const confidenceLabel =
    matchedSymptoms.length >= 5
      ? "Stronger match across multiple symptoms"
      : matchedSymptoms.length >= 3
        ? "Useful early pattern match"
      : "Preliminary symptom signal";

  const urgencyLabel =
    redFlagMatches.length > 0 || probability >= 78 || input.severity === "severe"
      ? "Urgent review"
      : probability >= 45 || strongSignals >= 2
        ? "Soon review"
        : "Routine watch";

  const missingSignals = disease.symptoms
    .filter((symptom) => !matchedIds.has(symptom.id))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  const explanation =
    matchedSymptoms.length === 0
      ? `Select symptoms or describe them in notes to estimate how closely the reported pattern matches ${disease.name.toLowerCase()}.`
      : `The current estimate is driven mainly by ${matchedSymptoms
          .slice(0, 3)
          .map((symptom) => symptom.label.toLowerCase())
          .join(", ")}. This gives an early indication of how closely the reported symptoms align with a ${disease.name.toLowerCase()} pattern.`;

  const visitSummary = [
    `Concern: ${disease.name}`,
    `Severity: ${input.severity || "Not set"}`,
    `Duration: ${input.duration || "Not set"}`,
    `Likelihood: ${probability}% (${band})`,
    `Urgency: ${urgencyLabel}`,
    `Matched symptoms: ${matchedSymptoms.map((symptom) => symptom.label).join(", ") || "None selected yet"}`,
    `Useful measurements: ${disease.measurements.join(", ")}`,
    input.notes.trim() ? `Patient notes: ${input.notes.trim()}` : "Patient notes: Not added",
  ].join("\n");

  return {
    disease,
    probability,
    band,
    explanation,
    matchedSymptoms,
    noteMatches,
    missingSignals,
    confidenceLabel,
    urgencyLabel,
    redFlagMatches,
    alternativeMatches: getAlternativeMatches({
      diseaseId: input.diseaseId,
      selectedSymptoms: input.selectedSymptoms,
      notes: input.notes,
      severity: input.severity,
      duration: input.duration,
    }),
    visitSummary,
  };
}

function scoreDisease(input: {
  disease: DiseaseDefinition;
  selectedSymptoms: string[];
  notes: string;
  severity?: SymptomSeverity;
  duration?: SymptomDuration;
}) {
  const normalizedNotes = input.notes.toLowerCase();
  const noteMatches = input.disease.symptoms.filter((symptom) =>
    symptom.aliases.some((alias) => normalizedNotes.includes(alias))
  );
  const matchedIds = new Set([...input.selectedSymptoms, ...noteMatches.map((symptom) => symptom.id)]);
  const matchedSymptoms = input.disease.symptoms.filter((symptom) => matchedIds.has(symptom.id));
  const totalWeight = input.disease.symptoms.reduce((sum, symptom) => sum + symptom.weight, 0);
  const matchedWeight = matchedSymptoms.reduce((sum, symptom) => sum + symptom.weight, 0);
  const coverage = totalWeight === 0 ? 0 : matchedWeight / totalWeight;
  const strongSignals = matchedSymptoms.filter((symptom) => symptom.weight >= 14).length;
  const severityBoost = input.severity === "severe" ? 10 : input.severity === "moderate" ? 5 : 0;
  const durationBoost =
    input.duration === "recurrent" ? 8 : input.duration === "week-plus" ? 6 : input.duration === "few-days" ? 3 : 0;

  const probability =
    matchedSymptoms.length === 0
      ? 8
      : clamp(Math.round(12 + coverage * 70 + strongSignals * 4 + Math.min(matchedSymptoms.length, 4) + severityBoost + durationBoost), 12, 96);

  return { probability, matchedCount: matchedSymptoms.length };
}

export function getAlternativeMatches(input: {
  diseaseId: DiseaseSlug;
  selectedSymptoms: string[];
  notes: string;
  severity?: SymptomSeverity;
  duration?: SymptomDuration;
}): DiseaseMatchPreview[] {
  return DISEASE_PROFILES
    .filter((disease) => disease.id !== input.diseaseId)
    .map((disease) => ({
      disease,
      ...scoreDisease({
        disease,
        selectedSymptoms: input.selectedSymptoms,
        notes: input.notes,
        severity: input.severity,
        duration: input.duration,
      }),
    }))
    .filter((match) => match.matchedCount > 0)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);
}
