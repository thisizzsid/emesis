"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export default function InboxPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (!user) return;

    const q = query(
      collection(db, `anonymous/${user.uid}/inbox`),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    const arr: any[] = [];
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
    setItems(arr);
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!user) {
    return <div className="p-6 text-yellow-300">Login required.</div>;
  }

  if (!loaded) {
    return (
      <div className="p-6 text-yellow-300">
        Loading inbox...
      </div>
    );
  }

  return (
    <div className="p-6 text-yellow-300 space-y-6">
      <h1 className="text-3xl font-bold text-yellow-400">Anonymous Inbox</h1>

      {items.length === 0 && (
        <p className="opacity-50">No anonymous messages yet.</p>
      )}

      {items.map((m) => (
        <div key={m.id} className="bg-zinc-900 p-4 rounded space-y-2">
          <p>{m.text}</p>
          <p className="text-xs opacity-50">
            {m.createdAt?.toDate().toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
