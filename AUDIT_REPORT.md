# Symptora Audit Report

Date: 2026-03-23
Workspace: `/Users/divyanshusaini/Downloads/Symptora`
App stack: Next.js 16.2.1, React 19, Firebase Auth/Firestore/Storage, FastAPI ML API, Gemini assistive routes

## 1. Executive Summary

This app is no longer a blank student UI. It has a real multi-page product structure with authentication, dashboard, health profile, assessments, records, history, insights, settings, and admin views. The diabetes, heart, and liver assessment flows are implemented end-to-end in the frontend and service layer. Record upload, record linking, PDF export, AI explanation, and record summarization are also wired.

The biggest current risk is infrastructure reliability, not missing screen count. The frontend code is mostly present, but the real browser/runtime still reports Firestore offline errors in this environment. Because of that, a large part of the product can render but may fail to load or save live data unless Firebase connectivity, rules, and project setup are correct.

There is also a product-flow mismatch: the original document describes a dedicated onboarding flow, but the current app now uses a dashboard-first intake flow. The old `/onboarding` page still exists, but registration now sends users directly to `/dashboard`, where charts stay locked until enough health questions are answered.

## 2. Current High-Level Status

### Working or largely implemented

- Landing page and authenticated shell UI
- Email/password login, register, logout, password reset
- Dashboard-first health intake
- Health profile edit page
- Diabetes assessment workflow
- Heart assessment workflow
- Liver assessment workflow
- X-ray upload workflow
- Assessment history and detail views
- Record upload, archive, delete, and detail views
- AI explanation route for assessment results
- AI summary route for uploaded records
- PDF export for result detail
- Admin dashboard, users, records, analytics, models, and system health pages

### Partially implemented

- X-ray flow is structurally wired, but the actual model may be unavailable depending on missing backend artifacts
- Dashboard personalization works only after baseline profile data is saved
- Admin analytics and stats exist, but some values are approximated or depend fully on Firebase availability
- `/onboarding` still exists but is no longer the primary user path

### Missing or not truly complete

- Kidney prediction module is not implemented
- OCR-based automatic report extraction is not implemented
- Reminders/push notifications are not implemented
- Doctor-facing review mode is not implemented
- True storage usage reporting is not implemented
- Reliable offline-free Firebase behavior is not achieved in this environment

## 3. Architecture and Data Flow

### Frontend

- Next.js App Router under `src/app`
- Protected app shell under `src/app/(main)`
- Shared navigation in `src/components/layout/Shell.tsx`

### Firebase

- Auth: email/password session handling
- Firestore collections used by the app:
  - `users`
  - `healthProfiles`
  - `assessments`
  - `uploads`
  - `insights`
  - `modelMetadata`
- Storage:
  - report uploads under `users/{uid}/reports/...`
  - prescriptions under `users/{uid}/prescriptions/...`
  - X-rays under `users/{uid}/xrays/...`
  - misc files under `users/{uid}/other/...`

### ML API

- Base URL from `NEXT_PUBLIC_ML_API_BASE_URL`
- Endpoints used:
  - `POST /predict/diabetes`
  - `POST /predict/heart`
  - `POST /predict/liver`
  - `POST /predict/xray`
  - `GET /health`
  - `GET /models/status`

### AI layer

- Next.js API routes:
  - `src/app/api/ai/explain/route.ts`
  - `src/app/api/ai/summarize/route.ts`
- Used only for explanation/summarization, not prediction

## 4. Route Inventory

### Public routes

- `/` landing page
- `/login`
- `/register`
- `/forgot-password`
- `/admin/login`
- `/onboarding` legacy onboarding route still present

### Authenticated user routes

- `/dashboard`
- `/profile`
- `/assessments`
- `/assessments/diabetes`
- `/assessments/heart`
- `/assessments/kidney-or-liver`
- `/assessments/kidney` redirect only
- `/assessments/xray`
- `/records`
- `/records/[id]`
- `/history`
- `/history/[id]`
- `/result/[id]`
- `/insights`
- `/settings`

### Admin routes

