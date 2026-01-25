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
} from "firebase/firestore";
import { useEffect, useState } from "react";
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

  // Get UID from query param or default to logged-in user
  const [profileUid, setProfileUid] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const uid = params.get("uid");
      setProfileUid(uid || user?.uid || null);
    }
  }, [user]);

  const load = async () => {
    if (!user || !profileUid) return;

    const ref = doc(db, "users", profileUid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setData(snap.data());
      setIsOwner(profileUid === user.uid);
    }

    const fQ = query(
      collection(db, "follows"),
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
      collection(db, "follows"),
      where("followed", "==", profileUid)
    );
    const followersSnap = await getDocs(followersQ);
    setFollowersCount(followersSnap.size);

    const followingQ = query(
      collection(db, "follows"),
      where("follower", "==", profileUid)
    );
    const followingSnap = await getDocs(followingQ);
    setFollowingCount(followingSnap.size);
  };

  const follow = async () => {
    if (!user) return;
    // Check if already following to prevent duplicate
    const fQ = query(
      collection(db, "follows"),
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
    const docRef = await addDoc(collection(db, "follows"), {
      follower: user.uid,
      followed: profileUid,
    });
    
    // Update UI immediately with optimistic update
    setIsFollowing(true);
    setFollowDocId(docRef.id);
    setFollowersCount(prev => prev + 1);
  };

  const unfollow = async () => {
    if (!followDocId) return;
    
    // Delete first
    await deleteDoc(doc(db, "follows", followDocId));
    
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

  useEffect(() => {
    if (profileUid) {
      load();
    }
  }, [user, profileUid]);

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-[var(--gold-primary)]">
        Login Required
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-[var(--gold-primary)]">
        <div className="w-10 h-10 border-2 border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-full bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-[var(--gold-primary)] py-10 px-4 md:px-6 flex flex-col items-center">

      <div className="max-w-3xl w-full bg-black/40 border border-[rgba(var(--gold-primary-rgb),0.2)] rounded-2xl p-6 md:p-10 shadow-xl backdrop-blur-md space-y-10">

        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-wide">Profile</h1>

          {isOwner ? (
            <Link
              href="/profile/edit"
              className="px-5 py-2 rounded-xl bg-[var(--gold-primary)] text-black font-bold hover:bg-[var(--gold-light)] transition"
            >
              ✏️ Edit Profile
            </Link>
          ) : (
            <>
              {isFollowing ? (
                <button
                  onClick={unfollow}
                  className="px-5 py-2 rounded-xl bg-red-500 text-black font-bold hover:bg-red-400"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={follow}
                  className="px-5 py-2 rounded-xl bg-[var(--gold-primary)] text-black font-bold hover:bg-[var(--gold-light)]"
                >
                  Follow
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border border-[var(--gold-primary)] flex items-center justify-center text-3xl font-bold">
            {data.username ? data.username.charAt(0).toUpperCase() : "?"}
          </div>

          <div>
            <p className="text-2xl font-semibold">{data.username || "No Username"}</p>
            <p className="text-sm opacity-70">Joined on {displayJoined()}</p>
          </div>
        </div>

        <div className="flex gap-10 text-center mt-4">
          <div className="flex flex-col bg-[var(--dark-base)]/30 px-5 py-3 rounded-xl border border-[rgba(var(--gold-primary-rgb),0.2)] w-32">
            <span className="text-2xl font-bold text-[var(--gold-primary)]">{followersCount}</span>
            <span className="opacity-70 text-sm">Followers</span>
          </div>

          <div className="flex flex-col bg-[var(--dark-base)]/30 px-5 py-3 rounded-xl border border-[rgba(var(--gold-primary-rgb),0.2)] w-32">
            <span className="text-2xl font-bold text-[var(--gold-primary)]">{followingCount}</span>
            <span className="opacity-70 text-sm">Following</span>
          </div>
        </div>

        <div className="space-y-4 text-lg leading-relaxed">

          <div className="flex items-center gap-3">
            <Image src="/age.png" width={20} height={20} alt="age icon" />
            Age: <span className="text-[var(--gold-primary)]">{data.age || "N/A"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Image src="/gender.png" width={20} height={20} alt="gender icon" />
            Gender: <span className="text-[var(--gold-primary)]">{data.gender || "N/A"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Image src="/location.png" width={20} height={20} alt="location icon" />
            Location: <span className="text-[var(--gold-primary)]">{data.location || "N/A"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Image src="/bio.png" width={20} height={20} alt="bio icon" />
            Bio: <span className="text-[var(--gold-primary)]">{data.bio || "No bio added"}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
