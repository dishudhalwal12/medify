import {
  CollectionReference,
  QueryConstraint,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

import { db } from "@/services/firebase/client";
import { toIsoString } from "@/lib/firestore";
import { normalizeFirebaseError } from "@/services/firebase/errors";

function assertDb() {
  if (!db) {
    throw new Error("Firebase Firestore is not configured. Add the required NEXT_PUBLIC_FIREBASE_* env vars.");
  }

  return db;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sanitizeFirestoreValue(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeFirestoreValue(entry))
      .filter((entry) => entry !== undefined);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    const nextValue = sanitizeFirestoreValue(entry);

    if (nextValue !== undefined) {
      sanitized[key] = nextValue;
    }
  }

  return sanitized;
}

function withTimeout<T>(operation: Promise<T>, label: string, timeoutMs = 3000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out. Firebase is taking too long to respond.`));
    }, timeoutMs);

    operation
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function getCollection<T = Record<string, unknown>>(name: string): CollectionReference<T> {
  if (!name) {
    throw new Error("Collection name is required for Firestore access.");
  }

  return collection(assertDb(), name) as CollectionReference<T>;
}

export async function getDocument<T>(path: string, id: string): Promise<T | null> {
  if (!path || !id) {
    throw new Error("A valid Firestore path and document id are required.");
  }

  try {
    const snapshot = await withTimeout(getDoc(doc(assertDb(), path, id)), `Reading ${path}/${id}`);

    if (!snapshot.exists()) {
      return null;
    }

    const data = normalizeData(snapshot.data()) as Record<string, unknown>;

    return {
      id: snapshot.id,
      ...data,
    } as T;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function upsertDocument(path: string, id: string, payload: Record<string, unknown>) {
  if (!path || !id) {
    throw new Error("A valid Firestore path and document id are required.");
  }

  try {
    const sanitizedPayload = sanitizeFirestoreValue({
      ...payload,
      updatedAt: serverTimestamp(),
    });

    await setDoc(
      doc(assertDb(), path, id),
      sanitizedPayload as Record<string, unknown>,
      { merge: true }
    );
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function updateDocument(path: string, id: string, payload: Record<string, unknown>) {
  if (!path || !id) {
    throw new Error("A valid Firestore path and document id are required.");
  }

  try {
    const sanitizedPayload = sanitizeFirestoreValue({
      ...payload,
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(assertDb(), path, id), sanitizedPayload as Record<string, unknown>);
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function addDocument(path: string, payload: Record<string, unknown>) {
  try {
    const sanitizedPayload = sanitizeFirestoreValue({
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const ref = await addDoc(getCollection(path), sanitizedPayload as Record<string, unknown>);

    return ref.id;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function removeDocument(path: string, id: string) {
  if (!path || !id) {
    throw new Error("A valid Firestore path and document id are required.");
  }

  try {
    await deleteDoc(doc(assertDb(), path, id));
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function listDocuments<T>(
  path: string,
  constraints: QueryConstraint[] = [],
  max = 20
): Promise<T[]> {
  try {
    const snapshot = await withTimeout(
      getDocs(query(getCollection(path), ...constraints, limit(max))),
      `Listing documents in ${path}`
    );

    return (snapshot.docs.map((item) => ({
      id: item.id,
      ...(normalizeData(item.data()) as Record<string, unknown>),
    })) as T[]).sort(
      (left, right) =>
        Date.parse(String((right as Record<string, unknown>).createdAt || 0)) -
        Date.parse(String((left as Record<string, unknown>).createdAt || 0))
    );
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function listUserDocuments<T>(path: string, uid: string, max = 50): Promise<T[]> {
  return listDocuments<T>(path, [where("uid", "==", uid)], max);
}

export function normalizeData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeData(entry));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(record)) {
    if (key.endsWith("At")) {
      normalized[key] = toIsoString(entry);
      continue;
    }

    normalized[key] = normalizeData(entry);
  }

  return normalized;
}
