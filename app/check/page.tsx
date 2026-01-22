"use client";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CheckFirestore() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setData(snap.data());
      else setData("NO DOCUMENT FOUND");
    };
    load();
  }, [user]);

  if (!user) return <div>Login first</div>;
  if (!data) return <div>Loading Firestore...</div>;

  return (
    <pre className="whitespace-pre-wrap p-5">{JSON.stringify(data, null, 2)}</pre>
  );
}
