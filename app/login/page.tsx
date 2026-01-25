"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingOverlay from "../components/LoadingOverlay";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";

export default function LoginPage() {
  const { googleLogin, loginWithEmail, resetPassword, user } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
        setLoading(true);
        setTimeout(() => router.push("/feed"), 800);
    }
  }, [user, router]);

  // Particle System
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const style = getComputedStyle(document.documentElement);
    const goldPrimaryRgb = style.getPropertyValue('--gold-primary-rgb').trim() || "245, 194, 107";

    const particles: any[] = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        color: `rgba(${goldPrimaryRgb},`
      });
    }

    function draw() {
      if (!ctx || !c) return;
      ctx.clearRect(0, 0, c.width, c.height);
      
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.opacity})`;
        ctx.fill();
        
        p.x += p.dx;
        p.y += p.dy;
        
        if (p.x < 0 || p.x > c.width) p.dx *= -1;
        if (p.y < 0 || p.y > c.height) p.dy *= -1;
      }
      requestAnimationFrame(draw);
    }
    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  const handleReset = () => {
    if (!email.trim()) return alert("Enter your email first");
    resetPassword(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
        await loginWithEmail(email, password);
    } catch (e: any) {
        console.error(e);
        setLoading(false);
        if (e.code === 'auth/unauthorized-domain') {
          setError("Domain not authorized. Add to Firebase Console.");
        } else if (e.code === 'auth/too-many-requests') {
          setError("Too many attempts. Please wait.");
        } else {
          setError(e.message || "Login failed");
        }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
        await googleLogin();
    } catch (e: any) {
        console.error(e);
        setLoading(false);
        setError(e.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-dvh w-full relative flex items-center justify-center overflow-hidden bg-(--background) selection:bg-(--gold-primary) selection:text-black">
      <LoadingOverlay isLoading={loading} />
      
      {/* Background Elements */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/80 z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--gold-primary-rgb),0.05),transparent_70%)] pointer-events-none" />
      
      {/* Main Card */}
      <div className={`relative z-10 w-full max-w-md p-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="glass-card rounded-3xl border border-(--glass-border) shadow-[0_0_50px_-10px_rgba(var(--gold-primary-rgb),0.1)] p-8 md:p-10 backdrop-blur-2xl bg-(--glass-bg) relative overflow-hidden group">
          
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-(--gold-primary) to-transparent opacity-50" />
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-(--gold-primary) blur-xl opacity-20 rounded-full"></div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-(--dark-card) to-black border border-(--glass-border) flex items-center justify-center shadow-xl relative z-10">
                <Image 
                  src="/logoemesis.png" 
                  alt="Emesis Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-(--gold-primary) via-(--gold-light) to-(--gold-primary) bg-clip-text text-transparent tracking-wider font-[Orbitron] mb-2 bg-size-200 animate-textShine">
              EMESIS
            </h1>
            <p className="text-(--gold-primary)/80 text-lg font-medium mb-1">Welcome Back</p>
            <p className="text-zinc-400 text-sm">Enter your credentials to access your realm</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-fadeIn flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-(--gold-primary) transition-colors duration-300" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-(--dark-card)/50 border border-(--glass-border) text-(--gold-primary) placeholder:text-zinc-600 focus:border-(--gold-primary)/50 focus:ring-1 focus:ring-(--gold-primary)/50 focus:bg-(--dark-card) outline-none transition-all duration-300"
                      required
                    />
                </div>
                
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-(--gold-primary) transition-colors duration-300" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-xl bg-(--dark-card)/50 border border-(--glass-border) text-(--gold-primary) placeholder:text-zinc-600 focus:border-(--gold-primary)/50 focus:ring-1 focus:ring-(--gold-primary)/50 focus:bg-(--dark-card) outline-none transition-all duration-300"
                      required
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-(--gold-primary) transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-medium text-zinc-400 hover:text-(--gold-primary) transition-colors hover:underline decoration-(--gold-primary)/30 underline-offset-4"
                >
                    Forgot password?
                </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-(--gold-primary) to-(--gold-light) text-black font-bold text-base hover:shadow-[0_0_30px_rgba(var(--gold-primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn relative overflow-hidden"
            >
              <span className="relative z-10">{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-xl" />
            </button>
          </form>

          <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-(--glass-border)"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="px-4 bg-(--glass-bg) text-zinc-500 font-medium">Or continue with</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 group/google"
          >
            <div className="p-0.5 bg-white rounded-full">
               <Image src="/google.png" alt="Google" width={18} height={18} className="object-contain" />
            </div>
            <span>Sign in with Google</span>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/google:opacity-100 group-hover/google:translate-x-0 transition-all duration-300 text-zinc-400" />
          </button>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-(--gold-primary) font-bold hover:text-(--gold-light) hover:underline decoration-(--gold-primary)/50 underline-offset-4 transition-all">
                Sign up
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
