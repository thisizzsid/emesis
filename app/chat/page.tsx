"use client";

import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  Firestore,
  query,
  where,
  addDoc,
  Timestamp,
  deleteDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const maskEmail = (email: string) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const maskedName = name.length > 2 ? name.substring(0, 2) + "..." : name;
  return `${maskedName}@${domain}`;
};

const isUserOnline = (lastSeen: any) => {
  if (!lastSeen) return false;
  const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000 / 60; // minutes
  return diff < 5;
};

export default function ChatListPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [youFollow, setYouFollow] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  const load = async () => {
    if (!user || !db) return;
    setLoading(true);

    try {
      // 1. Get who YOU follow (using root 'follows' collection)
      const fQ = query(
        collection(db as Firestore, "follows"),
        where("follower", "==", user.uid)
      );
      const fSnap = await getDocs(fQ);
      const followedIds = fSnap.docs.map((d) => d.data().followed);
      setYouFollow(followedIds);

      // 2. Load all users
      const allSnap = await getDocs(collection(db as Firestore, "users"));
      const arr: any[] = [];
      allSnap.forEach((d) => {
        if (d.id !== user.uid) arr.push({ id: d.id, ...d.data() });
      });
      setUsersList(arr);
      setLoading(false);
    } catch (error) {
      console.error("Error loading users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleFollow = async (targetUid: string) => {
    if (!user || !db) return;
    setFollowLoading(targetUid);

    try {
      // Add to 'follows' collection
      await addDoc(collection(db as Firestore, "follows"), {
        follower: user.uid,
        followed: targetUid,
        createdAt: Timestamp.now(),
      });

      // Update local state to immediately reflect change (and potentially unlock chat)
      setYouFollow((prev) => [...prev, targetUid]);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setFollowLoading(null);
    }
  };

  const isLocked = youFollow.length === 0;

  if (!user) {
    return (
      <div className="h-screen bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-(--gold-primary) flex items-center justify-center">
        <div className="glass rounded-3xl p-12 animate-bounceIn">
          <p className="text-2xl font-bold">Login Required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-(--gold-primary) px-4 md:px-8 py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-40 left-20 w-96 h-96 bg-(--gold-primary)/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#00F0FF]/5 rounded-full blur-3xl animate-float animation-delay-2000"></div>

      {isLocked && !loading ? (
        // ================= LOCKED / ONBOARDING VIEW =================
        <div className="max-w-4xl mx-auto relative z-10 animate-fadeIn">
          <div className="text-center mb-12">
             <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mx-auto mb-6 shadow-2xl border border-zinc-700/50">
               <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
               Unlock Your Chat
             </h1>
             <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
               To ensure a high-quality community, messaging is reserved for connected members. 
               <span className="text-(--gold-primary) font-medium"> Follow at least one person</span> to activate your inbox.
             </p>
          </div>

          <div className="glass rounded-3xl border border-zinc-800/50 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800/50 bg-black/20">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-(--gold-primary)">★</span> Suggested Connections
              </h2>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {usersList.slice(0, 5).map((u) => (
                <div key={u.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-zinc-800 to-zinc-700 flex items-center justify-center font-bold text-white shadow-lg">
                      {u.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{u.username || "Anonymous"}</p>
                      <p className="text-sm text-zinc-500">{maskEmail(u.email)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(u.id)}
                    disabled={followLoading === u.id}
                    className="px-6 py-2.5 rounded-xl bg-(--gold-primary) text-black font-bold text-sm hover:bg-(--gold-light) hover:scale-105 active:scale-95 transition-all shadow-lg shadow-(--gold-primary)/20 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {followLoading === u.id ? "Following..." : "Follow to Unlock"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ================= UNLOCKED / CHAT VIEW =================
        <>
          <div className="text-center mb-16 animate-fadeIn relative z-10">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-(--gold-primary) to-(--gold-light) flex items-center justify-center shadow-2xl shadow-(--gold-primary)/50 animate-pulse-glow mx-auto">
                <span className="text-4xl">💬</span>
              </div>
            </div>

            <h1 className="text-7xl font-black tracking-tighter bg-linear-to-r from-(--gold-primary) via-(--gold-light) to-(--gold-primary) bg-clip-text text-transparent drop-shadow-lg mb-4 font-[Orbitron] bg-size-[200%_auto] animate-textShine">
              Private Chats
            </h1>

            <p className="mt-4 text-lg text-zinc-500 font-light tracking-tight max-w-2xl mx-auto">
              Secure end-to-end encrypted conversations.
            </p>

            {/* Stats */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-zinc-600 font-medium">
                  {usersList.length} Available
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-(--gold-primary) animate-pulse"></div>
                <span className="text-sm text-zinc-600 font-medium">
                  {youFollow.length} Following
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 max-w-5xl mx-auto relative z-10">
            {/* Emesis AI Bot Card */}
            {!loading && (
              <div className="glass glass-hover rounded-2xl p-6 md:p-8 shadow-2xl border border-(--gold-primary)/25 group relative overflow-hidden animate-fadeIn">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-purple-500"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6 relative z-10">
                  <div className="flex items-center gap-5 w-full md:flex-1">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl font-black text-2xl text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        AI
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 md:w-5 h-4 md:h-5 rounded-full border-2 border-black bg-green-500 animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xl md:text-2xl text-(--gold-primary) mb-1 group-hover:text-(--gold-light) transition-colors truncate">
                        Emesis AI
                      </p>
                      <p className="text-xs md:text-sm text-zinc-600 flex items-center gap-2 mb-2">
                        <span className="truncate">Always here for you</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-blue-400 bg-(--dark-base)/40 px-3 py-2 rounded-lg border border-blue-500/30 w-fit">
                         <span>24/7 Companion • Smart Reply</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto shrink-0">
                    <Link
                      href={`/chat/ai_${user.uid}`}
                      className="modern-btn w-full md:w-auto px-8 py-4 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      Chat AI
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 md:p-8 shadow-xl border border-(--gold-primary)/20 animate-pulse">
                  <div className="flex items-center gap-5 md:gap-6">
                    <div className="skeleton w-14 h-14 md:w-16 md:h-16 rounded-2xl"></div>
                    <div className="flex-1 space-y-2 md:space-y-3">
                      <div className="skeleton h-5 md:h-6 w-36 md:w-40 rounded"></div>
                      <div className="skeleton h-3.5 md:h-4 w-52 md:w-60 rounded"></div>
                    </div>
                    <div className="skeleton h-9 md:h-10 w-24 md:w-28 rounded-xl"></div>
                  </div>
                </div>
              ))
            ) : usersList.length === 0 ? (
              <div className="glass rounded-3xl p-16 text-center shadow-2xl border border-(--gold-primary)/30 animate-fadeIn">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-2xl font-bold text-(--gold-primary) mb-2">No Users Found</p>
              </div>
            ) : (
              usersList.map((u) => {
                const chatId = [user.uid, u.id].sort().join("_");
                const online = isUserOnline(u.lastSeen);
                const isFollowing = youFollow.includes(u.id);

                return (
                  <div
                    key={u.id}
                    className="glass glass-hover rounded-2xl p-6 md:p-8 shadow-2xl border border-(--gold-primary)/25 group relative overflow-hidden animate-fadeIn"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r from-green-500 to-emerald-500`}></div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6 relative z-10">
                      <div className="flex items-center gap-5 w-full md:flex-1">
                        <div className="relative shrink-0">
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl font-black text-2xl text-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                            {u.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          {online && (
                            <div className={`absolute -bottom-1 -right-1 w-4 md:w-5 h-4 md:h-5 rounded-full border-2 border-black bg-green-500 animate-pulse`}></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xl md:text-2xl text-(--gold-primary) mb-1 group-hover:text-(--gold-light) transition-colors truncate">
                            {u.username || "No Name"}
                          </p>
                          <p className="text-xs md:text-sm text-zinc-600 flex items-center gap-2 mb-2">
                            <span className="truncate">{maskEmail(u.email)}</span>
                            {isFollowing && <span className="text-xs bg-(--gold-primary)/10 text-(--gold-primary) px-2 py-0.5 rounded-full">Following</span>}
                          </p>
                        </div>
                      </div>

                      <div className="w-full md:w-auto shrink-0 flex gap-2">
                        {!isFollowing && (
                           <button
                             onClick={() => handleFollow(u.id)}
                             disabled={followLoading === u.id}
                             className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors text-sm font-medium"
                           >
                             {followLoading === u.id ? "..." : "Follow"}
                           </button>
                        )}
                        <Link
                          href={`/chat/${chatId}`}
                          className="group relative w-full md:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-(--gold-primary)/30 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-md overflow-hidden"
                        >
                           <div className="absolute inset-0 bg-linear-to-r from-(--gold-primary)/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                           <span className="text-zinc-300 font-medium group-hover:text-(--gold-primary) transition-colors relative z-10">Open Chat</span>
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-(--gold-primary) group-hover:text-black transition-all duration-300 relative z-10">
                              <svg className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                           </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
