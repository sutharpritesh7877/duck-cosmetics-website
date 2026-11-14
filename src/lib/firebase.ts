import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from "firebase/storage";

const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any).env || {} : {};

export const firebaseConfig = {
  apiKey: (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    metaEnv.VITE_FIREBASE_API_KEY ||
    "AIzaSyBv6mfcawOiiAkIZFEW6fjaP-w9ZDHpWsU"
  ).trim(),
  authDomain: (
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.VITE_FIREBASE_AUTH_DOMAIN ||
    metaEnv.VITE_FIREBASE_AUTH_DOMAIN ||
    "duck-cosmetics-a4f4b.firebaseapp.com"
  ).trim(),
  projectId: (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    metaEnv.VITE_FIREBASE_PROJECT_ID ||
    "duck-cosmetics-a4f4b"
  ).trim(),
  storageBucket: (
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.VITE_FIREBASE_STORAGE_BUCKET ||
    metaEnv.VITE_FIREBASE_STORAGE_BUCKET ||
    "duck-cosmetics-a4f4b.firebasestorage.app"
  ).trim(),
  messagingSenderId: (
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "440189309657"
  ).trim(),
  appId: (
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    process.env.VITE_FIREBASE_APP_ID ||
    metaEnv.VITE_FIREBASE_APP_ID ||
    "1:440189309657:web:6cbb4a7814c0af5b0224c8"
  ).trim(),
  measurementId: (
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    process.env.VITE_FIREBASE_MEASUREMENT_ID ||
    metaEnv.VITE_FIREBASE_MEASUREMENT_ID ||
    "G-ZX4SQ65QNH"
  ).trim(),
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes("your-") &&
    !firebaseConfig.projectId.includes("your-")
  );
}

export function getFirebaseConfigStatus() {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("your-")) missing.push("VITE_FIREBASE_API_KEY");
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes("your-")) missing.push("VITE_FIREBASE_AUTH_DOMAIN");
  if (!firebaseConfig.projectId || firebaseConfig.projectId.includes("your-")) missing.push("VITE_FIREBASE_PROJECT_ID");
  if (!firebaseConfig.appId || firebaseConfig.appId.includes("your-")) missing.push("VITE_FIREBASE_APP_ID");
  if (!firebaseConfig.storageBucket) missing.push("VITE_FIREBASE_STORAGE_BUCKET");

  return {
    configured: isFirebaseConfigured(),
    projectId: firebaseConfig.projectId || "Not configured",
    authDomain: firebaseConfig.authDomain || "Not configured",
    storageBucket: firebaseConfig.storageBucket || "Not configured",
    missingFields: missing,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestoreDb: Firestore | null = null;
let storage: FirebaseStorage | null = null;
export const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestoreDb = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error("[Firebase] Initialization error:", err);
  }
}

/**
 * Uploads a file (Buffer, Uint8Array, or Blob) directly to Firebase Storage bucket
 * and returns the permanent HTTPS download URL.
 */
export async function uploadToFirebaseStorage(
  data: Uint8Array | ArrayBuffer | Blob,
  fileName: string,
  contentType = "image/jpeg",
  folder = "uploads"
): Promise<string> {
  if (!storage) {
    if (!app && isFirebaseConfigured()) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    if (app) {
      storage = getStorage(app);
    }
  }

  if (!storage) {
    throw new Error("Firebase storage is not configured or initialized");
  }

  const cleanName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const fileRef = ref(storage, `${folder}/${cleanName}`);

  const metadata = {
    contentType,
  };

  const uploadBytesData = data instanceof Uint8Array ? data : new Uint8Array(data as any);
  const uploadResult = await uploadBytes(fileRef, uploadBytesData, metadata);
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  return downloadUrl;
}

export { app, auth, firestoreDb, storage };
