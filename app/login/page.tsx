"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingOverlay from "../components/LoadingOverlay";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, User } from "lucide-react";
import { db, auth } from "../../firebase";
import { doc, setDoc, Firestore } from "firebase/firestore";

export default function LoginPage() {
  const { googleLogin, loginWithEmail, signupWithEmail, resetPassword, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signup") setMode("signup");
  }, [searchParams]);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        if (mode === "signup") {
            if (!email || !password || !confirm || !username) {
                throw new Error("All fields are required.");
            }
            if (password !== confirm) {
                throw new Error("Passwords do not match.");
            }
            await signupWithEmail(email, password);
            
            // Create user document with username
            // Using auth.currentUser because context user might not be updated yet
            if (auth?.currentUser && db) {
                 const ref = doc(db as Firestore, "users", auth.currentUser.uid);
                 await setDoc(ref, { username }, { merge: true });
            }
        } else {
            await loginWithEmail(email, password);
        }
    } catch (e: any) {
        console.error(e);
        setLoading(false);
        if (e.code === 'auth/unauthorized-domain') {
          setError("Domain not authorized. Add to Firebase Console.");
        } else if (e.code === 'auth/too-many-requests') {
          setError("Too many attempts. Please wait.");
        } else if (e.code === 'auth/email-already-in-use') {
          setError("Email already in use.");
        } else if (e.code === 'auth/weak-password') {
          setError("Password should be at least 6 characters.");
        } else {
          setError(e.message || "Authentication failed");
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
    <div className="min-h-dvh w-full relative flex items-center justify-center bg-[var(--background)] selection:bg-[var(--gold-primary)] selection:text-black py-10">
      <LoadingOverlay isLoading={loading} />
      
      {/* Background Elements */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/80 z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--gold-primary-rgb),0.05),transparent_70%)] pointer-events-none" />
      
      {/* Main Card */}
      <div className={`relative z-10 w-full max-w-md p-4 md:p-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="glass-card rounded-3xl border border-[var(--glass-border)] shadow-[0_0_50px_-10px_rgba(var(--gold-primary-rgb),0.1)] p-6 md:p-10 backdrop-blur-2xl bg-[var(--glass-bg)] relative overflow-hidden group">
          
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold-primary)] to-transparent opacity-50" />
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-[var(--gold-primary)] blur-xl opacity-20 rounded-full"></div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--dark-card)] to-black border border-[var(--glass-border)] flex items-center justify-center shadow-xl relative z-10">
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
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--gold-primary)] via-[var(--gold-light)] to-[var(--gold-primary)] bg-clip-text text-transparent tracking-wider font-[Orbitron] mb-2 bg-size-200 animate-textShine">
              EMESIS
            </h1>
            <p className="text-[var(--gold-primary)]/80 text-lg font-medium mb-1">
                {mode === 'login' ? 'Welcome Back' : 'Join the Realm'}
            </p>
            <p className="text-zinc-400 text-sm">
                {mode === 'login' ? 'Enter your credentials to access' : 'Create your account today'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-white/5 rounded-xl mb-8 relative border border-white/5">
            <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-[var(--gold-primary)] rounded-lg transition-all duration-300 shadow-lg ${
                    mode === 'login' ? 'left-1' : 'left-[calc(50%+4px)]'
                }`} 
            />
            <button 
                onClick={() => setMode('login')} 
                className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${
                    mode === 'login' ? 'text-black' : 'text-zinc-400 hover:text-white'
                }`}
            >
                Log In
            </button>
            <button 
                onClick={() => setMode('signup')} 
                className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${
                    mode === 'signup' ? 'text-black' : 'text-zinc-400 hover:text-white'
                }`}
            >
                Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-fadeIn flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Username Field - Only for Signup */}
            {mode === 'signup' && (
                <div className="relative group animate-fadeIn">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-[var(--gold-primary)] transition-colors duration-300" />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--dark-card)]/50 border border-[var(--glass-border)] text-[var(--gold-primary)] placeholder:text-zinc-600 focus:border-[var(--gold-primary)]/50 focus:ring-1 focus:ring-[var(--gold-primary)]/50 focus:bg-[var(--dark-card)] outline-none transition-all duration-300"
                        required={mode === 'signup'}
                    />
                </div>
            )}

            <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-[var(--gold-primary)] transition-colors duration-300" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--dark-card)]/50 border border-[var(--glass-border)] text-[var(--gold-primary)] placeholder:text-zinc-600 focus:border-[var(--gold-primary)]/50 focus:ring-1 focus:ring-[var(--gold-primary)]/50 focus:bg-[var(--dark-card)] outline-none transition-all duration-300"
                  required
                />
            </div>
            
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-[var(--gold-primary)] transition-colors duration-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === 'signup' ? "Create a password" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-[var(--dark-card)]/50 border border-[var(--glass-border)] text-[var(--gold-primary)] placeholder:text-zinc-600 focus:border-[var(--gold-primary)]/50 focus:ring-1 focus:ring-[var(--gold-primary)]/50 focus:bg-[var(--dark-card)] outline-none transition-all duration-300"
                  required
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[var(--gold-primary)] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>

            {/* Confirm Password - Only for Signup */}
            {mode === 'signup' && (
                <div className="relative group animate-fadeIn">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-[var(--gold-primary)] transition-colors duration-300" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--dark-card)]/50 border border-[var(--glass-border)] text-[var(--gold-primary)] placeholder:text-zinc-600 focus:border-[var(--gold-primary)]/50 focus:ring-1 focus:ring-[var(--gold-primary)]/50 focus:bg-[var(--dark-card)] outline-none transition-all duration-300"
                        required={mode === 'signup'}
                    />
                </div>
            )}

            {mode === 'login' && (
                <div className="flex justify-end pt-2">
                    <button 
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-medium text-zinc-400 hover:text-[var(--gold-primary)] transition-colors hover:underline decoration-[var(--gold-primary)]/30 underline-offset-4"
                    >
                        Forgot password?
                    </button>
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-light)] text-black font-bold text-base hover:shadow-[0_0_30px_rgba(var(--gold-primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn relative overflow-hidden mt-4"
            >
              <span className="relative z-10">
                {loading ? (mode === 'login' ? "Signing in..." : "Creating Account...") : (mode === 'login' ? "Sign In" : "Sign Up")}
              </span>
              {!loading && <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-xl" />
            </button>
          </form>

          <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--glass-border)]"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="px-4 bg-[var(--glass-bg)] text-zinc-500 font-medium">Or continue with</span></div>
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
            <span>{mode === 'login' ? "Sign in with Google" : "Sign up with Google"}</span>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/google:opacity-100 group-hover/google:translate-x-0 transition-all duration-300 text-zinc-400" />
          </button>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm mb-6">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[var(--gold-primary)] font-bold hover:text-[var(--gold-light)] hover:underline decoration-[var(--gold-primary)]/50 underline-offset-4 transition-all"
              >
                {mode === 'login' ? "Sign up" : "Log in"}
              </button>
            </p>

            <div className="flex items-center justify-center gap-2 text-green-500 font-medium text-xs opacity-90">
              <ShieldCheck className="w-4 h-4" />
              <span className="tracking-wide uppercase">End-to-end Encrypted</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}