# Medify

Medify is a production-style academic healthcare web app built with Next.js, Firebase, Python, and local machine learning models for:

- diabetes
- heart disease
- kidney disease
- liver disease

Chest X-ray upload is wired, but live X-ray inference is still unavailable until a real X-ray dataset and trained image model are added.

This README is written for the exact situation where you open AnyDesk on a client laptop, clone the project, and need to get it running from scratch even if the laptop has no Git, Node.js, npm, or Python installed yet.

**What Runs Locally**
- The web app runs with `npm run dev`
- The ML assessments run through internal Next.js API routes
- Python is still required because the app calls the local ML runtime for diabetes, heart, kidney, and liver inference
- Report uploads do not rely on Firebase Storage for local demo use; uploads are handled locally by the app and metadata is still saved in Firestore
- The repo already includes the app API routes and the Python ML code
- Core local use does not require creating `.env.local`
- If no Gemini key is provided, record summaries fall back to a built-in local summarizer

**Vercel Deploy Flow**
- Push changes to GitHub, then import the repo into Vercel
- Vercel will use `vercel.json` with `npm ci` and `npm run build`
- The Next.js app deploys on Vercel without needing local Python during the build
- For live diabetes, heart, kidney, and liver ML inference on Vercel, deploy `ml-api` as a separate Python service and add its base URL in Vercel as `ML_API_URL`
- Without `ML_API_URL`, symptom-only assessments, records, auth, and general app pages still run, while structured ML routes return a clear configuration message

**Recommended Client Laptop Flow**
- Use Windows PowerShell unless you know the laptop is macOS/Linux
- Install in this order:
  1. Git
  2. Node.js
  3. Python
  4. VS Code
- Then clone the repo, install packages, train models, and run the app

**1. Quick Pre-Check On Client Laptop**
Open PowerShell and run these one by one:

```powershell
git --version
node -v
npm -v
py --version
python --version
code --version
```

Use this interpretation:
- If `git --version` works: Git is installed
- If `node -v` and `npm -v` work: Node.js and npm are installed
- If `py --version` or `python --version` works: Python is installed
- If `code --version` works: VS Code is installed

If a command says "not recognized", install that tool using the relevant section below.

**2. Install Missing Tools**

