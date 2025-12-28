"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";

export default function ExplorePage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [followersList, setFollowersList] = useState<string[]>([]);
  const uid = user?.uid; // safe shortcut

  const notifyFollow = async (toUid: string) => {
    if (!uid || toUid === uid) return;
    await addDoc(collection(db, `users/${toUid}/notifications`), {
      type: "follow",
      fromUid: uid,
      fromName: user?.displayName ?? "Unknown",
      createdAt: Timestamp.now(),
      read: false,
    });
  };

  const load = async () => {
    if (!uid) return; // prevent undefined usage

    // USERS
    const arr: any[] = [];
    const usersSnap = await getDocs(query(collection(db, "users"), orderBy("username")));
    usersSnap.forEach((d) => {
      if (d.id !== uid) {
        arr.push({ id: d.id, ...d.data() });
      }
    });
    setUsersList(arr);
    setFiltered(arr);

    // FOLLOWING
    const followingRef = collection(db, `users/${uid}/following`);
    const followingSnap = await getDocs(followingRef);
    setFollowingList(followingSnap.docs.map((d) => d.id));

    // FOLLOWERS
    const followersRef = collection(db, `users/${uid}/followers`);
    const followersSnap = await getDocs(followersRef);
    setFollowersList(followersSnap.docs.map((d) => d.id));
  };

  const runSearch = () => {
    const keyword = search.toLowerCase();
    const f = usersList.filter(
      (u) =>
        u.username &&
        typeof u.username === "string" &&
        u.username.toLowerCase().includes(keyword)
    );
    setFiltered(f);
  };

  const clearSearch = () => {
    setSearch("");
    setFiltered(usersList);
  };

  const follow = async (targetUid: string) => {
    if (!uid) return;
    await setDoc(doc(db, `users/${uid}/following/${targetUid}`), { ts: Date.now() });
    await setDoc(doc(db, `users/${targetUid}/followers/${uid}`), { ts: Date.now() });
    await notifyFollow(targetUid);
    load();
  };

  const unfollow = async (targetUid: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/following/${targetUid}`));
    await deleteDoc(doc(db, `users/${targetUid}/followers/${uid}`));
    load();
  };

  useEffect(() => {
    load();
  }, [uid]);

  if (!uid)
    return (
      <div className="h-screen bg-[#0D0D0D] text-[#F5C26B] flex items-center justify-center">
        Login Required
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5C26B] px-8 py-24">
      {/* Heading */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold tracking-wider drop-shadow-lg">
          Explore Users
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Discover, follow & connect anonymously
        </p>
      </div>

      {/* SEARCH */}
      <div className="max-w-xl mx-auto flex gap-3 mb-12">
        <input
          className="flex-1 bg-black/40 border border-[#F4BC4B] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#F4BC4B]"
          placeholder="Search username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
        />
        <button
          onClick={runSearch}
          className="bg-[#F5C26B] text-black px-5 rounded-xl font-semibold hover:bg-[#F4BC4B] transition"
        >
          Search
        </button>
        {search.length > 0 && (
          <button
            onClick={clearSearch}
            className="bg-red-500 text-black px-4 rounded-xl text-sm font-bold"
          >
            X
          </button>
        )}
      </div>

      {/* USERS GRID */}
      <div
        className="
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          gap-8 max-w-6xl mx-auto
        "
      >
        {filtered.length === 0 && (
          <p className="text-center opacity-50">No users found.</p>
        )}

        {filtered.map((u) => {
          const isFollowing = followingList.includes(u.id);
          const followsYou = followersList.includes(u.id);
          const isMutual = isFollowing && followsYou;

          return (
            <div
              key={u.id}
              className="
                bg-black/50 border border-[#F4BC4B] p-6 rounded-2xl shadow-lg
                hover:shadow-yellow-400/20 hover:scale-[1.03]
                transition-all duration-300 backdrop-blur-xl
              "
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xl font-bold tracking-wide text-[#F5C26B]">
                  {u.username ?? "Unknown User"}
                </p>

                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_2px_rgba(0,255,0,0.6)]" />
              </div>

              <p className="text-xs text-zinc-500 line-clamp-2 mb-4">
                {u.bio || "No bio written yet..."}
              </p>

              <div className="flex items-center justify-between">
                {isFollowing ? (
                  <button
                    onClick={() => unfollow(u.id)}
                    className="bg-red-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-400"
                  >
                    Unfollow
                  </button>
                ) : followsYou ? (
                  <button
                    onClick={() => follow(u.id)}
                    className="bg-[#F5C26B] text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#F4BC4B]"
                  >
                    Follow Back
                  </button>
                ) : (
                  <button
                    onClick={() => follow(u.id)}
                    className="bg-[#F5C26B] text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#F4BC4B]"
                  >
                    Follow
                  </button>
                )}

                {isMutual ? (
                  <Link
                    href={`/chat?uid=${u.id}`}
                    className="bg-[#F4BC4B] text-black px-4 py-2 rounded-lg text-xs"
                  >
                    Message
                  </Link>
                ) : (
                  <Link
                    href={`/anonymous?uid=${u.id}`}
                    className="bg-zinc-800 text-[#F5C26B] px-4 py-2 rounded-lg text-xs border border-zinc-700"
                  >
                    Anon Msg
                  </Link>
                )}
              </div>

              {isMutual && (
                <p className="text-green-400 mt-3 text-xs text-center">
                  ✔ Mutual Follow
                </p>
              )}
              {!isMutual && followsYou && (
                <p className="text-yellow-400 mt-3 text-xs text-center">
                  Follows You
                </p>
              )}

              <Link
                href={`/profile?uid=${u.id}`}
                className="block text-center mt-4 text-xs underline opacity-50 hover:opacity-100 transition"
              >
                View Full Profile
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
