# Symptora
## Product Requirements Document (PRD)

### 1. Product Overview
Symptora is a web-based machine learning-driven disease prediction and risk assessment platform. The system allows users to create an account, maintain a health profile, upload reports and medical scans, run disease-specific assessments, and receive prediction results with risk categorization, explanations, and saved history.

The product is intended as a production-style academic healthcare application that demonstrates real machine learning usage rather than acting as a simple AI-wrapper tool.

### 2. Product Vision
Build a full-stack health intelligence platform that combines structured medical data, report management, image-based analysis, and machine learning prediction into one end-to-end web application.

### 3. Problem Statement
Many users do not understand how to interpret their health-related data, reports, or basic symptoms. Most student projects in this area stop at one prediction screen and do not offer history, explanation, risk comparison, or record handling. Symptora solves this by combining prediction, tracking, and report-based health analysis into one platform.

### 4. Objectives
- Provide disease prediction using trained machine learning models.
- Provide risk assessment instead of a binary output only.
- Allow secure user authentication and profile creation.
- Allow medical report and scan upload.
- Maintain assessment history and health records.
- Provide understandable explanations of results.
- Keep the system technically defendable for project demonstration and viva.

### 5. Target Users
- Individual users who want health risk assessment.
- Students and evaluators reviewing a complete ML-based healthcare project.
- Admin user managing records, monitoring uploads, and checking system usage.

### 6. Core Product Scope
#### In Scope
- User registration and login
- User profile and health profile management
- Disease-specific tabular prediction modules
- One image-based disease detection module
- File upload for medical reports and scans
- Risk scoring and categorization
- Prediction history and record timeline
- Downloadable assessment report
- Admin dashboard
- Optional AI-powered explanation and report summary support

#### Out of Scope
- Real doctor consultation
- Prescription generation
- Live hospital integration
- Clinical certification
- Emergency response workflows
- Appointment booking system

### 7. Primary Modules
#### 7.1 Authentication Module
Users can sign up, log in, reset password, and manage session securely.

#### 7.2 Health Profile Module
Users can store personal and health-related details such as age, gender, weight, height, existing conditions, family history, lifestyle indicators, and allergies.

#### 7.3 Disease Assessment Module
Users can choose from supported assessments such as:
- Diabetes risk prediction
- Heart disease risk prediction
- Kidney or liver disease risk prediction
- Pneumonia or chest X-ray analysis

#### 7.4 Medical Records Module
Users can upload and store:
- PDF reports
- Blood test reports
- Prescription images
- X-ray images
- Other medical documents

#### 7.5 Risk Analysis Module
The platform converts model outputs into readable risk insights:
- Prediction result
- Probability or confidence score
- Risk level
- Major contributing factors
- Summary explanation

#### 7.6 History and Tracking Module
The system stores every completed assessment and enables users to review past results, compare trends, and access uploaded files.

#### 7.7 AI Explanation Module
An optional AI support layer explains uploaded reports and prediction outcomes in plain language. This module is assistive only and not responsible for core disease prediction.

#### 7.8 Admin Module
Admin can review platform activity, upload counts, user counts, assessment usage, and system statistics.

### 8. Key User Flows
#### Flow 1: User Onboarding
1. User opens landing page.
2. User creates account or logs in.
3. User completes health profile.
4. User lands on dashboard.

#### Flow 2: Manual Disease Assessment
1. User selects an assessment type.
2. User enters required medical values.
3. System validates input.
4. ML model processes the data.
5. Result page shows prediction, risk level, and explanation.
6. Assessment is saved to history.

#### Flow 3: Scan-Based Assessment
1. User chooses image-based analysis.
2. User uploads an X-ray image.
3. Image is processed by the ML model.
4. Result page displays classification and confidence.
5. Result is saved to history.

#### Flow 4: Report Upload and Interpretation
1. User uploads report or PDF.
2. File is saved in storage.
3. Optional extraction or AI summary is generated.
4. User can use relevant values for future assessment.

### 9. Functional Requirements
#### Authentication
- The system shall allow email/password registration and login.
- The system shall support password reset.
- The system shall maintain authenticated sessions.

