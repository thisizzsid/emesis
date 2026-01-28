"use client";

import { useRouter } from "next/navigation";
import { Reveal, TiltCard, ShimmerButton, GlowBackground } from "../components/PageEffects";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-linear-to-br from-[#0A0A0A] via-black to-[#0A0A0A] text-white flex flex-col font-sans">
      <GlowBackground />
      
      {/* Header */}
      <div className="relative pt-6 pb-12 px-4 md:px-6">
        <div className="absolute inset-0 bg-linear-to-b from-(--gold-primary)/5 to-transparent"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Reveal>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-(--gold-primary) hover:text-(--gold-light) mb-8 transition-colors px-4 py-2 rounded-full border border-(--gold-primary)/20 hover:border-(--gold-primary)/40 bg-white/5 hover:bg-white/10 backdrop-blur-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          </Reveal>

          <Reveal className="opacity-0">
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-linear-to-r from-(--gold-primary) via-white to-(--gold-light) bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(245,194,107,0.3)]">
              About Emesis
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              The next generation of social connection.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Mission Section */}
          <Reveal>
            <TiltCard className="glass border border-(--gold-primary)/30 rounded-2xl p-6 md:p-8 bg-white/4 backdrop-blur-xl">
              <div className="flex items-start gap-4 mb-2 md:mb-6">
                <div className="text-4xl">🎯</div>
                <div>
                  <h2 className="text-2xl font-bold text-(--gold-primary) mb-3 font-mono">Core_Directive</h2>
                  <p className="text-zinc-400 leading-relaxed">
                    EMESIS is engineered to execute a global social handshake. We are refactoring the way humans connect,
                    deprecating superficial interactions in favor of deep, authentic data exchange.
                    Our runtime environment is optimized for safety, inclusivity, and meaningful signal-to-noise ratio.
                  </p>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          {/* Founder Section */}
          <Reveal>
            <TiltCard className="glass border border-(--gold-primary)/30 rounded-2xl p-6 md:p-8 bg-white/4 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-(--gold-primary) mb-8 flex items-center gap-3 font-mono">
                <span className="text-3xl">👨‍💻</span>
                sudo user: root
              </h2>

              <div className="space-y-6">
                {/* Founder Card */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Avatar */}
                  <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-linear-to-br from-(--gold-primary)/30 to-(--gold-light)/30 flex items-center justify-center border border-(--gold-primary)/20">
                    <span className="text-4xl md:text-6xl">⚡</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">Mr X</h3>
                    <p className="text-(--gold-primary) font-mono text-sm mb-4">Lead Architect & CEO</p>
                    <p className="text-zinc-400 leading-relaxed mb-4">
                      Sid is a full-stack visionary with a recursive passion for digital transformation.
                      Compiling years of development experience into a single executable vision, he deployed EMESIS
                      to patch the vulnerabilities in modern social connectivity.
                    </p>
                    <div className="space-y-2 text-sm text-zinc-400 font-mono">
                      <p><span className="text-(--gold-primary)">var focus =</span> ["Social Innovation", "UX/UI", "Scalable Arch"];</p>
                      <p><span className="text-(--gold-primary)">const vision =</span> "Connect(people) -&gt; meaningful_bond";</p>
                      <p><span className="text-(--gold-primary)">return</span> "Tech should empower, not divide";</p>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          {/* Values Section */}
          <Reveal>
            <TiltCard className="glass border border-(--gold-primary)/30 rounded-2xl p-6 md:p-8 bg-white/4 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-(--gold-primary) mb-8 flex items-center gap-3 font-mono">
                <span className="text-3xl">💎</span>
                System_Invariants
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: "🔒", title: "Encryption", desc: "Your data is obfuscated. Privacy is hardcoded." },
                  { icon: "🤝", title: "Handshake", desc: "Establishing secure connections between nodes." },
                  { icon: "🚀", title: "Velocity", desc: "Continuous deployment of new features." },
                  { icon: "✨", title: "Source", desc: "Authenticity is the only valid input." },
                  { icon: "🌍", title: "Global_Scope", desc: "Accessible to all instances, everywhere." },
                  { icon: "⚡", title: "Performance", desc: "Optimized for low latency and high quality." },
                ].map((value, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-linear-to-br from-(--gold-primary)/10 to-(--gold-light)/10 border border-(--gold-primary)/20 hover:border-(--gold-primary)/50 transition-all duration-300 group"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{value.icon}</div>
                    <h3 className="font-bold text-white mb-2 font-mono">{value.title}</h3>
                    <p className="text-sm text-zinc-400">{value.desc}</p>
                  </div>
                ))}
              </div>
            </TiltCard>
          </Reveal>

          {/* Technology Section */}
          <Reveal>
            <TiltCard className="glass border border-(--gold-primary)/30 rounded-2xl p-6 md:p-8 bg-white/4 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-(--gold-primary) mb-6 flex items-center gap-3 font-mono">
                <span className="text-3xl">⚙️</span>
                Dependencies & Stack
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs md:text-sm">
                {["Next.js 14", "React Server Components", "TypeScript 5", "Firebase v10", "Tailwind CSS v4", "Gemini AI API"].map((tech, idx) => (
                  <div
                    key={idx}
                    className="p-4 text-center rounded-lg bg-linear-to-br from-(--gold-primary)/5 to-(--gold-light)/5 border border-(--gold-primary)/20 hover:border-(--gold-primary)/50 transition-all cursor-default"
                  >
                    <p className="text-zinc-300 font-semibold">{tech}</p>
                  </div>
                ))}
              </div>
            </TiltCard>
          </Reveal>

          {/* Join Us CTA */}
          <Reveal>
            <TiltCard className="glass border border-(--gold-primary)/20 rounded-2xl p-8 md:p-12 text-center bg-white/4 backdrop-blur-xl">
              <h3 className="text-2xl md:text-3xl font-bold text-(--gold-primary) mb-4 font-mono">
                &gt; git checkout -b new-journey
              </h3>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Initialize your session. Connect with the main branch of humanity.
              </p>
              <ShimmerButton onClick={() => router.push('/feed')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Execute_Launch()</span>
              </ShimmerButton>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
