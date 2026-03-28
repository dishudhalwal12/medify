import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/services/firebase/client";
import { normalizeFirebaseError } from "@/services/firebase/errors";

function assertAuth() {
  if (!auth) {
    throw new Error("Firebase Auth is not configured. Add the required NEXT_PUBLIC_FIREBASE_* env vars.");
  }

  return auth;
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(assertAuth(), email, password);
    return credential.user;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function registerWithEmail(email: string, password: string, fullName: string) {
  try {
    const credential = await createUserWithEmailAndPassword(assertAuth(), email, password);

    if (credential.user) {
      await updateProfile(credential.user, {
        displayName: fullName,
      });
    }

    return credential.user;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function logoutCurrentUser() {
  await signOut(assertAuth());
}

export async function sendResetEmail(email: string) {
  try {
    await sendPasswordResetEmail(assertAuth(), email);
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export function observeAuthSession(callback: (user: User | null) => void) {
  return onAuthStateChanged(assertAuth(), callback);
}
