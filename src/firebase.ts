/**
 * Firebase Client & Local Storage Fallback Engine
 * Optimalisasi Reproduksi Ternak Berau
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, collection, getDocs } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Check if firebase is real or placeholder
export const isFirebaseActive =
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "mock-api-key-for-preview";

let app: any = null;
let db: any = null;
let auth: any = null;

if (isFirebaseActive) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn("Gagal inisialisasi Firebase Cloud, menggunakan Mode Offline Lokal:", error);
  }
} else {
  console.info("Firebase Cloud belum dikonfigurasi. Menggunakan Mode Offline Lokal (Penyimpanan Aman).");
}

export { db, auth };

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || "mock-offline-user",
      email: auth?.currentUser?.email || "mock@berau.go.id",
      emailVerified: auth?.currentUser?.emailVerified || true,
      isAnonymous: auth?.currentUser?.isAnonymous || false,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------- Fallback Local DB Engine -----------------
// To guarantee instant operation, we persist data to localStorage first in all cases,
// ensuring immediate updates even during offline testing or when the database rule is pending.
const LOCAL_STORAGE_PREFIX = "ternak_berau_";

export const localDB = {
  get<T>(key: string, defaultValue: T[]): T[] {
    const data = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (!data) return defaultValue;
    try {
      return JSON.parse(data) as T[];
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, data: T[]): void {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(data));
  },

  insertOne<T extends { id: string }>(key: string, item: T): T[] {
    const current = localDB.get<T>(key, []);
    const updated = [item, ...current];
    localDB.set(key, updated);
    return updated;
  },

  updateOne<T extends { id: string }>(key: string, id: string, updater: Partial<T>): T[] {
    const current = localDB.get<T>(key, []);
    const updated = current.map((item) =>
      item.id === id ? { ...item, ...updater } : item
    );
    localDB.set(key, updated);
    return updated;
  }
};
