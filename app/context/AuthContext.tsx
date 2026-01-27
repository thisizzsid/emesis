"use client";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithPhoneNumber,
  Auth,
} from "firebase/auth";
import { auth } from "../../firebase";
import { db } from "../../firebase";
import { doc, setDoc, getDoc, Timestamp, Firestore } from "firebase/firestore";
import { RecaptchaVerifier } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<any>(null);
let recaptcha: RecaptchaVerifier | null = null;

export const AuthContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /** Ensure Firestore profile exists **/
  const ensureUserProfile = async (u: any) => {
    if (!u?.uid || !db) return;
    const ref = doc(db as Firestore, "users", u.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(
        ref,
        {
          uid: u.uid,
          email: u.email || "",
          username: u.displayName || "",
          bio: "",
          age: "",
          gender: "",
          location: "",
          joined: Timestamp.now(),
        },
        { merge: true }
      );
    } else {
      await setDoc(
        ref,
        {
          email: u.email || "",
          username: u.displayName || "",
        },
        { merge: true }
      );
    }
  };

  /** Google Auth **/
  const googleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    await ensureUserProfile(res.user);
  };

  /** Email Signup **/
  const signupWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(res.user);
  };

  /** Email Login **/
  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    const res = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(res.user);
  };

  /** Password Reset **/
  const resetPassword = async (email: string) => {
    if (!auth) return;
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent!");
  };

  /** Phone Login Setup **/
  const setupRecaptcha = () => {
    if (typeof window === "undefined" || !auth) return null;
    if (!recaptcha) {
      recaptcha = new RecaptchaVerifier(auth as Auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptcha;
  };

  /** Send OTP **/
  const sendOTP = async (phone: string) => {
    if (!auth) return;
    const verifier = setupRecaptcha();
    if (!verifier) return;
    return signInWithPhoneNumber(auth, phone, verifier);
  };

  /** Verify OTP **/
  const verifyOTP = async (confirmation: any, code: string) => {
    const result = await confirmation.confirm(code);
    await ensureUserProfile(result.user);
    return result.user;
  };

  /** Logout **/
  const logout = async () => {
    if (!auth) return;
    return signOut(auth);
  };

  /** Track user **/
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (current) => {
      if (!current) {
        setUser(null);
        setLoading(false);
        return;
      }

      await ensureUserProfile(current);
      if (!db) return;
      const ref = doc(db as Firestore, "users", current.uid);
      const snap = await getDoc(ref);
      const profile = snap.data() || {};

      setUser({ ...current, profile });
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /** Real-time Presence System **/
  useEffect(() => {
    if (!user?.uid || !db) return;

    const updatePresence = async () => {
      if (document.visibilityState === "visible") {
        try {
          const ref = doc(db as Firestore, "users", user.uid);
          await setDoc(ref, {
            lastSeen: Timestamp.now(),
            isOnline: true
          }, { merge: true });
        } catch (err) {
          // silent fail
        }
      }
    };

    // Initial update
    updatePresence();

    // Heartbeat every 60s
    const interval = setInterval(updatePresence, 60000);

    // Update on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === "visible") updatePresence();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user?.uid]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleLogin,
        signupWithEmail,
        loginWithEmail,
        resetPassword,
        logout,
        sendOTP,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
