"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkProfile = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      setLoading(false);
      return;
    }

    const data = snap.data();
    if (data.username && data.username.trim() !== "") {
      router.push("/feed");
    } else {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    if (!username.trim()) {
      setError("Username required");
      return;
    }

    if (!age.trim() || isNaN(Number(age))) {
      setError("Valid Age required");
      return;
    }

    if (!gender) {
      setError("Gender required");
      return;
    }

    setError("");

    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, {
      username,
      age,
      gender,
      bio,
      location,
    });

    router.push("/feed");
  };

  useEffect(() => {
    checkProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-yellow-300">
        Login required
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-yellow-300">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-300 p-8">
      <h1 className="text-4xl text-yellow-400 font-bold mb-6">
        Complete Your Profile
      </h1>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-lg p-6 space-y-4 shadow-md">
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        <input
          className="bg-zinc-800 p-3 rounded w-full"
          placeholder="Username (required)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="bg-zinc-800 p-3 rounded w-full"
          placeholder="Age (required)"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <select
          className="bg-zinc-800 p-3 rounded w-full"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender (required)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          className="bg-zinc-800 p-3 rounded w-full"
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <textarea
          className="bg-zinc-800 p-3 rounded w-full"
          placeholder="Short bio (optional)"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <button
          onClick={saveProfile}
          className="w-full bg-yellow-400 text-black font-semibold py-3 rounded"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