#### Profile
- The system shall allow users to create and edit a health profile.
- The system shall store personal and medical background data.

#### Assessment
- The system shall support multiple disease prediction modules.
- The system shall validate user input before submission.
- The system shall return prediction, probability, and risk category.
- The system shall save each result to the user history.

#### Reports and Files
- The system shall allow upload of reports and images.
- The system shall store file metadata and URLs.
- The system shall associate uploaded files with the correct user.

#### History
- The system shall list past assessments in chronological order.
- The system shall allow users to open past result details.

#### Admin
- The system shall provide admin access to platform statistics.
- The system shall allow admin review of usage metrics.

### 10. Non-Functional Requirements
- The application should be responsive and stable.
- The system should provide secure authentication and protected routes.
- The platform should maintain acceptable prediction response time.
- Uploaded files should be securely stored.
- The codebase should be modular and maintainable.
- The app should support cloud deployment.

### 11. Success Criteria
- Users can successfully register, log in, and manage health records.
- At least three disease prediction workflows work end-to-end.
- At least one image-based prediction workflow works end-to-end.
- Results are stored and retrievable from history.
- The app can be deployed and demonstrated live.
- The ML pipeline can be clearly explained in viva.

### 12. Risks and Constraints
- Medical datasets may vary in quality and completeness.
- Upload-based value extraction may produce incomplete results.
- Prediction is educational and not a certified diagnosis.
- Image-based prediction accuracy depends on dataset quality.
- Free-tier services may impose rate or storage limits.

### 13. Product Positioning Statement
Symptora is a production-style ML healthcare web application that combines structured data prediction, scan analysis, medical file storage, and risk tracking into one integrated platform.

---

# Symptora
## Technical Requirements Document (TRD)

### 1. Technical Overview
Symptora will be built as a full-stack web application using a JavaScript-based frontend, Firebase for application services, and a Python-based ML API layer for model inference. The architecture separates application management from machine learning execution so the system remains clean, scalable, and technically defendable.

### 2. Recommended Tech Stack
#### Frontend
- Next.js or React
- TypeScript preferred
- Component-based architecture
- Chart library for analytics and trends

#### Application Services
- Firebase Authentication for user auth
- Cloud Firestore for structured app data
- Firebase Storage for uploaded files
- Firebase Hosting for frontend deployment if needed

#### Machine Learning Backend
- Python FastAPI for ML service APIs
- scikit-learn for tabular disease prediction models
- TensorFlow/Keras for image-based classification model

#### Optional AI Layer
- Gemini API for summarization and plain-language explanation only

### 3. System Architecture
#### 3.1 Frontend Layer
Responsible for:
- Authentication pages
- Dashboard
- Forms and data input
- Record display
- Result views
- Admin panel UI
- API communication with Firebase and ML backend

#### 3.2 Firebase Layer
Responsible for:
- Authentication and authorization
- User profile storage
- Assessment history storage
- File metadata storage
- Secure report and scan file storage

#### 3.3 ML Service Layer
Responsible for:
- Loading trained models
- Input preprocessing
- Running prediction inference
- Returning confidence and classification results
- Generating feature importance output where applicable

### 4. Proposed Architecture Flow
1. User authenticates through Firebase.
2. Frontend fetches/stores profile data in Firestore.
3. User submits manual health values or uploads files.
4. Frontend sends required prediction input to FastAPI service.
5. FastAPI preprocesses input and loads correct ML model.
6. Model returns output, confidence, and optional explanation signals.
7. Frontend stores final result in Firestore.
8. File uploads are stored in Firebase Storage.
9. Optional Gemini layer explains results or summarizes reports.

### 5. Disease Prediction Modules
#### 5.1 Tabular Prediction Models
Suggested modules:
- Diabetes prediction
- Heart disease prediction
- Kidney or liver disease prediction

Suggested algorithms:
- Logistic Regression
- Random Forest
- Decision Tree
- Support Vector Machine
- XGBoost if required

