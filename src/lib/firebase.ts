import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || "").trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "").trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || "").trim(),
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
