"use client";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../../firebase";
import { doc, updateDoc, getDoc, Firestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");

  const load = async () => {
    if (!user || !db) return;
    const ref = doc(db as Firestore, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data: any = snap.data();
      setUsername(data.username || "");
      setAge(data.age || "");
      setBio(data.bio || "");
      setLocation(data.location || "");
      setGender(data.gender || "");
    }
  };

  const save = async () => {
    if (!user || !db) return;
    if (!username.trim()) {
      alert("Username is required");
      return;
    }

    const ref = doc(db as Firestore, "users", user.uid);
    await updateDoc(ref, { username, age, bio, location, gender });
    router.push("/profile");
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen bg-dark-base text-foreground flex items-center justify-center text-xl">
        Login required
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-(--gold-primary) py-20 px-6 flex justify-center">
      <div className="w-full max-w-lg bg-black/40 border border-(--gold-primary)/20 rounded-2xl p-8 shadow-xl space-y-6">
        
        <h2 className="text-4xl font-extrabold text-center text-(--gold-primary) mb-6 tracking-wide">
          Edit Profile
        </h2>

        {/* Username */}
        <input
          className="w-full bg-zinc-900 border border-(--gold-primary)/20 rounded-xl px-4 py-3 text-lg outline-none focus:border-(--gold-primary)"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Age */}
        <input
          className="w-full bg-zinc-900 border border-(--gold-primary)/20 rounded-xl px-4 py-3 text-lg outline-none focus:border-(--gold-primary)"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        {/* Location */}
        <input
          className="w-full bg-zinc-900 border border-(--gold-primary)/20 rounded-xl px-4 py-3 text-lg outline-none focus:border-(--gold-primary)"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {/* Gender */}
        <label htmlFor="gender-select" className="sr-only">
          Gender
        </label>
        <select
          id="gender-select"
          aria-label="Gender"
          className="w-full bg-zinc-900 border border-(--gold-primary)/20 rounded-xl px-4 py-3 text-lg outline-none focus:border-(--gold-primary)"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="Male">♂️ Male</option>
          <option value="Female">♀️ Female</option>
          <option value="Other">⚧ Other</option>
        </select>

        {/* Bio */}
        <textarea
          className="w-full bg-zinc-900 border border-(--gold-primary)/20 rounded-xl px-4 py-3 min-h-25 text-lg outline-none focus:border-(--gold-primary)"
          placeholder="Write your Bio..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        {/* Save Button */}
        <button
          onClick={save}
          className="w-full mt-3 bg-(--gold-primary) hover:bg-(--gold-light) text-black font-bold py-3 rounded-xl text-lg tracking-wide transition"
        >
          Save Changes
        </button>

        {/* Cancel */}
        <button
          onClick={() => router.push("/profile")}
          className="w-full border border-(--gold-primary) text-(--gold-primary) py-3 rounded-xl text-lg hover:bg-(--gold-primary)/10 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
