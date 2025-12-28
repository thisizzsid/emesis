"use client";
import { useState } from "react";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");

  const save = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, {
      username,
      gender,
      age,
      location,
    });
    router.push("/feed");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-[#F5C26B] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#F5C26B]/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00F0FF]/5 rounded-full blur-3xl animate-float animation-delay-2000"></div>

      <div className="w-full max-w-2xl glass rounded-3xl p-8 md:p-12 border-2 border-[#F5C26B]/30 shadow-2xl relative z-10">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5C26B] to-[#FFD56A] flex items-center justify-center shadow-2xl shadow-[#F5C26B]/50 animate-pulse-glow mx-auto mb-4">
            <span className="text-3xl">🇮🇳</span>
          </div>
          <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text mb-3">
            Welcome to EMESIS
          </h2>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-4">
            A <strong className="text-[#F5C26B]">100% FREE</strong> platform for authentic expression and connection.
            Made with ❤️ in India by a team dedicated to creating safe spaces for everyone.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5C26B]/10 border border-[#F5C26B]/30">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-[#F5C26B]">Free Forever • No Hidden Charges</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-[#F5C26B] mb-6 text-center">
          Complete Your Profile
        </h3>

        <div className="space-y-4">
          <input
            className="w-full p-4 bg-black/60 border-2 border-[#F5C26B]/30 rounded-xl text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 font-medium"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full p-4 bg-black/60 border-2 border-[#F5C26B]/30 rounded-xl text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 font-medium"
            placeholder="Gender (Optional)"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
          <input
            className="w-full p-4 bg-black/60 border-2 border-[#F5C26B]/30 rounded-xl text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 font-medium"
            placeholder="Age (Optional)"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <input
            className="w-full p-4 bg-black/60 border-2 border-[#F5C26B]/30 rounded-xl text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 font-medium"
            placeholder="Location (Optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button
          onClick={save}
          className="w-full mt-6 bg-gradient-to-r from-[#F5C26B] to-[#FFD56A] text-black py-4 rounded-2xl font-bold shadow-xl shadow-[#F5C26B]/30 hover:shadow-2xl hover:shadow-[#F5C26B]/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Save & Continue to Feed
        </button>

        <p className="text-center text-zinc-600 text-xs mt-4">
          Your privacy is our priority. All data is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