Recommended implementation approach:
- Train multiple models per disease dataset.
- Evaluate using accuracy, precision, recall, F1-score.
- Select best-performing model for deployment.

#### 5.2 Image-Based Prediction Model
Suggested module:
- Chest X-ray pneumonia detection

Suggested implementation:
- CNN or transfer learning model
- Use TensorFlow/Keras
- Model outputs class and confidence score

### 6. Data Handling Requirements
#### Input Data Types
- Structured numeric values
- Categorical user inputs
- PDF reports
- Image files such as JPG, PNG, JPEG

#### Preprocessing Requirements
- Missing value handling
- Normalization or scaling where needed
- Label encoding for categorical values
- Feature alignment with trained model schema
- Image resizing and normalization for scan model

### 7. Database Design
#### Collection: users
Fields:
- uid
- fullName
- email
- createdAt
- role

#### Collection: healthProfiles
Fields:
- uid
- age
- gender
- height
- weight
- bloodGroup
- familyHistory
- lifestyleData
- existingConditions
- allergies
- updatedAt

#### Collection: assessments
Fields:
- assessmentId
- uid
- assessmentType
- inputValues
- predictionLabel
- confidenceScore
- riskLevel
- explanationData
- createdAt

#### Collection: uploads
Fields:
- uploadId
- uid
- fileName
- fileType
- fileUrl
- uploadCategory
- extractedText
- createdAt

#### Collection: adminStats
Fields:
- totalUsers
- totalAssessments
- totalUploads
- modelUsageStats
- updatedAt

### 8. API Requirements
#### Prediction Endpoints
- `POST /predict/diabetes`
- `POST /predict/heart`
- `POST /predict/kidney`
- `POST /predict/xray`

#### Utility Endpoints
- `GET /health`
- `GET /models/status`

#### Optional AI Endpoints
- `POST /summarize/report`
- `POST /explain/result`

### 9. Security Requirements
- Firebase-authenticated users only for protected routes.
- Role-based admin access.
- Validation on all form submissions.
- Restricted file upload types and size limits.
- Firestore security rules to isolate per-user data.
- Secure API access between frontend and ML backend.
- Environment variables for API keys and secrets.

### 10. Performance Requirements
- Frontend pages should load efficiently.
- Prediction response should return within acceptable interactive time.
- Uploaded files should be stored and retrieved without broken links.
- ML backend should preload models or cache them for faster inference.

### 11. Deployment Plan
#### Frontend Deployment
- Vercel or Firebase Hosting

#### Backend Deployment
- Render, Railway, or other free/low-cost Python hosting

#### Storage and Database
- Firebase project

### 12. Free-Tier Friendly Plan
To keep the system low-cost or free during development:
- Use Firebase free tier initially.
- Host frontend on Vercel free tier.
- Host FastAPI on Render or Railway free tier where possible.
- Use Gemini AI Studio free tier for optional explanation features.
- Use public academic datasets for model training.

### 13. Logging and Monitoring
- Store API errors and prediction failures in logs.
- Track upload failures.
- Maintain model version tags for deployed models.
- Track assessment counts for admin analytics.

### 14. Development Phases
#### Phase 1
- Setup frontend, Firebase, authentication, routing
- Build user and health profile module

#### Phase 2
- Build tabular disease prediction modules
- Integrate FastAPI backend
- Save results to Firestore

#### Phase 3
- Build file upload and report storage module
- Add history and timeline module

#### Phase 4
- Build X-ray prediction module
- Add admin panel
- Add PDF export and optional Gemini explanation layer

### 15. Technical Acceptance Criteria
- Frontend and backend communicate successfully.
- User authentication and route protection work correctly.
- At least three tabular ML endpoints produce valid predictions.
- One image-based endpoint produces valid results.
- Results are stored and visible in history.
- File upload and retrieval work correctly.
- The platform can be deployed and demonstrated live.

### 16. Final Technical Statement
Firebase should be used for authentication, database, and file storage. Machine learning inference should be handled by a separate Python FastAPI service. Gemini should be treated only as an assistive explanation layer, not as the main disease prediction engine.

