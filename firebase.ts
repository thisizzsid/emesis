import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: Partial<FirebaseOptions> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAnv7glqAMxl_r1K23CZcp2V-hZHV1Gvb4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "emesispro.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "emesispro",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "emesispro.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "352946034946",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:352946034946:web:c5e882c40813844db14a1b",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

const hasConfig = true;

let app: FirebaseApp | null = null;

const initApp = () => {
  if (app) return app;
  if (typeof window === "undefined") {
    // Return null on server to avoid initialization
    return null;
  }
  
  // Warn instead of throw if config is missing
  if (!hasConfig) {
    console.warn("Firebase environment variables missing. Features relying on Firebase will not work.");
    // Return null or a dummy app if possible, but initializeApp requires config.
    // We'll return null and handle it in exports.
    return null;
  }

  try {
    app = initializeApp(firebaseConfig as FirebaseOptions);
    return app;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
};

const getAuthSafe = () => {
  const app = initApp();
  if (app) return getAuth(app);
  return null;
};

const getFirestoreSafe = () => {
  const app = initApp();
  if (app) {
    try {
        const db = getFirestore(app);
        return db;
    } catch (e) {
        console.error("Firestore init error", e);
        return null;
    }
  }
  return null;
};

export const auth = typeof window !== "undefined" ? getAuthSafe() : null;
export const googleProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : null;
export const db = typeof window !== "undefined" ? getFirestoreSafe() : null;
