"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const { signupWithEmail, googleLogin, user } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) router.push("/feed");
  }, [user, router]);

  // BG
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    function size() {
      if (c) {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
      }
    }
    size();
    window.addEventListener("resize", size);

    const count = 120;
    const particles: any[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 2 + 0.4,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
      });
    }

    function draw() {
      if (!ctx || !c) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(255,200,90,.85)";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x <= 0 || p.x >= c.width) p.dx *= -1;
        if (p.y <= 0 || p.y >= c.height) p.dy *= -1;
      }
      requestAnimationFrame(draw);
    }
    draw();
    return () => window.removeEventListener("resize", size);
  }, []);

  const scorePassword = (p: string) => {
    let s = 0;
    if (p.length >= 8) s += 25;
    if (/[A-Z]/.test(p)) s += 20;
    if (/[a-z]/.test(p)) s += 20;
    if (/[0-9]/.test(p)) s += 20;
    if (/[^A-Za-z0-9]/.test(p)) s += 15;
    return Math.min(100, s);
  };

  useEffect(() => {
    setStrength(scorePassword(pass));
    try {
      document.documentElement.style.setProperty("--progress-width", `${strength}%`);
    } catch {}
  }, [pass, strength]);

  const register = async () => {
    setError("");
    setLoading(true);

    if (!email || !pass || !confirm || !username) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (pass !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3-20 chars, letters/numbers/_ only.");
      setLoading(false);
      return;
    }

    try {
      await signupWithEmail(email, pass);
      if (user?.uid) {
        const ref = doc(db, "users", user.uid);
        await setDoc(ref, { username }, { merge: true });
      }
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Signup error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full relative select-none bg-linear-to-br from-black via-[#0A0A0A] to-black will-change-transform gpu-layer">
      {/* BG CANVAS */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-linear-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-sm z-5 pointer-events-none" />

      {/* MOBILE LAYOUT - Unified Single View */}
      <div className="md:hidden relative z-10 flex flex-col min-h-dvh justify-center px-4 py-6 pb-20">
        {/* Branding Header - Compact */}
        <div className="flex flex-col items-center mb-8 animate-slideInDown">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#F5C26B] to-[#FFD56A] flex items-center justify-center shadow-2xl shadow-[#F5C26B]/50 animate-pulse-glow overflow-hidden mb-4">
            <Image src="/logoemesis.png" alt="EMESIS Logo" width={56} height={56} className="w-full h-full object-cover" priority />
          </div>
          <h1 className="text-4xl font-black tracking-tighter bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-clip-text text-transparent font-[Orbitron] mb-2">EMESIS</h1>
          <p className="text-[#F5C26B] text-xs font-light tracking-widest uppercase neon-glow">Free Your Mind</p>
        </div>

        {/* Signup Form Card */}
        <div className="w-full max-w-sm mx-auto glass rounded-3xl shadow-2xl p-6 animate-slideInUp border border-[#F5C26B]/20 relative overflow-hidden">
          <h2 className="text-2xl font-bold text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text mb-6 text-center tracking-tight">
            Create Account
          </h2>

          {error && (
            <div className="text-red-400 text-center text-xs mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="sr-only" htmlFor="signup-email">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 text-sm"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              id="signup-email"
              aria-label="Email"
            />
            <label className="sr-only" htmlFor="signup-username">Username</label>
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 text-sm"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              id="signup-username"
              aria-label="Username"
            />
            <div className="relative">
              <label className="sr-only" htmlFor="signup-password">Password</label>
              <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 text-sm"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
              id="signup-password"
              aria-label="Password"
            />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5C26B]/60">
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                </svg>
              </button>
              <div className="mt-2 progress-bar">
                <div className="progress-bar-fill" />
              </div>
            </div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 text-sm"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
              id="signup-confirm"
              aria-label="Confirm Password"
            />
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={register}
              disabled={loading}
              className="modern-btn w-full py-3 bg-linear-to-r from-[#F5C26B] to-[#F4BC4B] text-black rounded-xl font-semibold shadow-lg shadow-[#F5C26B]/30 hover:shadow-xl hover:shadow-[#F5C26B]/40 active:scale-[0.98] transition-all duration-300 text-sm disabled:opacity-50"
              type="button"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
            <button
              onClick={googleLogin}
              className="modern-btn w-full py-3 border-[1.5px] border-[#F5C26B]/30 text-[#F5C26B] rounded-xl font-semibold hover:bg-[#F5C26B]/10 active:scale-[0.98] transition-all duration-300 backdrop-blur-sm text-sm"
              type="button"
            >
              Continue with Google
            </button>
          </div>

          <div className="flex justify-center mt-6 text-xs text-zinc-400 gap-1 font-medium">
            <span>Already have an account?</span>
            <button
              onClick={() => router.push("/login")}
              className="text-[#F5C26B] hover:text-[#FFD56A] transition-colors duration-300 font-semibold"
              type="button"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT - Split View */}
      <div className="hidden md:flex relative z-10 w-full h-full overflow-hidden">
        {/* LEFT INFO */}
        <div className="w-1/2 flex flex-col justify-center px-20 bg-linear-to-br from-black/50 via-[#0A0A0A]/40 to-black/60 backdrop-blur-xl border-r border-[#F5C26B]/10">
          <h1 className="text-7xl font-black tracking-tighter bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-clip-text text-transparent">Join EMESIS</h1>
          <p className="mt-6 text-zinc-300 text-lg max-w-md leading-relaxed font-light tracking-tight">
            A quiet space to release thoughts you can't say out loud.
          </p>
          <p className="mt-2 text-sm text-[#F5C26B] font-medium">
            No judgement. Just honesty.
          </p>
        </div>

        {/* RIGHT FORM CARD */}
        <div className="flex flex-1 items-center justify-center px-6 md:px-12">
          <div className="w-full max-w-sm glass rounded-3xl shadow-2xl p-10 border border-[#F5C26B]/20">
            <h2 className="text-3xl font-bold text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text mb-8 text-center tracking-tight">
              Create Account
            </h2>

            {error && (
              <div className="text-red-400 text-center text-sm mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 font-medium">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              className="w-full mb-4 px-4 py-3.5 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />

            <input
              type="text"
              placeholder="Username"
              className="w-full mb-4 px-4 py-3.5 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />

            <div className="relative mb-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full mb-4 px-4 py-3.5 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
            />
            <div className="mt-2 progress-bar">
              <div className="progress-bar-fill" />
            </div>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full mb-6 px-4 py-3.5 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
            />

            <button
              onClick={register}
              disabled={loading}
              className="modern-btn w-full py-3.5 bg-linear-to-r from-[#F5C26B] to-[#F4BC4B] text-black rounded-xl font-semibold shadow-lg shadow-[#F5C26B]/30 hover:shadow-xl hover:shadow-[#F5C26B]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              type="button"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <button
              onClick={googleLogin}
              className="modern-btn w-full mt-4 py-3.5 border-[1.5px] border-[#F5C26B]/30 text-[#F5C26B] rounded-xl font-semibold hover:border-[#F5C26B]/50 hover:bg-[#F5C26B]/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 backdrop-blur-sm"
              type="button"
            >
              Continue with Google
            </button>

            <div className="flex justify-center mt-7 text-sm text-zinc-400 gap-1 font-medium">
              <span>Already have an account?</span>
            <button
              onClick={() => router.push("/login")}
              className="hover:text-[#F5C26B] transition-colors duration-300 font-semibold"
              type="button"
            >
              Login
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
