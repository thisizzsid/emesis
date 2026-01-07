import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCI2kwY-VdtU7cfSCCYyK8twNTAbH-14Ro",
  authDomain: "e2emesis.firebaseapp.com",
  databaseURL: "https://e2emesis-default-rtdb.firebaseio.com",
  projectId: "e2emesis",
  storageBucket: "e2emesis.firebasestorage.app",
  messagingSenderId: "1049443317810",
  appId: "1:1049443317810:web:41d40e39700344dd8fe42b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

