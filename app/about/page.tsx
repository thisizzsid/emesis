"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={
        `${className} transition-all duration-700 ease-out will-change-transform ` +
        (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")
      }
    >
      {children}
    </div>
  );
}

function TiltCard({
  children,
  className = "",
  tilt = 10,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -tilt;
    const ry = (px - 0.5) * tilt;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(1000px)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={
        `transition-transform duration-200 ease-out will-change-transform ${className}`
      }
    >
      {children}
    </div>
  );
}

function ShimmerButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden isolate group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black bg-linear-to-r from-(--gold-primary) to-(--gold-light) shadow-2xl shadow-[rgba(var(--gold-primary-rgb),0.3)] transition-transform duration-200 active:scale-95 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute -inset-1 rounded-xl bg-[radial-gradient(150px_50px_at_var(--x,0%)_-20%,rgba(255,255,255,0.35),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
    </button>
  );
}

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-white flex flex-col">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* soft radial glows */}
        <div className="absolute -inset-[20%] opacity-60 mask-[linear-gradient(to_bottom,black,transparent_75%)] bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(var(--gold-primary-rgb),0.10),transparent_70%),radial-gradient(40%_30%_at_80%_40%,rgba(var(--gold-light-rgb),0.08),transparent_70%),radial-gradient(30%_25%_at_15%_60%,rgba(var(--gold-primary-rgb),0.06),transparent_70%)]" />
        {/* subtle scanlines */}
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.12)_95%)] bg-size-[100%_8px]" />
        {/* highlight ring */}
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] rounded-full blur-3xl bg-[rgba(var(--gold-primary-rgb),0.1)]" />
      </div>
      {/* Header */}
      <div className="relative pt-6 pb-12 px-4 md:px-6">
        <div className="absolute inset-0 bg-linear-to-b from-[rgba(var(--gold-primary-rgb),0.05)] to-transparent"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Reveal>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-(--gold-primary) hover:text-(--gold-light) mb-6 transition-colors px-3 py-1.5 rounded-lg border border-[rgba(var(--gold-primary-rgb),0.2)] hover:border-[rgba(var(--gold-primary-rgb),0.4)] bg-white/0 hover:bg-white/5 backdrop-blur-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </Reveal>

          <Reveal className="opacity-0">
            <h1 className="relative inline-block text-4xl md:text-5xl font-black mb-4 bg-linear-to-r from-(--gold-primary) to-(--gold-light) bg-clip-text text-transparent">
              About EMESIS
              <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-px bg-linear-to-r from-transparent via-[rgba(var(--gold-primary-rgb),0.5)] to-transparent" />
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Building the future of social connectivity, one innovation at a time.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Mission Section */}
          <Reveal>
            <TiltCard className="glass border border-[rgba(var(--gold-primary-rgb),0.3)] rounded-2xl p-6 md:p-8 bg-white/4 backdrop-blur-xl">
              <div className="flex items-start gap-4 mb-2 md:mb-6">
                <div className="text-4xl">🎯</div>
                <div>
                  <h2 className="text-2xl font-bold text-(--gold-primary) mb-3">Our Mission</h2>
                  <p className="text-zinc-400 leading-relaxed">
                    EMESIS is dedicated to creating a global social platform where meaningful connections thrive.
                    We believe in empowering users with tools to express themselves authentically, discover new communities,
                    and build lasting relationships in a safe and inclusive environment.
                  </p>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          {/* Founder Section */}
          <Reveal>
            <TiltCard className="glass border border-[rgba(var(--gold-primary-rgb),0.3)] rounded-2xl p-6 md:p-8 bg-white/4 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-(--gold-primary) mb-8 flex items-center gap-3">
                <span className="text-3xl">👨‍💼</span>
                Meet Our Founder
              </h2>

              <div className="space-y-6">
                {/* Founder Card */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Avatar */}
                  <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-linear-to-br from-[rgba(var(--gold-primary-rgb),0.3)] to-[rgba(var(--gold-light-rgb),0.3)] flex items-center justify-center">
                    <span className="text-6xl">✨</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Mr X</h3>
                    <p className="text-(--gold-primary) font-semibold mb-4">Founder & CEO</p>
                    <p className="text-zinc-400 leading-relaxed mb-4">
                      Siddharth is a passionate innovator and visionary entrepreneur with a deep commitment to creating transformative digital experiences.
                      With a background in full-stack development and a keen eye for user experience, he founded EMESIS to revolutionize how people connect online.
                    </p>
                    <div className="space-y-2 text-sm text-zinc-400">
                      <p><span className="text-(--gold-primary) font-semibold">Focus Areas:</span> Social Innovation, User Experience, Full-Stack Development</p>
                      <p><span className="text-(--gold-primary) font-semibold">Vision:</span> Building platforms that bring people closer together</p>
                      <p><span className="text-(--gold-primary) font-semibold">Philosophy:</span> "Technology should empower, not divide"</p>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          {/* Values Section */}
          <Reveal>
            <TiltCard className="glass border border-[rgba(var(--gold-primary-rgb),0.3)] rounded-2xl p-6 md:p-8 bg-white/4 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-(--gold-primary) mb-8 flex items-center gap-3">
                <span className="text-3xl">💎</span>
                Our Core Values
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: "🔒", title: "Privacy First", desc: "Your data is sacred. We respect and protect your privacy." },
                  { icon: "🤝", title: "Community", desc: "Building genuine connections between diverse individuals." },
                  { icon: "🚀", title: "Innovation", desc: "Constantly pushing boundaries to create better experiences." },
                  { icon: "✨", title: "Authenticity", desc: "Encouraging real, meaningful self-expression." },
                  { icon: "🌍", title: "Inclusivity", desc: "A space for everyone, regardless of background." },
                  { icon: "⚡", title: "Excellence", desc: "Committed to the highest standards of quality." },
                ].map((value, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-linear-to-br from-[rgba(var(--gold-primary-rgb),0.1)] to-[rgba(var(--gold-light-rgb),0.1)] border border-[rgba(var(--gold-primary-rgb),0.2)] hover:border-[rgba(var(--gold-primary-rgb),0.5)] transition-all duration-300"
                  >
                    <div className="text-3xl mb-3">{value.icon}</div>
                    <h3 className="font-bold text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-zinc-400">{value.desc}</p>
                  </div>
                ))}
              </div>
            </TiltCard>
          </Reveal>

          {/* Technology Section */}
          <Reveal>
            <TiltCard className="glass border border-[rgba(var(--gold-primary-rgb),0.3)] rounded-2xl p-6 md:p-8 bg-white/4 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-(--gold-primary) mb-6 flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                Built With Modern Technology
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["Next.js", "React", "TypeScript", "Firebase", "Tailwind CSS", "Google Gemini AI"].map((tech, idx) => (
                  <div
                    key={idx}
                    className="p-4 text-center rounded-lg bg-linear-to-br from-[rgba(var(--gold-primary-rgb),0.05)] to-[rgba(var(--gold-light-rgb),0.05)] border border-[rgba(var(--gold-primary-rgb),0.2)] hover:border-[rgba(var(--gold-primary-rgb),0.5)] transition-all"
                  >
                    <p className="text-zinc-300 font-semibold text-sm">{tech}</p>
                  </div>
                ))}
              </div>
            </TiltCard>
          </Reveal>

          {/* Join Us CTA */}
          <Reveal>
            <TiltCard className="glass border border-[rgba(var(--gold-primary-rgb),0.2)] rounded-2xl p-8 md:p-12 text-center bg-white/4 backdrop-blur-xl">
              <h3 className="text-2xl md:text-3xl font-bold text-(--gold-primary) mb-4">
                Join the EMESIS Community
              </h3>
              <p className="text-zinc-400 mb-8">
                Be part of something bigger. Connect, share, and grow with millions of users worldwide.
              </p>
              <ShimmerButton onClick={() => (window.location.href = '/feed')}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H2.75A1.25 1.25 0 001.5 2.75v14.5A1.25 1.25 0 002.75 18.5h14.5a1.25 1.25 0 001.25-1.25V9.5M18.5 1.5v9m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                Explore Feed
              </ShimmerButton>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
