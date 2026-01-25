import { db } from "../../firebase";
import { doc, updateDoc, Firestore } from "firebase/firestore";

export const updateUserProfile = async (uid: string, data: any) => {
  if (!db) return;
  const ref = doc(db as Firestore, "users", uid);
  await updateDoc(ref, data);
};
