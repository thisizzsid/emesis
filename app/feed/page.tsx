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
import Comments from "../components/Comments";
import Image from "next/image";

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [followMap, setFollowMap] = useState<{ [key: string]: boolean }>({});
  const [location, setLocation] = useState<string>("Unknown");
  const [detectingLocation, setDetectingLocation] = useState(false);

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
    load();
  };

  const like = async (p: any) => {
    if (!user) return;
    const ref = doc(db, "posts", p.id);
    const hasLiked = Array.isArray(p.likes) && p.likes.includes(user.uid);
    await updateDoc(ref, {
      likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
    load();
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

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditText(p.text);
    setMenuOpen(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim() || !user) return;
    const ref = doc(db, "posts", editingId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const old = snap.data();
    await updateDoc(ref, {
      ...old,
      text: editText,
      updatedAt: Timestamp.now()
    });

    setEditingId(null);
    setEditText("");
    load();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const removePost = async (id: string) => {
    await deleteDoc(doc(db, "posts", id));
    setMenuOpen(null);
    load();
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

  const renderTextWithHashtags = (text: string) => {
    const parts = text.split(/(#[\w\u0590-\u05ff]+)/gi);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <span key={i} className="text-[#FFD56A] font-semibold hover:text-[#F5C26B] cursor-pointer">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!user) {
    return (
      <div className="h-screen bg-black text-yellow-300 flex items-center justify-center">
        Login Required
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-[#F5C26B] px-6 py-16 space-y-10">
      {/* CONFESSION BOX */}
      {/* WELCOME SECTION */}
<div className="max-w-3xl mx-auto text-center mt-0.1 mb-12 animate-fadeIn">
  <h1 className="text-4xl font-black tracking-tighter bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-clip-text text-transparent drop-shadow-lg">
    Welcome back, {user?.displayName?.split(" ")[0]}!
  </h1>

  <p className="mt-6 text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed font-light tracking-tight">
    emesis is a quiet place to release Confessions  thoughts you don’t usually say out loud —
    <span className="text-[#F5C26B] font-medium"> no judgement, just honesty.</span>
  </p>
</div>

      <div className="max-w-3xl mx-auto glass rounded-3xl p-6 shadow-2xl border border-[#F5C26B]/20 animate-fadeIn">
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
              <span className="truncate max-w-[150px]" title={location}>
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

      {/* POSTS */}
      <div className="max-w-2xl mx-auto space-y-6">
        {posts.map((p: any) => (
          <div key={p.id} className="glass glass-hover p-6 rounded-2xl relative border border-[#F5C26B]/20 group">
            {p.uid === user.uid && (
              <button
                onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                className="absolute right-4 top-4 text-xl"
              >
                ⋮
              </button>
            )}

            {menuOpen === p.id && (
              <div className="absolute right-4 top-10 bg-black/80 border border-zinc-700 rounded text-sm shadow-lg">
                <button onClick={() => startEdit(p)} className="block px-3 py-2 hover:bg-zinc-800 w-full">✏️ Edit</button>
                <button onClick={() => removePost(p.id)} className="block px-3 py-2 hover:bg-zinc-800 w-full text-red-400">🗑 Delete</button>
              </div>
            )}

            {editingId === p.id ? (
              <>
                <label htmlFor={`edit-textarea-${p.id}`} className="sr-only">Edit Post</label>
                <textarea
                  id={`edit-textarea-${p.id}`}
                  value={editText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditText(e.target.value)}
                  className="w-full bg-black p-3 border rounded"
                  placeholder="Edit your confession/thoughts/whisper..."
                />
                <div className="mt-3 flex gap-3">
                  <button onClick={saveEdit} className="px-4 py-1 bg-[#F5C26B] text-black rounded">Save</button>
                  <button onClick={cancelEdit} className="px-4 py-1 border rounded">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <p className="text-xs opacity-50 font-medium tracking-tight">
                    {p.anonymous ? "Anonymous" : p.username}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                    {p.location && (
                      <div className="flex items-center gap-1">
                        <Image src="/location.png" width={10} height={10} alt="location" />
                        <span className="truncate max-w-[100px]" title={p.location}>{p.location}</span>
                      </div>
                    )}
                    {p.createdAt && (
                      <span>
                        {new Date(p.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {" • "}
                        {new Date(p.createdAt.seconds * 1000).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-[#F4BC4B] leading-relaxed font-normal">{renderTextWithHashtags(p.text)}</p>

                {p.hashtags && p.hashtags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.hashtags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-full bg-[#F5C26B]/10 border border-[#F5C26B]/30 text-[#FFD56A] hover:bg-[#F5C26B]/20 cursor-pointer transition-all"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex gap-4 text-sm items-center">
                  {p.uid !== user.uid && (
                    followMap[p.uid] ? (
                        
                      <button onClick={() => unfollowUser(p.uid)} className="px-4 py-1.5 bg-linear-to-r from-[#F5C26B] to-[#F4BC4B] text-black rounded-lg font-semibold text-xs hover:scale-105 active:scale-95 transition-all duration-300">Following</button>
                    ) : (
                      <button onClick={() => followUser(p.uid)} className="px-4 py-1.5 border-[1.5px] border-[#F5C26B]/30 text-[#F5C26B] rounded-lg font-semibold text-xs hover:border-[#F5C26B] hover:bg-[#F5C26B]/10 hover:scale-105 active:scale-95 transition-all duration-300">Follow</button>
                    )
                  )}

                  <button onClick={() => like(p)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#F5C26B]/10 transition-all duration-300 hover:scale-105 active:scale-95">
                    <Image src="/like.png" width={16} height={16} alt="like" />
                    <span className="font-medium">{p.likes?.length || 0}</span>
                  </button>

                  <button onClick={() => setOpenComments(openComments === p.id ? null : p.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#F5C26B]/10 transition-all duration-300 hover:scale-105 active:scale-95">
                    <Image src="/comment.png" width={16} height={16} alt="comment" />
                    <span className="font-medium">Comment</span>
                  </button>
                </div>

                {openComments === p.id && <Comments postId={p.id} />}
              </>
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
        ))}
      </div>
    </div>
  );
}