**Git**
- If `git --version` already works, skip this section
- Installer: [Git for Windows](https://git-scm.com/download/win)
- Download and install with default settings
- After install, close PowerShell and open it again
- Recheck:

```powershell
git --version
```

**Node.js and npm**
- If both `node -v` and `npm -v` work, skip this section
- Installer: [Node.js LTS](https://nodejs.org/en/download)
- Install the LTS version, not Current
- After install, close PowerShell and open it again
- Recheck:

```powershell
node -v
npm -v
```

**Python**
- If `py --version` works, skip this section
- Installer: [Python for Windows](https://www.python.org/downloads/windows/)
- Install Python 3.10 or newer
- Very important during install: check `Add Python to PATH`
- After install, close PowerShell and open it again
- Recheck:

```powershell
py --version
python --version
```

**VS Code**
- If `code --version` works, skip this section
- Installer: [Visual Studio Code](https://code.visualstudio.com/download)
- Install with default settings

**3. Get The Project On The Client Laptop**

You have 2 options.

**Option A: Git is available**
Use this if `git --version` works:

```powershell
cd $HOME\Desktop
git clone https://github.com/dishudhalwal12/medify.git
cd medify
```

**Option B: Git is not available**
Use this if you do not want to install Git.

1. Open the GitHub repo in the browser
2. Click `Code`
3. Click `Download ZIP`
4. Extract the ZIP
5. Rename the extracted folder to `medify` if needed
6. Open PowerShell in that extracted folder

**4. Open The Project In VS Code**

If VS Code is installed:

```powershell
code .
```

If that command does not work:
- Open VS Code manually
- Click `File`
- Click `Open Folder`
- Select the `medify` folder

**5. Environment Setup Is Already Handled**

For the normal localhost setup, you do **not** need to create `.env.local`.

The repo already contains:
- public Firebase web configuration for the existing project
- internal API routes for assessments
- local upload handling
- local defaults for the main app flow

Only create `.env.local` if you want to override the built-in defaults or add your own private Gemini key.

If you want that optional file, run:

```powershell
Copy-Item .env.example .env.local
```

Useful optional overrides:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
SYMPTORA_PYTHON_BIN=python
```

Important note:
- The app now uses internal ML routes by default, so local assessment flows can still work even if you are not manually running a separate FastAPI server
- For local report uploads, the app uses its own local upload route and does not require paid Firebase Storage
- The core app flow works without extra env setup
- Gemini-powered explanations require a valid `GEMINI_API_KEY` only if you want that feature active on the cloned machine

**6. Install Frontend Dependencies**

From the project root:

```powershell
npm install
```

If this fails:
- Recheck `node -v`
- Recheck `npm -v`
- Make sure Node.js LTS was installed correctly

**7. Install Python Dependencies**

From the project root:

```powershell
py -m pip install -r ml-api/requirements.txt
```

If `py` does not work but `python` does:

```powershell
python -m pip install -r ml-api/requirements.txt
```

If `pip` is outdated, you can upgrade it first:

```powershell
py -m pip install --upgrade pip
```

**8. Train The ML Models**

This is required for the diabetes, heart, kidney, and liver assessments to work correctly on that laptop.

From the project root:

```powershell
py ml-api/scripts/train_all.py
```

If `py` does not work:

```powershell
python ml-api/scripts/train_all.py
```

Expected output should include lines like:

```text
[OK] Trained diabetes with best model ...
[OK] Trained heart with best model ...
[OK] Trained kidney with best model ...
[OK] Trained liver with best model ...
```

**9. Run The App**

From the project root:

```powershell
npm run dev
```

Then open:

```text
http://localhost:3000
```

**10. Most Common “If Present / If Missing” Commands**

**If Git is present**

```powershell
git --version
git clone https://github.com/dishudhalwal12/medify.git
cd medify
```

**If Git is missing**
- Install Git from [Git for Windows](https://git-scm.com/download/win)
- Or use `Download ZIP` from GitHub

**If Node.js is present**

```powershell
node -v
npm -v
npm install
npm run dev
```

**If Node.js is missing**
- Install from [Node.js LTS](https://nodejs.org/en/download)

**If Python is present**

```powershell
py --version
py -m pip install -r ml-api/requirements.txt
py ml-api/scripts/train_all.py
```

**If Python is missing**
- Install from [Python for Windows](https://www.python.org/downloads/windows/)
- Make sure `Add Python to PATH` is checked during install

**11. Exact Clean Setup Sequence**

If you want one reliable order to follow on a fresh client laptop, use this:

```powershell
git --version
node -v
npm -v
py --version
```

If anything is missing, install it first.

Then:

```powershell
cd $HOME\Desktop
git clone https://github.com/dishudhalwal12/medify.git
cd medify
npm install
py -m pip install -r ml-api/requirements.txt
py ml-api/scripts/train_all.py
npm run dev
```

Then open:

```text
http://localhost:3000
```

**12. What To Do If Something Fails**

**Error: `git is not recognized`**
- Install Git
- Or use GitHub `Download ZIP`

**Error: `node is not recognized`**
- Install Node.js LTS

**Error: `npm is not recognized`**
- Install Node.js LTS

**Error: `py is not recognized`**
- Install Python
- Check `Add Python to PATH`

**Error: `ModuleNotFoundError` while training**
- Python packages were not installed
- Run:

```powershell
py -m pip install -r ml-api/requirements.txt
```

**Error: assessment pages say engine unavailable**
- Usually means Python dependencies were not installed
- Or models were not trained
- Run both:

```powershell
py -m pip install -r ml-api/requirements.txt
py ml-api/scripts/train_all.py
```

**Error: report upload fails**
- Restart `npm run dev`
- Refresh the browser fully
- Local uploads are handled by the app itself, so Firebase paid Storage is not required for local demo use

**Error: Firebase auth/profile/history does not load**
- Restart `npm run dev`
- If you created a custom `.env.local`, check those values
- Make sure Firestore is enabled in the Firebase project

**13. What Is Real Right Now**

Working locally:
- diabetes assessment
- heart assessment
- kidney assessment
- liver assessment
- records upload through local app upload route
- Firestore metadata saving
- auth, profile, history, dashboard

Not fully live yet:
- chest X-ray inference model

Why X-ray is still unavailable:
- missing `ml-api/data/xray/`
- missing `ml-api/models/xray_model.keras` or `ml-api/models/xray_model.h5`

**14. Optional Final Check Before Demo**

Open the app and verify:
- login page opens
- register page opens
- records page opens
- upload a report from `/records`
- run diabetes assessment
- run heart assessment
- run kidney assessment
- run liver assessment
- open history page

**15. Files You May Need To Mention In Viva**

- [diabetes.csv](/Users/divyanshusaini/Downloads/Symptora/ml-api/data/diabetes.csv)
- [heart.csv](/Users/divyanshusaini/Downloads/Symptora/ml-api/data/heart.csv)
- [kidney.csv](/Users/divyanshusaini/Downloads/Symptora/ml-api/data/kidney.csv)
- [liver.csv](/Users/divyanshusaini/Downloads/Symptora/ml-api/data/liver.csv)
- [train_all.py](/Users/divyanshusaini/Downloads/Symptora/ml-api/scripts/train_all.py)
- [predict_cli.py](/Users/divyanshusaini/Downloads/Symptora/ml-api/scripts/predict_cli.py)
- [assessment.service.ts](/Users/divyanshusaini/Downloads/Symptora/src/services/assessment.service.ts)
- [records.service.ts](/Users/divyanshusaini/Downloads/Symptora/src/services/records.service.ts)

**16. One-Line Summary**

For a fresh client laptop:

1. Install Git, Node.js LTS, Python, and VS Code if missing
2. Clone or download the repo
3. Run `npm install`
4. Run `py -m pip install -r ml-api/requirements.txt`
5. Run `py ml-api/scripts/train_all.py`
6. Run `npm run dev`
7. Open `http://localhost:3000`
