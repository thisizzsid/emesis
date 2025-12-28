import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

export const updateUserProfile = async (uid: string, data: any) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, data);
};