- `/admin/dashboard`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/records`
- `/admin/records/[id]`
- `/admin/analytics`
- `/admin/models`
- `/admin/system-health`

## 5. Navigation and Global Buttons

Source: `src/components/layout/Shell.tsx`

- `Dashboard` -> `/dashboard`
- `Health Profile` -> `/profile`
- `Assessments` -> `/assessments`
- `Records` -> `/records`
- `History` -> `/history`
- `Insights` -> `/insights`
- `Settings` -> `/settings`
- `Admin control room` -> `/admin/dashboard` when `user.role === "admin"`
- `Sign out` -> `logout()` then redirects to `/login`

## 6. Public Flow Audit

### 6.1 Landing page: `/`

Source: `src/app/page.tsx`

Buttons and links:

- `Sign in` -> `/login`
- `Create account` -> `/register`
- `Start the onboarding flow` -> `/register`
- `Open dashboard` -> `/login`
- `Create your Symptora account` -> `/register`

Notes:

- Copy is partially stale. The app no longer sends users into onboarding first, even though the landing page still says “Start the onboarding flow.”
- This page is a marketing/entry page only. No direct data calls.

### 6.2 Login: `/login`

Source: `src/app/login/page.tsx`

Workflow:

1. User enters email and password.
2. Submit calls `useAuth().login(email, password)`.
3. `authService.login(...)` signs into Firebase Auth.
4. App attempts to update `users/{uid}.lastLoginAt`.
5. App resolves user role/name from Firestore when possible, or falls back to auth user.
6. User is routed to `/dashboard`.

Buttons and links:

- `Forgot password?` -> `/forgot-password`
- `Sign in` -> login flow above
- `Open admin sign-in` -> `/admin/login`
- `Create an account` -> `/register`

Current situation:

- Auth errors are normalized to better messages.
- If Firestore user doc lookup fails, the app can still fall back to a basic authenticated session.

### 6.3 Register: `/register`

Source: `src/app/register/page.tsx`

Workflow:

1. User enters full name, email, password.
2. Submit calls `useAuth().register(email, password, fullName)`.
3. Firebase Auth account is created.
4. Firestore bootstrap for `users/{uid}` and `healthProfiles/{uid}` is kicked off in the background.
5. UI does not wait for full bootstrap.
6. User is routed directly to `/dashboard`.

Buttons and links:

- `Create account` -> register flow above
- `Sign in` -> `/login`

Current situation:

- This was optimized for speed.
- Dedicated onboarding is bypassed.
- If Firestore is unavailable, the user can still be authenticated, but profile/dashboard data may fail later.

### 6.4 Forgot password: `/forgot-password`

Source: `src/app/forgot-password/page.tsx`

Workflow:

1. User enters email.
2. Submit calls `useAuth().resetPassword(email)`.
3. Firebase sends password reset email if account exists.

Buttons and links:

- `Send password reset` -> password reset action
- `Back to sign in` -> `/login` after success

### 6.5 Admin login: `/admin/login`

Source: `src/app/admin/login/page.tsx`

Workflow:

1. User signs in through normal Firebase auth.
2. Returned auth user is checked for `role === "admin"`.
3. If true, route to `/admin/dashboard`.
4. If false, show inline error that the account is not marked as admin in Firestore.

Buttons:

- `Enter admin workspace` -> admin auth flow

Important dependency:

- This depends on `users/{uid}.role` being available in Firestore.
- If Firestore is unavailable, admin detection becomes unreliable.

## 7. Main User Flow Audit

### 7.1 Dashboard: `/dashboard`

Source: `src/app/(main)/dashboard/page.tsx`

Current workflow:

1. On load, app fetches:
   - profile via `profileService.getProfile(userId)`
   - assessment history via `assessmentService.getHistory(userId)`
   - uploads via `recordsService.getRecords(userId)`
2. App computes profile completion using `getProfileCompletion(...)`.
3. If completion is below 55%, dashboard shows health intake form first.
4. If completion is 55% or higher, app loads/builds `insights/{uid}` and shows charts/recommendations.

Intake questions currently asked on dashboard:

- Age
- Gender
- Height
- Weight
- Blood group
- Smoking status
- Alcohol use
- Activity level
- Sleep pattern
- Systolic BP
- Diastolic BP
- Fasting glucose
- Cholesterol

Primary button:

- `Save answers and unlock charts`
  - Calls `profileService.updateProfile(user.uid, ...)`
  - Then reloads assessment history and records
  - Then loads or rebuilds insights

Quick actions after unlock:

- `Run diabetes assessment` -> `/assessments/diabetes`
- `Run heart assessment` -> `/assessments/heart`
- `Open organ module` -> `/assessments/kidney-or-liver`
- `Upload medical record` -> `/records`
- `Open insights` -> `/insights`
- `Open result detail` on latest result -> `/result/{id}`
- Recent upload item click -> `/records/{id}`
- `View history` -> `/history`

Current situation:

- This is the real onboarding gate now.
- Dashboard-first intake is implemented.
- If Firestore save fails, charts will not unlock consistently.

### 7.2 Health profile: `/profile`

Source: `src/app/(main)/profile/page.tsx`

Workflow:

1. Load profile from `healthProfiles/{uid}`.
2. Show completeness, BMI, and lifestyle snapshot.
3. User edits demographic, lifestyle, history, allergy, medication, and baseline lab fields.
4. Save writes back through `profileService.updateProfile(...)`.

Buttons:

- `Clear list fields`
  - Clears only:
    - family history
    - existing conditions
    - allergies
    - medications
- `Save health profile`
  - Updates `healthProfiles/{uid}`

Current situation:

- This page is functional and broader than the dashboard intake form.
- It is the main place for detailed profile editing after initial setup.

### 7.3 Assessments hub: `/assessments`

Source: `src/app/(main)/assessments/page.tsx`

Cards and navigation:

- `Diabetes risk` -> `/assessments/diabetes`
- `Heart disease` -> `/assessments/heart`
- `Organ module` -> `/assessments/kidney-or-liver`
- `Chest X-ray` -> `/assessments/xray`

Current situation:

- This is a navigation hub only.
- No direct submission or validation on this page.

### 7.4 Diabetes assessment: `/assessments/diabetes`

Source: `src/app/(main)/assessments/diabetes/page.tsx`

Input fields:

- Pregnancies
- Glucose
- BloodPressure
- SkinThickness
- Insulin
- BMI
- DiabetesPedigreeFunction
- Age

Buttons:

- `Reset values`
  - Restores default zeroed form
- `Run diabetes assessment`
  - Calls `assessmentService.predict(user.uid, { assessmentType: "diabetes", inputValues: form })`
  - ML API `POST /predict/diabetes`
  - Saved to `assessments`
  - Insights rebuilt
  - Redirect to `/result/{id}`

Secondary panel:

- Recent diabetes assessments list

Current situation:

- This is one of the most complete end-to-end flows in the app.

### 7.5 Heart assessment: `/assessments/heart`

Source: `src/app/(main)/assessments/heart/page.tsx`

Input fields:

- age
- sex
- chest pain type
- resting BP
- cholesterol
- fasting blood sugar > 120
- resting ECG
- max heart rate
- exercise angina
- oldpeak
- slope
- major vessels
- thal

Buttons:

- `Reset values`
- `Run heart assessment`
  - Calls `assessmentService.predict(... assessmentType: "heart" ...)`
  - ML API `POST /predict/heart`
  - Saves result and routes to `/result/{id}`

Secondary panel:

- Recent cardiovascular assessments list

Current situation:

- Complete frontend and save flow exists.

### 7.6 Organ module: `/assessments/kidney-or-liver`

Source: `src/app/(main)/assessments/kidney-or-liver/page.tsx`

Important reality:

- Despite the route name, this page is liver only.

Input fields:

- Age
- Gender
- Total bilirubin
- Direct bilirubin
- Alkaline phosphotase
- Alanine aminotransferase
- Aspartate aminotransferase
- Total proteins
- Albumin
- Albumin/globulin ratio

Buttons:

- `Reset values`
- `Run liver assessment`
  - Calls `assessmentService.predict(... assessmentType: "liver" ...)`
  - ML API `POST /predict/liver`
  - Saves result and routes to `/result/{id}`

Additional behavior:

- Shows explicit note that kidney inference is intentionally deferred

Current situation:

- Liver module exists.
- Kidney module does not exist.
- `/assessments/kidney` simply redirects here.

### 7.7 X-ray module: `/assessments/xray`

Source: `src/app/(main)/assessments/xray/page.tsx`

Workflow:

1. User selects image file.
2. App shows local preview.
3. On submit:
   - upload file through `recordsService.uploadFile(user.uid, file, "xray")`
   - store record in `uploads`
   - call `assessmentService.analyzeXray(user.uid, upload.downloadUrl, upload.id)`
   - ML API `POST /predict/xray`
   - save assessment
   - link assessment back to uploaded record
   - redirect to `/result/{id}`

Buttons:

- `Choose X-ray image`
- `Clear image`
- `Run X-ray flow`

Current situation:

- Upload and record linking are real.
- Result path is real.
- Actual prediction quality or availability depends on backend model artifact presence.
- The UI intentionally shows unavailable-state behavior instead of inventing a diagnosis.

### 7.8 Records locker: `/records`

Source: `src/app/(main)/records/page.tsx`

Upload workflow:

1. User selects category.
2. User selects file.
3. `Save record` calls `recordsService.uploadFile(...)`.
4. File is validated.
5. File uploads to Firebase Storage.
6. Metadata saved into `uploads`.
7. Record list refreshes.

Upload button:

- `Save record`

Per-record library controls:

- `Open` -> `/records/{id}`
- `Archive` / `Unarchive`
  - Calls `recordsService.archiveRecord(record.id, !record.archived)`
- `Delete`
  - Calls `recordsService.deleteRecord(record)`

List controls:

- Search input filters by filename/category
- Category filter dropdown
- Sort dropdown

Current situation:

- Upload, archive, delete, and detail navigation are implemented.
- This page depends fully on Firebase Storage and Firestore working.

### 7.9 Record detail: `/records/[id]`

Source: `src/app/(main)/records/[id]/page.tsx`

Workflow:

1. Load upload record by id.
2. If `linkedAssessmentId` exists, load linked assessment.
3. Show metadata, download URL, summary state, and manual text input box.

Buttons:

- `Open file`
  - Opens `downloadUrl`
- `Archive` / `Unarchive`
  - Toggles archived status in `uploads`
- `Delete`
  - Removes storage object and Firestore upload record
  - Redirects to `/records`
- `Open linked result`
  - Visible only if linked assessment exists
- `Generate summary`
  - Calls `aiService.summarizeRecord(...)`
  - Then saves summary and extracted text with `recordsService.saveSummary(...)`

Important limitation:

- There is no automatic OCR extraction here.
- User must paste extracted text manually into the textarea for summarization.

### 7.10 History: `/history`

Source: `src/app/(main)/history/page.tsx`

Workflow:

1. Load all assessments for the user.
2. User can filter by module.
3. User can sort by newest, oldest, or highest risk.
4. Each card links to detail.

Controls:

- Module filter dropdown
- Sort dropdown
- History card click -> `/history/{id}`

Current situation:

- Good read-only history view with chart support.

### 7.11 History detail: `/history/[id]`

Source: `src/app/(main)/history/[id]/page.tsx`

Workflow:

1. Load assessment by id.
2. If linked upload exists, load linked record.
3. Render shared `ResultDetailView`.

Buttons via shared result view:

- `Export PDF`
- `Generate explanation`
- `Open record`
- `Open file`

### 7.12 Result detail: `/result/[id]`

Source: `src/app/(main)/result/[id]/page.tsx` and `src/components/assessments/ResultDetailView.tsx`

Workflow:

1. Load assessment by id.
2. Load linked upload if present.
3. Render saved inputs, metrics, explanation panel, and linked record panel.

Buttons:

- `Export PDF`
  - Calls `pdfService.downloadAssessmentReport(result, userName)`
- `Generate explanation`
  - Calls `aiService.explainAssessment(...)`
- `Open record`
  - `/records/{linkedRecord.id}`
- `Open file`
  - direct download URL

Current situation:

- This is one of the strongest detailed screens in the app.

### 7.13 Insights: `/insights`

Source: `src/app/(main)/insights/page.tsx`

Workflow:

1. Load user assessment history.
2. Load existing `insights/{uid}` or rebuild it from profile + history.
3. Show overall health score, lifestyle score, completeness, recommendations, and trend chart.

Controls:

- Read-only page, no active form button

Current situation:

- Real summary page exists.
- Quality depends on profile completeness and saved assessment volume.

### 7.14 Settings: `/settings`

Source: `src/app/(main)/settings/page.tsx`

Buttons:

- `Send reset email`
  - Calls `resetPassword(emailForReset)`
- `Log out`
  - Calls `logout()`

Other content:

- Environment/integration notes
- Product note that preference persistence is future work

Current situation:

- Only real account actions are implemented here.
- Preferences and notifications are not implemented.

### 7.15 Legacy onboarding: `/onboarding`

Source: `src/app/onboarding/page.tsx`

Current situation:

- Still implemented as a full profile form.
- Saves profile and redirects to `/dashboard`.
- Not the primary path anymore because register now routes directly to dashboard.
- This creates a product inconsistency that should be resolved by either:
  - removing the route, or
  - restoring it as the real first-run flow

## 8. Admin Flow Audit

### 8.1 Admin dashboard: `/admin/dashboard`

Source: `src/app/(main)/admin/dashboard/page.tsx`

Buttons and links:

- Admin tabs navigation
- `View all` -> `/admin/users`
- `Analytics` -> `/admin/analytics`
- Recent user item -> `/admin/users/{uid}`

Data shown:

- total users
- total assessments
- total uploads
- storage estimate
- integration health
- module usage
- recent users
- recent assessments

Important note:

- `storageUsageMb` is estimated with `uploads.reduce((sum) => sum + 0.9, 0)`, not actual storage usage

### 8.2 Admin users: `/admin/users`

Source: `src/app/(main)/admin/users/page.tsx`

Behavior:

- Lists all user documents
- Clicking a user opens `/admin/users/{uid}`

### 8.3 Admin user detail: `/admin/users/[id]`

Source: `src/app/(main)/admin/users/[id]/page.tsx`

Behavior:

- Shows user metadata
- Shows recent assessments
- Shows uploads

Buttons/links:

- Only admin tab navigation

Current situation:

- Read-only operational view

### 8.4 Admin records: `/admin/records`

Source: `src/app/(main)/admin/records/page.tsx`

Behavior:

- Lists all uploaded records
- Clicking a record opens `/admin/records/{id}`

### 8.5 Admin record detail: `/admin/records/[id]`

Source: `src/app/(main)/admin/records/[id]/page.tsx`

Buttons and links:

- `Open stored file`
  - direct `downloadUrl`
- `Back to records` -> `/admin/records`

Shows:

- user id
- category
- file type
- storage path
- linked assessment summary if any

### 8.6 Admin analytics: `/admin/analytics`

Source: `src/app/(main)/admin/analytics/page.tsx`

Behavior:

- Shows bar chart of module usage
- Shows recent probability readings

Buttons:

- Only admin tab navigation

### 8.7 Admin models: `/admin/models`

Source: `src/app/(main)/admin/models/page.tsx`

Behavior:

- Shows model metadata cards
- Uses Firestore `modelMetadata` if present
- Otherwise falls back to `/models/status` from the ML API

### 8.8 Admin system health: `/admin/system-health`

Source: `src/app/(main)/admin/system-health/page.tsx`

Behavior:

- Shows Firebase, ML API, and Gemini availability state

## 9. Service Layer Reality Check

### Auth service

Source: `src/services/auth.service.ts`

What it does:

- login
- register
- reset password
- logout
- session restore
- fallback user resolution if Firestore user doc is unavailable

Current situation:

- Much safer than before
- Fast registration achieved by background Firestore bootstrap
- Still depends on Firebase project quality for full user metadata

### Assessment service

Source: `src/services/assessment.service.ts`

What it does:

- Sends prediction requests to FastAPI
- Saves all assessments into Firestore
- Computes lifestyle score and overall health score
- Rebuilds insights after save
- Links uploads back to assessments

Collections touched:

- `assessments`
- `insights`
- `uploads` when linked

### Records service

Source: `src/services/records.service.ts`

What it does:

- File validation
- Firebase Storage upload
- Firestore metadata save
- archive/unarchive
- save summary text
- delete storage + metadata

Collection touched:

- `uploads`

### Profile service

Source: `src/services/profile.service.ts`

What it does:

- Get/update `healthProfiles/{uid}`
- Compute profile completion

### Insights service

Source: `src/services/insights.service.ts`

What it does:

- Build insight summary from profile + assessments
- Save it to `insights/{uid}`

### Admin service

Source: `src/services/admin.service.ts`

What it does:

- Aggregates dashboard stats
- Reads users, uploads, assessments
- Reads model metadata
- Reads system health

Important limitations:

- Firebase “online” is inferred from SDK init, not true end-to-end read/write success
- storage usage is estimated, not measured
- admin screens have minimal error handling on some pages

## 10. Current Runtime Risks and Known Issues

### 10.1 Firestore offline errors

Observed issue:

- Browser/runtime has produced `Failed to get document because the client is offline`

Impact:

- Profile fetch/save can fail
- Dashboard load can fail
- Insights generation can fail
- Admin pages can fail
- Record listing can fail

Meaning:

- This is likely not only a frontend bug anymore
- Likely causes include:
  - Firestore database not created or misconfigured
  - wrong Firebase project config
  - rules blocking reads/writes
  - network/VPN/extension interference

### 10.2 Product flow inconsistency

Observed issue:

- Docs promise onboarding before dashboard
- Current app routes register -> dashboard
- Legacy `/onboarding` still exists
- Landing page copy still mentions onboarding

Impact:

- Confusing for developers, testers, and viva/demo reviewers

### 10.3 Kidney module not implemented

Observed issue:

- Route naming suggests kidney or liver
- Actual implementation is liver only

Impact:

- Product copy overstates feature scope

### 10.4 X-ray model dependency

Observed issue:

- X-ray flow is wired, but backend can return unavailable when model artifact/dataset is missing

Impact:

- End-to-end demo can fail or degrade depending on backend assets

### 10.5 OCR not implemented

Observed issue:

- Record detail page requires manual pasted text for AI summary

Impact:

- Report interpretation is semi-manual, not automated

### 10.6 Reminders not implemented

Observed issue:

- Synopsis and methodology mention reminders collection/future direction
- No real reminder UI or persistence exists in the current app

### 10.7 Admin stats are partially synthetic

Observed issue:

- Storage estimate is fake/approximate
- Some health signals are shallow

Impact:

- Admin dashboard is useful for demo, but not reliable for real operations

## 11. Comparison Against Synopsis / PRD

### Implemented or mostly implemented

- User registration and login
- Password reset
- Health profile management
- Diabetes prediction
- Heart prediction
- Liver prediction
- X-ray upload and result flow
- Record upload and storage
- Risk level, probability, contributing factors, recommendation
- Assessment history
- PDF export
- AI explanation and AI summary support
- Admin views

### Partially matching the document

- Onboarding exists, but live flow is dashboard-first instead of dedicated onboarding-first
- X-ray module exists, but real prediction depends on missing/available backend artifact
- Organ module exists, but only liver is implemented
- “Trend dashboard” exists, but depends heavily on saved data and Firebase reliability

### Not matching the document yet

- Kidney prediction
- Reminders
- OCR or automatic value extraction
- Doctor-facing review mode
- Fully stable live demonstration without Firebase connectivity issues

## 12. Priority Fix List for Developer

### P0: Must fix for reliable demo

- Resolve Firestore offline/runtime issue in the real browser environment
- Decide one onboarding strategy and remove the conflicting one
- Audit Firebase project setup, Firestore creation, and rules for all used collections
- Confirm X-ray backend artifact presence or hide/label the module as demo-only

### P1: Major product accuracy fixes

- Rename organ module copy so it does not imply kidney support
- Update landing/register/app copy to match dashboard-first intake
- Add better save/error states when Firestore is unreachable
- Improve admin page error handling and empty states

### P2: Feature-completeness improvements

- Implement kidney workflow or remove kidney references
- Add OCR or structured extraction for reports
- Implement reminders/preferences if they remain in scope
- Replace fake storage estimate with real storage accounting

## 13. Bottom-Line Assessment

Symptora is currently a substantial application with real structure and multiple working flows, not a shell project. The frontend is broad, the route map is complete, and several workflows are genuinely wired through Firebase and the ML API. The main blockers are infrastructure stability and scope honesty.

If this project is being reviewed by a developer, the most important takeaway is this: the app is close enough to be demo-worthy, but the team should stop describing every planned feature as already complete. The correct status is “strong multi-module prototype with real end-to-end flows, plus a few critical reliability and scope gaps.”
