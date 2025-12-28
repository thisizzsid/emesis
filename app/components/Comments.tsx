"use client";

import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Comments({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const load = async () => {
    const q = query(
      collection(db, `posts/${postId}/comments`),
      orderBy("createdAt", "asc")
    );
    const snap = await getDocs(q);
    const arr: any[] = [];
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
    setComments(arr);
  };

  const submit = async () => {
    if (!user || !text.trim()) return;
    await addDoc(collection(db, `posts/${postId}/comments`), {
      uid: user.uid,
      username: user.displayName || "User",
      text,
      createdAt: Timestamp.now(),
    });
    setText("");
    await load();
  };

  const beginEdit = (c: any) => {
    setEditId(c.id);
    setEditText(c.text);
  };

  const saveEdit = async () => {
    if (!editId || !editText.trim()) return;
    await updateDoc(doc(db, `posts/${postId}/comments/${editId}`), {
      text: editText,
      editedAt: Timestamp.now(),
    });
    setEditId(null);
    setEditText("");
    await load();
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, `posts/${postId}/comments/${id}`));
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mt-4 border-t border-zinc-700 pt-3 space-y-5">
      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-zinc-800 rounded p-2"
          placeholder="Reply..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={submit}
          className="bg-yellow-400 text-black px-3 rounded"
        >
          Send
        </button>
      </div>

      {/* Comments */}
      {comments.map((c) => (
        <div
          key={c.id}
          className="bg-zinc-900 border border-zinc-700 rounded p-3 space-y-1"
        >
          <div className="text-xs opacity-50">{c.username}</div>

          {editId === c.id ? (
            <>
              <textarea
                className="w-full bg-black p-2 rounded"
                placeholder="Edit comment"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                aria-label="Edit comment text"
              />
              <div className="flex gap-3 mt-1 text-xs">
                <button
                  onClick={saveEdit}
                  className="bg-yellow-400 text-black px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="border border-zinc-600 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{c.text}</p>
              {user?.uid === c.uid && (
                <div className="flex gap-4 text-xs mt-2">
                  <button
                    onClick={() => beginEdit(c)}
                    className="text-yellow-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
