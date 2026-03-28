import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  Firestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { DEFAULT_FIREBASE_PUBLIC_CONFIG } from "@/lib/public-runtime";

// ─── Config Validation ──────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_PUBLIC_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_PUBLIC_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PUBLIC_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_PUBLIC_CONFIG.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_PUBLIC_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_PUBLIC_CONFIG.appId,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_PUBLIC_CONFIG.measurementId,
};

const REQUIRED_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

export const isFirebaseConfigured: boolean = REQUIRED_KEYS.every(
  (key) => !!firebaseConfig[key]
);

// ─── Singleton Initialisation ────────────────────────────────────────────────
function initApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

function initDb(app: FirebaseApp | null): Firestore | null {
  if (!app) return null;
  try {
    // Prefer the already-created instance to avoid "already exists" errors.
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}

export const firebaseApp: FirebaseApp | null = initApp();
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = initDb(firebaseApp);
export const storage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;

// ─── Emulator Support (development only) ────────────────────────────────────
if (
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"
) {
  if (auth) connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  if (db) connectFirestoreEmulator(db, "localhost", 8080);
  if (storage) connectStorageEmulator(storage, "localhost", 9199);
}
