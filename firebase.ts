import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAnv7glqAMxl_r1K23CZcp2V-hZHV1Gvb4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "emesispro.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "emesispro",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "emesispro.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "352946034946",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:352946034946:web:c5e882c40813844db14a1b",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// --- App ---
export const getFirebaseApp = (): FirebaseApp => {
  if (typeof window === "undefined") {
    throw new Error("Firebase cannot be initialized on the server");
  }

  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }

  return getApps()[0];
};

// --- Auth ---
export const getFirebaseAuth = (): Auth => {
  const app = getFirebaseApp();
  return getAuth(app);
};

// --- Firestore ---
export const getFirebaseDB = (): Firestore => {
  const app = getFirebaseApp();
  return getFirestore(app);
};

// --- Providers ---
export const googleProvider = new GoogleAuthProvider();

// --- Legacy Exports for Backward Compatibility ---
// These allow existing imports of { auth, db } to continue working without refactoring the entire codebase
export const app = typeof window !== "undefined" ? getFirebaseApp() : null;
export const auth = typeof window !== "undefined" ? getFirebaseAuth() : null;
export const db = typeof window !== "undefined" ? getFirebaseDB() : null;
