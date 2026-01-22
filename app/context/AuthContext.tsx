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
} from "firebase/auth";
import { auth } from "../../firebase";
import { db } from "../../firebase";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { RecaptchaVerifier } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<any>(null);
let recaptcha: RecaptchaVerifier | null = null;

export const AuthContextProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /** Ensure Firestore profile exists **/
  const ensureUserProfile = async (u: any) => {
    if (!u?.uid) return;
    const ref = doc(db, "users", u.uid);
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
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    await ensureUserProfile(res.user);
  };

  /** Email Signup **/
  const signupWithEmail = async (email: string, password: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(res.user);
  };

  /** Email Login **/
  const loginWithEmail = async (email: string, password: string) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(res.user);
  };

  /** Password Reset **/
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent!");
  };

  /** Phone Login Setup **/
  const setupRecaptcha = () => {
    if (!recaptcha) {
      recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptcha;
  };

  /** Send OTP **/
  const sendOTP = async (phone: string) => {
    const verifier = setupRecaptcha();
    return signInWithPhoneNumber(auth, phone, verifier);
  };

  /** Verify OTP **/
  const verifyOTP = async (confirmation: any, code: string) => {
    const result = await confirmation.confirm(code);
    await ensureUserProfile(result.user);
    return result.user;
  };

  /** Logout **/
  const logout = async () => signOut(auth);

  /** Track user **/
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (current) => {
      if (!current) {
        setUser(null);
        setLoading(false);
        return;
      }

      await ensureUserProfile(current);
      const ref = doc(db, "users", current.uid);
      const snap = await getDoc(ref);
      const profile = snap.data() || {};

      setUser({ ...current, profile });
      setLoading(false);
    });

    return () => unsub();
  }, []);

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
