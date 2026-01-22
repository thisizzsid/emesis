import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: Partial<FirebaseOptions> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasConfig =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;

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
  return {} as ReturnType<typeof getAuth>;
};

const getFirestoreSafe = () => {
  const app = initApp();
  if (app) {
    try {
        const db = getFirestore(app);
        // Add a check or log if needed, but getFirestore usually returns a valid instance if app is valid
        return db;
    } catch (e) {
        console.error("Firestore init error", e);
        return {} as ReturnType<typeof getFirestore>;
    }
  }
  return {} as ReturnType<typeof getFirestore>;
};

export const auth = typeof window !== "undefined" ? getAuthSafe() : ({} as unknown as ReturnType<typeof getAuth>);
export const googleProvider = typeof window !== "undefined" ? new GoogleAuthProvider() : ({} as unknown as GoogleAuthProvider);
export const db = typeof window !== "undefined" ? getFirestoreSafe() : ({} as unknown as ReturnType<typeof getFirestore>);
