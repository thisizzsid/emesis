"use client";

import { useState, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

function AnonymousPageContent() {
  const { user } = useAuth();
  const params = useSearchParams();
  const router = useRouter();

  const targetUid = params.get("uid") || null;
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center text-yellow-300">
        Login required.
      </div>
    );

  if (!targetUid)
    return (
      <div className="flex h-screen items-center justify-center text-yellow-300">
        No target user specified.
      </div>
    );

  const sendAnon = async () => {
    if (!msg.trim()) return;

    await addDoc(collection(db, `anonymous/${targetUid}/inbox`), {
      text: msg,
      createdAt: Timestamp.now(),
      hidden: true,
    });

    setMsg("");
    setSent(true);
    setTimeout(() => router.push("/inbox"), 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-yellow-300 p-6 space-y-6">
      <h1 className="text-2xl font-bold">Send Anonymous Message</h1>

      <textarea
        className="bg-zinc-900 p-3 rounded w-full h-48"
        maxLength={1000}
        placeholder="Write your anonymous confession..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />

      {!sent ? (
        <button
          onClick={sendAnon}
          className="bg-yellow-400 text-black px-4 py-2 rounded"
        >
          Send
        </button>
      ) : (
        <div className="text-green-400 font-bold">Message Sent ✔</div>
      )}

      <button
        onClick={() => router.back()}
        className="bg-zinc-800 text-yellow-300 px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  );
}

export default function AnonymousPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-yellow-300">Loading...</div>}>
      <AnonymousPageContent />
    </Suspense>
  );
}
