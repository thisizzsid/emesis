// /app/utils/recaptcha.ts
import { RecaptchaVerifier, Auth } from "firebase/auth";
import { auth } from "../../firebase";

let recaptcha: RecaptchaVerifier | null = null;

export const setupRecaptcha = () => {
  if (typeof window === "undefined" || !auth) return null;

  if (!recaptcha) {
    recaptcha = new RecaptchaVerifier(auth as Auth, "recaptcha-container", {
      size: "invisible",
    });
  }
  return recaptcha;
};
