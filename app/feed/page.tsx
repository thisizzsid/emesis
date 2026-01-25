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
  getDoc,
  Firestore
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { MapPin, Send, Ghost, Hash } from "lucide-react";
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
    if (!user || !db) return;
    let map: any = {};
    for (const post of arr) {
      if (post.uid === user.uid) {
        map[post.uid] = true;
        continue;
      }
      const qF = query(
        collection(db as Firestore, "follows"),
        where("follower", "==", user.uid),
        where("followed", "==", post.uid)
      );
      const sF = await getDocs(qF);
      map[post.uid] = !sF.empty;
    }
    setFollowMap(map);
  };

  const load = async () => {
    if (!db) return;
    const snap = await getDocs(
      query(collection(db as Firestore, "posts"), orderBy("createdAt", "desc"))
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
    if (!user || !db || !text.trim()) return;
    const hashtags = extractHashtags(text);
    await addDoc(collection(db as Firestore, "posts"), {
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
    if (!user || !db || uid === user.uid) return;
    await addDoc(collection(db as Firestore, "follows"), {
      follower: user.uid,
      followed: uid,
    });
    setFollowMap({ ...followMap, [uid]: true });
  };

  const unfollowUser = async (uid: string) => {
    if (!user || !db) return;
    const qF = query(
      collection(db as Firestore, "follows"),
      where("follower", "==", user.uid),
      where("followed", "==", uid)
    );
    const sF = await getDocs(qF);
    if (!sF.empty) {
      await deleteDoc(doc(db as Firestore, "follows", sF.docs[0].id));
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
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-[var(--gold-primary)] px-6 py-16">
      <div className="max-w-6xl mx-auto flex gap-8">
        {/* LEFT COLUMN - FEED */}
        <div className="flex-1 space-y-10">
          {/* WELCOME SECTION */}
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-4xl font-black tracking-tighter bg-linear-to-r from-[var(--gold-primary)] via-[var(--gold-light)] to-[var(--gold-primary)] bg-clip-text text-transparent drop-shadow-lg">
              Welcome back, {user?.displayName?.split(" ")[0]}!
            </h1>

            <p className="mt-6 text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed font-light tracking-tight">
              emesis is a quiet place to release Confessions thoughts you don’t usually say out loud —
              <span className="text-[var(--gold-primary)] font-medium"> no judgement, just honesty.</span>
            </p>
          </div>

          {/* CREATE POST */}
          <div className="relative group">
            {/* Subtle Monochrome Glow */}
            <div className="absolute -inset-0.5 bg-[var(--gold-primary)] rounded-3xl blur-sm opacity-5 group-hover:opacity-10 transition duration-1000"></div>
            
            <div className="relative bg-[#0A0A0A] rounded-3xl border border-zinc-800 overflow-hidden">
              
              {/* Minimal Header */}
              <div className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/20 flex items-center justify-between">
                 <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">New Transmission</span>
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                 </div>
              </div>

              {/* Text Area */}
              <div className="p-2">
                <label htmlFor="post-textarea" className="sr-only">Post</label>
                <textarea
                  id="post-textarea"
                  className="w-full bg-transparent text-lg text-zinc-200 placeholder:text-zinc-600 p-4 min-h-40 focus:outline-none resize-none font-medium leading-relaxed tracking-wide selection:bg-[var(--gold-primary)] selection:text-black"
                  placeholder="What's on your mind?..."
                  value={text}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                />
              </div>

              {/* Toolbar */}
              <div className="px-4 py-3 bg-zinc-900/10 border-t border-zinc-800/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Tools */}
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
                  
                  {/* Anonymous Toggle */}
                  <button
                    onClick={() => setAnonymous(!anonymous)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border ${
                      anonymous 
                        ? "bg-zinc-800 text-[var(--gold-primary)] border-zinc-700" 
                        : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-900"
                    }`}
                  >
                    <Ghost className="w-3.5 h-3.5" />
                    {anonymous ? "Anonymous" : "Public"}
                  </button>

                  {/* Location Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-500 text-xs font-medium whitespace-nowrap hover:bg-zinc-900 transition-colors">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]" title={location}>
                      {detectingLocation ? "Locating..." : location}
                    </span>
                  </div>

                  {/* Hashtag Counter */}
                  {extractHashtags(text).length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 text-xs font-medium">
                      <Hash className="w-3 h-3" />
                      <span>{extractHashtags(text).length}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={createPost}
                  disabled={!text.trim()}
                  className="group flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--gold-primary)] text-black font-bold tracking-tight transition-all duration-300 hover:bg-[var(--gold-light)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Post</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
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
        <div className="fixed inset-0 bg-[var(--dark-base)]/90 backdrop-blur-xl flex items-center justify-center z-1000 animate-fadeIn">
          <div className="glass rounded-3xl p-10 w-[90%] max-w-md text-[var(--gold-secondary)] shadow-2xl border border-[rgba(var(--gold-primary-rgb),0.2)] animate-fadeIn">
            <h2 className="text-3xl font-black text-transparent bg-linear-to-r from-[var(--gold-primary)] to-[var(--gold-light)] bg-clip-text mb-6 text-center tracking-tight">
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
              className="modern-btn mt-8 w-full py-3 rounded-xl bg-linear-to-r from-[var(--gold-primary)] to-[var(--gold-secondary)] text-black font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[rgba(var(--gold-primary-rgb),0.3)]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

