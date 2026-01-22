"use client";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
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
    if (!user) return;
    const ref = doc(db, "users", user.uid);
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
    if (!user) return;
    if (!username.trim()) {
      alert("Username is required");
      return;
    }

    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, { username, age, bio, location, gender });
    router.push("/profile");
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F5C26B] flex items-center justify-center text-xl">
        Login required
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5C26B] py-20 px-6 flex justify-center">
      <div className="w-full max-w-lg bg-black/50 border border-[#F4BC4B] rounded-2xl p-8 shadow-xl space-y-6">
        
        <h2 className="text-4xl font-extrabold text-center text-[#F5C26B] mb-6 tracking-wide">
          Edit Profile
        </h2>

        {/* Username */}
        <input
          className="w-full bg-zinc-900 border border-[#F4BC4B] rounded-xl px-4 py-3 text-lg outline-none focus:border-[#F5C26B]"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Age */}
        <input
          className="w-full bg-zinc-900 border border-[#F4BC4B] rounded-xl px-4 py-3 text-lg outline-none focus:border-[#F5C26B]"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        {/* Location */}
        <input
          className="w-full bg-zinc-900 border border-[#F4BC4B] rounded-xl px-4 py-3 text-lg outline-none focus:border-[#F5C26B]"
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
          className="w-full bg-zinc-900 border border-[#F4BC4B] rounded-xl px-4 py-3 text-lg outline-none focus:border-[#F5C26B]"
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
          className="w-full bg-zinc-900 border border-[#F4BC4B] rounded-xl px-4 py-3 min-h-25 text-lg outline-none focus:border-[#F5C26B]"
          placeholder="Write your Bio..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        {/* Save Button */}
        <button
          onClick={save}
          className="w-full mt-3 bg-[#F5C26B] hover:bg-[#F4BC4B] text-black font-bold py-3 rounded-xl text-lg tracking-wide transition"
        >
          Save Changes
        </button>

        {/* Cancel */}
        <button
          onClick={() => router.push("/profile")}
          className="w-full border border-[#F5C26B] text-[#F5C26B] py-3 rounded-xl text-lg hover:bg-[#F5C26B]/10 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
