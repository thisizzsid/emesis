// /app/utils/recaptcha.ts
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "../../firebase";

let recaptcha: RecaptchaVerifier | null = null;

export const setupRecaptcha = () => {
  if (!recaptcha) {
    recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }
  return recaptcha;
};
