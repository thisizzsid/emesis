"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { googleLogin, loginWithEmail, resetPassword, user } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) router.push("/feed");
  }, [user, router]);

  // Advanced Particle System with Connections
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

    const particles: any[] = [];
    const count = 150;
    const mouse = { x: -1000, y: -1000 };
    
    // Create particles - REDUCED for performance
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        color: `rgba(245, ${Math.random() * 50 + 150}, ${Math.random() * 50 + 75}, ${Math.random() * 0.4 + 0.3})`
      });
    }

    // Mouse tracking with debounce
    let lastMouseX = -1000;
    let lastMouseY = -1000;
    c.addEventListener("mousemove", (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    c.addEventListener("mouseleave", () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    let frameCount = 0;
    function draw() {
      if (!ctx || !c) return;
      ctx.clearRect(0, 0, c.width, c.height);
      
      // Reduce connection calculation frequency
      if (frameCount % 2 === 0) {
        ctx.strokeStyle = "rgba(245, 194, 107, 0.1)";
        ctx.lineWidth = 1;
        
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < 22500) { // 150^2 - avoid sqrt
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              const dist = Math.sqrt(distSq);
              ctx.globalAlpha = (1 - dist / 150) * 0.4;
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
      }
      
      // Draw particles
      for (const p of particles) {
        // Simplified mouse interaction - only within 150px
        const mdx = lastMouseX - p.x;
        const mdy = lastMouseY - p.y;
        const mdistSq = mdx * mdx + mdy * mdy;
        
        if (mdistSq < 40000) { // 200^2
          const mdist = Math.sqrt(mdistSq);
          p.x -= mdx / mdist * 1.5;
          p.y -= mdy / mdist * 1.5;
        }
        
        // Draw particle without shadow (performance)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Move particle
        p.x += p.dx;
        p.y += p.dy;
        
        // Bounce off edges
        if (p.x <= 0 || p.x >= c.width) p.dx *= -1;
        if (p.y <= 0 || p.y >= c.height) p.dy *= -1;
      }
      
      frameCount++;
      requestAnimationFrame(draw);
    }
    draw();

    return () => window.removeEventListener("resize", size);
  }, []);

  const handleReset = () => {
    if (!email.trim()) return alert("Enter your email first");
    resetPassword(email);
  };

  const handleLogin = async () => {
    setLoading(true);
    await loginWithEmail(email, password);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await googleLogin();
    setLoading(false);
  };

  return (
    /* eslint-disable-next-line react/no-danger */
    <div className="w-full min-h-full relative select-none bg-linear-to-br from-black via-[#0A0A0A] to-black will-change-transform gpu-layer">
      {/* Advanced Particle Background */}
      {/* eslint-disable-next-line react/no-danger */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-50 will-change-auto gpu-layer" />
      
      {/* Gradient Overlay */}
      {/* eslint-disable-next-line react/no-danger */}
      <div className="fixed inset-0 bg-linear-to-br from-black/85 via-black/70 to-black/85 backdrop-blur-[2px] z-5 will-change-auto gpu-layer" />

      {/* Animated Orbs */}
      {/* eslint-disable-next-line react/no-danger */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-[#F5C26B]/20 rounded-full blur-3xl animate-float z-6 will-change-transform gpu-layer"></div>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-3xl animate-float animation-delay-2000 z-6 will-change-transform gpu-layer"></div>
      
      {/* Desktop: Side-by-side layout */}
      {/* eslint-disable-next-line react/no-danger */}
      <div className="hidden md:flex fixed inset-0 z-10 h-full w-full gpu-layer">
        {/* LEFT SIDE - BRANDING */}
        {/* eslint-disable-next-line react/no-danger */}
        <div className="w-1/2 flex flex-col justify-center px-20 bg-linear-to-br from-black/60 via-[#0A0A0A]/50 to-black/70 backdrop-blur-2xl border-r border-[#F5C26B]/20 relative overflow-hidden will-change-auto gpu-soft">
          {/* Decorative Grid */}
          {/* eslint-disable-next-line react/no-danger */}
          <div className="absolute inset-0 opacity-10 bg-brand-grid will-change-auto gpu-layer"></div>
          
          <div className="relative z-10 animate-slideInLeft">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#F5C26B] to-[#FFD56A] flex items-center justify-center shadow-2xl shadow-[#F5C26B]/50 animate-pulse-glow overflow-hidden">
                <Image 
                  src="/logoemesis.png" 
                  alt="EMESIS Logo" 
                  width={64} 
                  height={64}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="h-16 w-1 bg-linear-to-b from-[#F5C26B] to-transparent"></div>
            </div>
            
            <h1 className="text-8xl font-black tracking-tighter bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-clip-text text-transparent font-[Orbitron] bg-size-[200%_auto] animate-textShine mb-3">
              EMESIS
            </h1>
            
            <p className="text-2xl font-light text-[#F5C26B] mb-2 tracking-tight neon-glow">
              Free Your Mind
            </p>
            
            <p className="mt-4 text-zinc-400 text-lg max-w-lg leading-relaxed font-light tracking-tight">
              A sanctuary for authentic expression. Confess, connect, and heal in a judgment-free space powered by empathy and understanding.
            </p>
            
            <div className="mt-12 space-y-4">
              <FeatureItem icon="🔒" text="End-to-end encrypted confessions" />
              <FeatureItem icon="💬" text="AI-powered emotional support" />
              <FeatureItem icon="🌐" text="Global community of listeners" />
              <FeatureItem icon="✨" text="100% anonymous, zero judgment" />
              <FeatureItem icon="🎯" text="Personalized healing journey" />
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6">
              <StatBadge number="50K+" label="Active Users" />
              <StatBadge number="2M+" label="Confessions" />
              <StatBadge number="99.9%" label="Privacy Rate" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM (Desktop) */}
        {/* eslint-disable-next-line react/no-danger */}
        <div className="hidden md:flex flex-1 items-center justify-center px-12 relative h-full w-full gpu-layer">
          {/* eslint-disable-next-line react/no-danger */}
          <div className="w-full max-w-md glass rounded-3xl shadow-2xl p-12 animate-slideInRight border-2 border-[#F5C26B]/30 relative overflow-hidden group hover:border-[#F5C26B]/50 transition-all duration-300 will-change-transform gpu-layer">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text mb-3 text-center tracking-tight">
                Welcome Back
              </h2>
              <p className="text-center text-zinc-500 text-sm mb-6 font-light">
                Continue your journey of self-discovery
              </p>

              {/* Offer + provenance */}
              <div className="mb-6 rounded-xl bg-black/30 border border-[#F5C26B]/25 px-4 py-3 text-xs text-zinc-200 leading-relaxed">
                <p className="font-semibold text-[#F5C26B]">Limited-time: Free access</p>
                <p className="mt-1">After the free period, subscription is ₹9,999 (INR) to unlock all Pro features.</p>
                <p className="mt-1 text-[#FFD56A]">Crafted in France, made in India.</p>
              </div>

              {/* Email Input */}
              <div className="mb-5 relative group">
                <label className="block text-xs font-semibold text-[#F5C26B] mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-5 py-4 rounded-xl bg-black/50 border-2 border-[#F5C26B]/25 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 font-medium"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5C26B]/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-6 relative group">
                <label className="block text-xs font-semibold text-[#F5C26B] mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-xl bg-black/50 border-2 border-[#F5C26B]/25 text-[#F5C26B] focus:border-[#F5C26B] transition-all duration-300 placeholder:text-[#F5C26B]/40 font-medium"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5C26B]/60 hover:text-[#F5C26B] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="modern-btn w-full py-4 bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-size-[200%_auto] text-black font-bold rounded-xl shadow-xl shadow-[#F5C26B]/40 hover:shadow-2xl hover:shadow-[#F5C26B]/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Login to EMESIS"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-linear-to-r from-transparent to-[#F5C26B]/30"></div>
                <span className="text-xs text-zinc-600 font-semibold uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-linear-to-l from-transparent to-[#F5C26B]/30"></div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                aria-label="Continue with Google"
                className="relative w-full py-4 rounded-xl border-2 border-[#F5C26B]/40 text-[#F5C26B] font-semibold flex items-center justify-center gap-3 transition-all duration-500 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed group hover:border-[#F5C26B]/80 hover:bg-black/30 hover:shadow-lg hover:shadow-[#F5C26B]/20 active:scale-[0.98] overflow-hidden"
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-[#F5C26B]/10 to-transparent"></span>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    <span className="tracking-wide">Connecting to Google…</span>
                  </div>
                ) : (
                  <>
                    <img src="/google.png" alt="Google Icon" className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-105" />
                    <span className="tracking-wide">Continue with Google</span>
                  </>
                )}
                {loading && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] animate-pulse"></span>
                )}
              </button>

              {/* Bottom Links */}
              <div className="flex justify-between mt-8 text-sm text-zinc-500 font-medium">
                <button
                  onClick={() => router.push("/signup")}
                  className="hover:text-[#F5C26B] transition-colors duration-300 underline-offset-4 hover:underline"
                >
                  Create Account
                </button>

                <button
                  onClick={handleReset}
                  className="hover:text-[#FFD56A] transition-colors duration-300 underline-offset-4 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secured with 256-bit encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT - Unified Single View */}
      <div className="md:hidden relative z-10 flex flex-col min-h-dvh justify-center px-4 py-6 pb-20">
        
        {/* Branding Header - Compact */}
        <div className="flex flex-col items-center mb-8 animate-slideInDown">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#F5C26B] to-[#FFD56A] flex items-center justify-center shadow-2xl shadow-[#F5C26B]/50 animate-pulse-glow overflow-hidden mb-4">
            <Image 
              src="/logoemesis.png" 
              alt="EMESIS Logo" 
              width={56} 
              height={56}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-4xl font-black tracking-tighter bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-clip-text text-transparent font-[Orbitron] mb-2">
            EMESIS
          </h1>
          <p className="text-[#F5C26B] text-xs font-light tracking-widest uppercase neon-glow">
            Free Your Mind
          </p>
        </div>

        {/* Login Form Card */}
        <div className="w-full max-w-sm mx-auto glass rounded-3xl shadow-2xl p-6 animate-slideInUp border border-[#F5C26B]/20 relative overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 shimmer opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text mb-2 text-center tracking-tight">
                Welcome Back
              </h2>
              
              <div className="mb-5 mt-4 rounded-xl bg-black/40 border border-[#F5C26B]/20 px-3 py-2 text-[10px] text-zinc-300 leading-relaxed text-center">
                <span className="text-[#F5C26B] font-bold">Limited Offer: </span> Free Access
              </div>

              {/* Email Input */}
              <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all placeholder:text-[#F5C26B]/30 font-medium text-sm outline-none"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  />
              </div>

              {/* Password Input */}
              <div className="mb-5 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-[#F5C26B]/20 text-[#F5C26B] focus:border-[#F5C26B] transition-all placeholder:text-[#F5C26B]/30 font-medium text-sm outline-none"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5C26B]/60"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="modern-btn w-full py-3 bg-linear-to-r from-[#F5C26B] to-[#FFD56A] text-black rounded-xl font-bold shadow-lg shadow-[#F5C26B]/30 active:scale-[0.98] transition-all text-sm"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#F5C26B]/20"></div>
                <span className="text-[10px] text-[#F5C26B]/50 uppercase">Or</span>
                <div className="flex-1 h-px bg-[#F5C26B]/20"></div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                aria-label="Continue with Google"
                className="relative w-full py-3 border border-[#F5C26B]/30 text-[#F5C26B] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-sm backdrop-blur-sm hover:bg-black/30 hover:border-[#F5C26B]/70 hover:shadow-lg hover:shadow-[#F5C26B]/20 active:scale-[0.98] overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-[#F5C26B]/10 to-transparent"></span>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span className="tracking-wide">Connecting…</span>
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] animate-pulse"></span>
                  </>
                ) : (
                  <>
                    <img src="/google.png" alt="Google" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-105" />
                    <span className="tracking-wide">Continue with Google</span>
                  </>
                )}
              </button>

              {/* Links */}
              <div className="flex justify-between mt-6 text-xs text-zinc-400">
                <button onClick={() => router.push("/signup")} className="hover:text-[#F5C26B]">Create Account</button>
                <button onClick={handleReset} className="hover:text-[#F5C26B]">Forgot Password?</button>
              </div>
            </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes textShine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

// Feature Item Component
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#F5C26B]/20 to-[#F5C26B]/5 flex items-center justify-center border border-[#F5C26B]/20 group-hover:border-[#F5C26B]/40 transition-all duration-300 group-hover:scale-110">
        <span className="text-lg">{icon}</span>
      </div>
      <span className="text-[#F5C26B] text-sm font-medium group-hover:text-[#FFD56A] transition-colors duration-300">{text}</span>
    </div>
  );
}

// Stat Badge Component
function StatBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center hover-card border border-[#F5C26B]/20">
      <div className="text-2xl font-black text-transparent bg-linear-to-r from-[#F5C26B] to-[#FFD56A] bg-clip-text mb-1">{number}</div>
      <div className="text-xs text-zinc-600 font-medium">{label}</div>
    </div>
  );
}
