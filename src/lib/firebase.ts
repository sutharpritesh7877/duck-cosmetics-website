import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any).env || {} : {};

export const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || metaEnv.VITE_FIREBASE_API_KEY || "").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || metaEnv.VITE_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || metaEnv.VITE_FIREBASE_APP_ID || "").trim(),
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

  return {
    configured: isFirebaseConfigured(),
    projectId: firebaseConfig.projectId || "Not configured",
    authDomain: firebaseConfig.authDomain || "Not configured",
    missingFields: missing,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestoreDb: Firestore | null = null;
export const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestoreDb = getFirestore(app);
  } catch (err) {
    console.error("[Firebase] Initialization error:", err);
  }
}

export { app, auth, firestoreDb };
