"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

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
    <div className="relative w-full h-screen overflow-hidden select-none bg-gradient-to-br from-black via-[#0A0A0A] to-black">
      {/* BG CANVAS */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-40" />

      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-sm z-[5]" />

      <div className="relative z-[10] flex h-full overflow-hidden">
        {/* LEFT INFO */}
        <div className="hidden md:flex w-1/2 flex-col justify-center px-20 bg-gradient-to-br from-black/50 via-[#0A0A0A]/40 to-black/60 backdrop-blur-xl border-r border-[#F5C26B]/10">
          <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-clip-text text-transparent">Join EMESIS</h1>
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
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text mb-8 text-center tracking-tight">
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
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full mb-4 px-4 py-3.5 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40"
              onChange={(e) => setPass(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full mb-6 px-4 py-3.5 rounded-xl bg-black/40 border-[1.5px] border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40"
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              onClick={register}
              className="modern-btn w-full py-3.5 bg-gradient-to-r from-[#F5C26B] to-[#F4BC4B] text-black rounded-xl font-semibold shadow-lg shadow-[#F5C26B]/30 hover:shadow-xl hover:shadow-[#F5C26B]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
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
