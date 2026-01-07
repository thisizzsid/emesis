"use client";

import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TrendingSidebar from "../components/TrendingSidebar";
import Toast from "../components/Toast";
import PostCard from "../components/PostCard";

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [followMap, setFollowMap] = useState<{ [key: string]: boolean }>({});
  const [location, setLocation] = useState<string>("Unknown");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const loadFollows = async (arr: any[]) => {
    if (!user) return;
    let map: any = {};
    for (const post of arr) {
      if (post.uid === user.uid) {
        map[post.uid] = true;
        continue;
      }
      const qF = query(
        collection(db, "follows"),
        where("follower", "==", user.uid),
        where("followed", "==", post.uid)
      );
      const sF = await getDocs(qF);
      map[post.uid] = !sF.empty;
    }
    setFollowMap(map);
  };

  const load = async () => {
    const snap = await getDocs(
      query(collection(db, "posts"), orderBy("createdAt", "desc"))
    );
    const arr: any[] = [];
    snap.forEach((d: any) => {
      const data: any = d.data();
      if (!Array.isArray(data.likes)) data.likes = [];
      if (!data.uid) data.uid = "unknown"; // fixer
      arr.push({ id: d.id, ...data });
    });
    setPosts(arr);
    loadFollows(arr);
  };

  const createPost = async () => {
    if (!user || !text.trim()) return;
    const hashtags = extractHashtags(text);
    await addDoc(collection(db, "posts"), {
      text,
      uid: user.uid,
      username: anonymous ? "Anonymous" : user.displayName,
      anonymous,
      likes: [],
      hashtags,
      location,
      createdAt: Timestamp.now()
    });
    setText("");
    setAnonymous(false);
    showToast("Confession released into the void ✨");
    load();
  };

  const like = async (p: any) => {
    // Moved to PostCard
  };

  const followUser = async (uid: string) => {
    if (!user || uid === user.uid) return;
    await addDoc(collection(db, "follows"), {
      follower: user.uid,
      followed: uid,
    });
    setFollowMap({ ...followMap, [uid]: true });
  };

  const unfollowUser = async (uid: string) => {
    if (!user) return;
    const qF = query(
      collection(db, "follows"),
      where("follower", "==", user.uid),
      where("followed", "==", uid)
    );
    const sF = await getDocs(qF);
    if (!sF.empty) {
      await deleteDoc(doc(db, "follows", sF.docs[0].id));
    }
    setFollowMap({ ...followMap, [uid]: false });
  };

  const [showUpcoming, setShowUpcoming] = useState(false);


  useEffect(() => {
    load();
    detectLocation();
  }, []);

  const detectLocation = () => {
    setDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || "Unknown City";
            const country = data.address?.country || "";
            setLocation(`${city}, ${country}`);
          } catch (error) {
            setLocation("Location unavailable");
          }
          setDetectingLocation(false);
        },
        () => {
          setLocation("Location disabled");
          setDetectingLocation(false);
        }
      );
    } else {
      setLocation("Location not supported");
      setDetectingLocation(false);
    }
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/gi;
    return text.match(hashtagRegex) || [];
  };

  if (!user) {
    return (
      <div className="h-screen bg-black text-yellow-300 flex items-center justify-center">
        Login Required
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-[#F5C26B] px-6 py-16">
      <div className="max-w-6xl mx-auto flex gap-8">
        {/* LEFT COLUMN - FEED */}
        <div className="flex-1 space-y-10">
          {/* WELCOME SECTION */}
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-4xl font-black tracking-tighter bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-clip-text text-transparent drop-shadow-lg">
              Welcome back, {user?.displayName?.split(" ")[0]}!
            </h1>

            <p className="mt-6 text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed font-light tracking-tight">
              emesis is a quiet place to release Confessions thoughts you don’t usually say out loud —
              <span className="text-[#F5C26B] font-medium"> no judgement, just honesty.</span>
            </p>
          </div>

          {/* CREATE POST */}
          <div className="glass rounded-3xl p-6 shadow-2xl border border-[#F5C26B]/20 animate-fadeIn">
            <label htmlFor="post-textarea" className="sr-only">Post</label>
            <textarea
              id="post-textarea"
              className="w-full bg-black/40 border-[1.5px] border-[#F5C26B]/20 rounded-2xl p-5 text-[#F4BC4B] min-h-35 focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/30"
              placeholder="Write your confession/thoughts/whisper..."
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            />
            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-xs flex items-center gap-2.5 font-medium cursor-pointer group">
                  <input type="checkbox" checked={anonymous} onChange={() => setAnonymous(!anonymous)} className="w-4 h-4 cursor-pointer accent-[#F5C26B]" />
                  <span className="group-hover:text-[#FFD56A] transition-colors">Anonymous Post</span>
                </label>
                <div className="flex items-center gap-2 text-xs text-[#F5C26B]/70">
                  <Image src="/location.png" width={14} height={14} alt="location" />
                  <span className="truncate max-w-37.5" title={location}>
                    {detectingLocation ? "Detecting..." : location}
                  </span>
                </div>
                {extractHashtags(text).length > 0 && (
                  <div className="text-xs text-[#FFD56A] flex items-center gap-1.5">
                    <span className="font-bold">#</span>
                    <span>{extractHashtags(text).length} hashtag{extractHashtags(text).length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <button
                onClick={createPost}
                className="modern-btn px-6 py-2.5 bg-linear-to-r from-[#F5C26B] to-[#F4BC4B] text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[#F5C26B]/30 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Share
              </button>
            </div>
          </div>

          {/* POSTS LIST */}
          <div className="space-y-6">
            {posts.map((p: any) => (
              <PostCard
                key={p.id}
                post={p}
                user={user}
                isFollowing={followMap[p.uid]}
                onFollow={followUser}
                onUnfollow={unfollowUser}
                onRefresh={load}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - TRENDING SIDEBAR */}
        <TrendingSidebar />
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* === MODAL === */}
      {showUpcoming && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-1000 animate-fadeIn">
          <div className="glass rounded-3xl p-10 w-[90%] max-w-md text-[#F4BC4B] shadow-2xl border border-[#F5C26B]/20 animate-fadeIn">
            <h2 className="text-3xl font-black text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text mb-6 text-center tracking-tight">
              Upcoming Features
            </h2>

            <ul className="space-y-3 text-sm leading-relaxed">
              <li>Private Chat 2.0 (Voice)</li>
              <li>Anonymous Stories</li>
              <li>Voice Confessions</li>
              <li>AI Soulmate Mode</li>
              <li>Dark / Light Themes</li>
              <li>Location-based Connections</li>
              <li>Trending Feed Engine</li>
              <li>UI Upgrade</li>
              <li>And much more...</li>
              <li>V2.1</li>
            </ul>

            <button
              onClick={() => setShowUpcoming(false)}
              className="modern-btn mt-8 w-full py-3 rounded-xl bg-linear-to-r from-[#F5C26B] to-[#F4BC4B] text-black font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[#F5C26B]/30"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

