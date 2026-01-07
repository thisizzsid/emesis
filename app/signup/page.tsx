"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
  const { signupWithEmail, googleLogin, user } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

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

  const register = async () => {
    setError("");

    if (!email || !pass || !confirm) {
      setError("All fields are required.");
      return;
    }

    if (pass !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signupWithEmail(email, pass);
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Signup error");
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
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 text-sm"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 text-sm"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 text-sm"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
            />
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={register}
              className="modern-btn w-full py-3 bg-linear-to-r from-[#F5C26B] to-[#F4BC4B] text-black rounded-xl font-semibold shadow-lg shadow-[#F5C26B]/30 hover:shadow-xl hover:shadow-[#F5C26B]/40 active:scale-[0.98] transition-all duration-300 text-sm"
            >
              Create Account
            </button>
            <button
              onClick={googleLogin}
              className="modern-btn w-full py-3 border-[1.5px] border-[#F5C26B]/30 text-[#F5C26B] rounded-xl font-semibold hover:bg-[#F5C26B]/10 active:scale-[0.98] transition-all duration-300 backdrop-blur-sm text-sm"
            >
              Continue with Google
            </button>
          </div>

          <div className="flex justify-center mt-6 text-xs text-zinc-400 gap-1 font-medium">
            <span>Already have an account?</span>
            <button
              onClick={() => router.push("/login")}
              className="text-[#F5C26B] hover:text-[#FFD56A] transition-colors duration-300 font-semibold"
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
              type="password"
              placeholder="Password"
              className="w-full mb-4 px-4 py-3.5 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full mb-6 px-4 py-3.5 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
            />

            <button
              onClick={register}
              className="modern-btn w-full py-3.5 bg-linear-to-r from-[#F5C26B] to-[#F4BC4B] text-black rounded-xl font-semibold shadow-lg shadow-[#F5C26B]/30 hover:shadow-xl hover:shadow-[#F5C26B]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Create Account
            </button>

            <button
              onClick={googleLogin}
              className="modern-btn w-full mt-4 py-3.5 border-[1.5px] border-[#F5C26B]/30 text-[#F5C26B] rounded-xl font-semibold hover:border-[#F5C26B]/50 hover:bg-[#F5C26B]/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 backdrop-blur-sm"
            >
              Continue with Google
            </button>

            <div className="flex justify-center mt-7 text-sm text-zinc-400 gap-1 font-medium">
              <span>Already have an account?</span>
              <button
                onClick={() => router.push("/login")}
                className="hover:text-[#F5C26B] transition-colors duration-300 font-semibold"
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
