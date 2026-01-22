"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/notifications`),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const markRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/notifications/${id}`), {
      read: true,
    });
    load();
  };

  const followBack = async (fromUid: string) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/following/${fromUid}`), { ts: Date.now() });
    await setDoc(doc(db, `users/${fromUid}/followers/${user.uid}`), { ts: Date.now() });
    load();
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!user) return <div className="p-6">Login Required</div>;

  return (
    <div className="p-6 space-y-6 text-yellow-300">
      <h1 className="text-3xl font-bold">Notifications</h1>

      {items.length === 0 && <p>No notifications</p>}

      {items.map((n) => {
        let label = "";
        let icon = "";
        if (n.type === "like") icon = "❤️";
        if (n.type === "comment") icon = "💬";
        if (n.type === "reply") icon = "🔁";
        if (n.type === "follow") icon = "➕";

        if (n.type === "like") label = "liked your post";
        if (n.type === "comment") label = "commented on your post";
        if (n.type === "reply") label = "replied to your comment";
        if (n.type === "follow") label = "followed you";

        return (
          <div
            key={n.id}
            className={`p-4 rounded bg-zinc-900 space-y-2 ${
              n.read ? "opacity-50" : "opacity-100"
            }`}
          >
            <p>
              {icon} <b>{n.fromName}</b> {label}
            </p>
            <p className="text-xs opacity-70">
              {n.createdAt?.toDate().toLocaleString()}
            </p>

            {/* Follow Back Button */}
            {n.type === "follow" && (
              <button
                onClick={() => followBack(n.fromUid)}
                className="bg-yellow-400 text-black px-3 py-1 rounded"
              >
                Follow Back
              </button>
            )}

            {!n.read && (
              <button
                onClick={() => markRead(n.id)}
                className="bg-yellow-500 text-black px-2 py-1 rounded text-xs"
              >
                Mark Read
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
