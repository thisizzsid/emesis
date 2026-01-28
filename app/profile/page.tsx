"use client";

import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  Firestore,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followDocId, setFollowDocId] = useState<string | null>(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [accentColor, setAccentColor] = useState<string | null>(null);

  // Get UID from query param or default to logged-in user
  const [profileUid, setProfileUid] = useState<string | null>(null);

  // Simple color lighten utility
  const lighten = (hex: string, amt = 20) => {
    try {
      const h = hex.replace("#", "");
      const num = parseInt(h, 16);
      let r = Math.min(255, ((num >> 16) & 0xff) + amt);
      let g = Math.min(255, ((num >> 8) & 0xff) + amt);
      let b = Math.min(255, (num & 0xff) + amt);
      return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
    } catch {
      return hex;
    }
  };

  // Stats for visualization
  const [stats, setStats] = useState<{ postsPerDay: number[]; likesPerDay: number[]; viewsPerDay: number[]; totalLikes: number; totalPosts: number; totalViews: number }>({
    postsPerDay: Array(7).fill(0),
    likesPerDay: Array(7).fill(0),
    viewsPerDay: Array(7).fill(0),
    totalLikes: 0,
    totalPosts: 0,
    totalViews: 0
  });

  // Verification Logic: Check 5 conditions (Name, Bio, Avatar, Email, Phone)
  const isVerified = useMemo(() => {
    if (!data) return false;
    const hasName = !!data.username;
    const hasBio = !!data.bio;
    const hasAvatar = !!data.photoURL;
    // For private fields, check auth user if owner
    const hasEmail = !!(data.email || (isOwner && user?.email));
    const hasPhone = !!(data.phoneNumber || (isOwner && user?.phoneNumber));

    return hasName && hasBio && hasAvatar && hasEmail && hasPhone;
  }, [data, isOwner, user]);





  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const uid = params.get("uid");
      setProfileUid(uid || user?.uid || null);
    }
  }, [user]);

  const load = async () => {
    if (!user || !profileUid || !db) return;

    const ref = doc(db as Firestore, "users", profileUid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      setData(d);
      setIsOwner(profileUid === user.uid);
      setAccentColor(d?.accentColor || null);
    }

    const fQ = query(
      collection(db as Firestore, "follows"),
      where("follower", "==", user.uid),
      where("followed", "==", profileUid)
    );
    const fSnap = await getDocs(fQ);

    if (!fSnap.empty) {
      setIsFollowing(true);
      setFollowDocId(fSnap.docs[0].id);
    } else {
      setIsFollowing(false);
      setFollowDocId(null);
    }

    const followersQ = query(
      collection(db as Firestore, "follows"),
      where("followed", "==", profileUid)
    );
    const followersSnap = await getDocs(followersQ);
    setFollowersCount(followersSnap.size);

    const followingQ = query(
      collection(db as Firestore, "follows"),
      where("follower", "==", profileUid)
    );
    const followingSnap = await getDocs(followingQ);
    setFollowingCount(followingSnap.size);

    // Log a profile view if not owner
    try {
      if (user.uid !== profileUid) {
        await addDoc(collection(db as Firestore, "profileViews"), {
          targetUid: profileUid,
          viewerUid: user.uid,
          createdAt: (Timestamp.now() as any)
        });
      }
    } catch {}

    // Compute stats for last 7 days
    const start = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const postsQ = query(
      collection(db as Firestore, "posts"),
      where("uid", "==", profileUid),
      where("createdAt", ">", start)
    );
    const postsSnap = await getDocs(postsQ);
    const perDay = Array(7).fill(0);
    const likesPerDay = Array(7).fill(0);
    let totalLikes = 0;
    postsSnap.forEach((p) => {
      const pd = p.data();
      const created = (pd.createdAt?.toDate?.() ? pd.createdAt.toDate() : new Date(pd.createdAt?.seconds ? pd.createdAt.seconds * 1000 : Date.now())) as Date;
      const daysAgo = Math.floor((Date.now() - created.getTime()) / (24 * 60 * 60 * 1000));
      const idx = Math.max(0, Math.min(6, 6 - daysAgo));
      perDay[idx] += 1;
      const likesCount = Array.isArray(pd.likes) ? pd.likes.length : 0;
      likesPerDay[idx] += likesCount;
      totalLikes += likesCount;
    });
    const viewsQ = query(
      collection(db as Firestore, "profileViews"),
      where("targetUid", "==", profileUid),
      where("createdAt", ">", start)
    );
    const viewsSnap = await getDocs(viewsQ);
    const viewsPerDay = Array(7).fill(0);
    viewsSnap.forEach((v) => {
      const vd = v.data();
      const created = (vd.createdAt?.toDate?.() ? vd.createdAt.toDate() : new Date(vd.createdAt?.seconds ? vd.createdAt.seconds * 1000 : Date.now())) as Date;
      const daysAgo = Math.floor((Date.now() - created.getTime()) / (24 * 60 * 60 * 1000));
      const idx = Math.max(0, Math.min(6, 6 - daysAgo));
      viewsPerDay[idx] += 1;
    });
    setStats({
      postsPerDay: perDay,
      likesPerDay,
      viewsPerDay,
      totalLikes,
      totalPosts: postsSnap.size,
      totalViews: viewsSnap.size
    });
  };

  const follow = async () => {
    if (!user || !db) return;
    // Check if already following to prevent duplicate
    const fQ = query(
      collection(db as Firestore, "follows"),
      where("follower", "==", user.uid),
      where("followed", "==", profileUid)
    );
    const fSnap = await getDocs(fQ);
    
    if (!fSnap.empty) {
      // Already following, update UI
      setIsFollowing(true);
      setFollowDocId(fSnap.docs[0].id);
      return;
    }
    
    // Not following, add document
    const docRef = await addDoc(collection(db as Firestore, "follows"), {
      follower: user.uid,
      followed: profileUid,
    });

    // Send notification
    try {
      await addDoc(collection(db as Firestore, `users/${profileUid}/notifications`), {
        type: "follow",
        fromUid: user.uid,
        fromName: user.displayName || "User",
        createdAt: Timestamp.now(),
        read: false,
      });
    } catch {}
    
    // Update UI immediately with optimistic update
    setIsFollowing(true);
    setFollowDocId(docRef.id);
    setFollowersCount(prev => prev + 1);
  };

  const unfollow = async () => {
    if (!followDocId || !db) return;
    
    // Delete first
    await deleteDoc(doc(db as Firestore, "follows", followDocId));
    
    // Then update UI
    setIsFollowing(false);
    setFollowDocId(null);
    setFollowersCount(prev => Math.max(0, prev - 1));
  };

  const displayJoined = () => {
    if (!data?.joined) return "N/A";
    try {
      return data.joined.toDate().toLocaleDateString();
    } catch {
      return String(data.joined);
    }
  };

  const saveAccentColor = async (hex: string) => {
    if (!isOwner || !db || !profileUid) return;
    try {
      await addDoc(collection(db as Firestore, `users/${profileUid}/notifications`), {
        type: "theme",
        fromUid: profileUid,
        message: "Accent color updated",
        createdAt: Timestamp.now(),
        read: false,
      });
    } catch {}
    try {
      await updateDoc(doc(db as Firestore, "users", profileUid), {
        accentColor: hex
      });
      setAccentColor(hex);
    } catch {}
  };

  useEffect(() => {
    if (profileUid) {
      load();
    }
  }, [user, profileUid]);

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-(--gold-primary)">
        Login Required
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-(--gold-primary)">
        <div className="w-10 h-10 border-2 border-(--gold-primary) border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const BlueBadge = () => (
    <svg className="w-6 h-6 text-blue-500 inline-block align-text-bottom animate-badge-pop" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.457.748 2.795 1.863 3.474C3.12 16.59 3 17.29 3 18c0 2.21 1.79 4 4 4 .71 0 1.41-.12 2.026-.363.68 1.115 2.018 1.863 3.474 1.863 1.457 0 2.795-.748 3.474-1.863.614.243 1.314.363 2.026.363 2.21 0 4-1.79 4-4 0-.71-.12-1.41-.363-2.026 1.115-.68 1.863-2.017 1.863-3.474zM10 17l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );

  // Sparkline component
  const Sparkline = ({ values, color }: { values: number[]; color: string }) => {
    const max = Math.max(1, ...values);
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg viewBox="0 0 100 100" className="w-full h-10">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div
      className="min-h-full bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-(--gold-primary) py-10 px-4 md:px-6 flex flex-col items-center"
      style={
        accentColor
          ? ({
              ["--gold-primary" as any]: accentColor,
              ["--gold-light" as any]: lighten(accentColor, 15),
            } as any)
          : undefined
      }
    >
      <div className="max-w-5xl w-full">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 mb-8">
          <div className="absolute inset-0 bg-linear-to-r from-(--gold-primary)/20 via-transparent to-(--gold-light)/10 opacity-20" />
          <div className="relative p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-linear-to-br from-(--gold-primary)/15 to-transparent border border-(--gold-primary)/30 flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg shadow-(--gold-primary)/10">
              {data.username ? data.username.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-6">
                <div className="text-center sm:text-left min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-(--gold-secondary) flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    {data.username || "No Username"}
                    {isVerified && <BlueBadge />}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">Joined {displayJoined()}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                  {isOwner ? (
                    <Link
                      href="/profile/edit"
                      className="flex-1 sm:flex-none text-center px-6 py-2.5 rounded-xl bg-(--gold-primary) text-black font-bold hover:bg-(--gold-light) transition shadow-lg shadow-(--gold-primary)/20 active:scale-95"
                      aria-label="Edit profile"
                    >
                      Edit Profile
                    </Link>
                  ) : isFollowing ? (
                    <button
                      onClick={unfollow}
                      type="button"
                      aria-label="Unfollow user"
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-red-500/90 text-white font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20 active:scale-95"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={follow}
                      type="button"
                      aria-label="Follow user"
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-(--gold-primary) text-black font-bold hover:bg-(--gold-light) transition shadow-lg shadow-(--gold-primary)/20 active:scale-95"
                    >
                      Follow
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/2 p-4">
            <div className="text-xs text-zinc-500">Followers</div>
            <div className="text-2xl font-bold text-(--gold-primary)">{followersCount}</div>
            <Sparkline values={stats.viewsPerDay} color="#F5C26B" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/2 p-4">
            <div className="text-xs text-zinc-500">Following</div>
            <div className="text-2xl font-bold text-(--gold-primary)">{followingCount}</div>
            <Sparkline values={stats.postsPerDay} color="#FFD56A" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/2 p-4">
            <div className="text-xs text-zinc-500">Posts (7d)</div>
            <div className="text-2xl font-bold text-(--gold-primary)">{stats.totalPosts}</div>
            <Sparkline values={stats.postsPerDay} color={accentColor || "#F5C26B"} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/2 p-4">
            <div className="text-xs text-zinc-500">Likes (7d)</div>
            <div className="text-2xl font-bold text-(--gold-primary)">{stats.totalLikes}</div>
            <Sparkline values={stats.likesPerDay} color={lighten(accentColor || "#F5C26B", 25)} />
          </div>
        </div>

        {/* Theme Options (Owner only) */}
        {isOwner && (
          <div className="rounded-3xl border border-white/10 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Accent Theme</h2>
              <span className="text-xs text-zinc-500">Personalize your profile</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {["#F5C26B", "#FF8A00", "#4ADE80", "#60A5FA", "#A78BFA", "#F472B6"].map((hex) => (
                <button
                  key={hex}
                  aria-label={`Set accent color ${hex}`}
                  onClick={() => saveAccentColor(hex)}
                  type="button"
                  className={`w-9 h-9 rounded-full border ${accentColor === hex ? "ring-2 ring-white/80" : "border-white/20"}`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 p-6">
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">Profile</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Image src="/age.png" width={20} height={20} alt="Age" />
                <span className="text-zinc-400">Age</span>
                <span className="ml-auto text-(--gold-primary)">{data.age || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/gender.png" width={20} height={20} alt="Gender" />
                <span className="text-zinc-400">Gender</span>
                <span className="ml-auto text-(--gold-primary)">{data.gender || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/location.png" width={20} height={20} alt="Location" />
                <span className="text-zinc-400">Location</span>
                <span className="ml-auto text-(--gold-primary)">{data.location || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 p-6">
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">Bio</h3>
            <p className="text-[15px] leading-relaxed text-(--gold-secondary)">{data.bio || "No bio added"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
