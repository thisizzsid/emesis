"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal, TiltCard, ShimmerButton, GlowBackground } from "../components/PageEffects";

export default function ContactPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");

  const send = async () => {
    setStatus(">>> Pinging server...");

    try {
      const req = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({ email, message: msg }),
      });

      const res = await req.json();

      if (res.success) {
        setStatus(">>> Packet sent successfully. Awaiting ACK.");
        setEmail("");
        setMsg("");
      } else {
        setStatus(">>> Error: Connection reset by peer.");
      }
    } catch (e) {
      setStatus(">>> Fatal Error: Network unreachable.");
    }
  };

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
              Contact Us
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Get in touch with our team.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 pb-8 flex items-center justify-center">
        <div className="max-w-xl w-full">
          <Reveal>
            <TiltCard className="glass border border-(--gold-primary)/30 rounded-2xl p-8 md:p-10 bg-white/4 backdrop-blur-xl relative overflow-hidden">
              {/* Decorative terminal header */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-900/50 border-b border-zinc-800 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                 <div className="ml-4 text-xs font-mono text-zinc-500">root@emesis:~</div>
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-(--gold-primary) mb-2 font-mono">Open_Ticket()</h2>
                <p className="text-zinc-400 text-sm mb-8">
                  Report bugs, request features, or submit feedback logs.
                </p>

                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-xs font-mono text-(--gold-primary) mb-2 ml-1">var user_email =</label>
                    <input
                      type="email"
                      placeholder="Enter your email..."
                      className="w-full bg-black/40 border border-zinc-800 focus:border-(--gold-primary) rounded-lg px-4 py-3 text-white placeholder-zinc-600 font-mono transition-colors outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-mono text-(--gold-primary) mb-2 ml-1">const payload =</label>
                    <textarea
                      placeholder="Write your message..."
                      className="w-full bg-black/40 border border-zinc-800 focus:border-(--gold-primary) rounded-lg px-4 py-3 text-white placeholder-zinc-600 font-mono transition-colors outline-none min-h-32 resize-none"
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                    />
                  </div>

                  <ShimmerButton onClick={send} className="w-full">
                    <span>transmit_data()</span>
                  </ShimmerButton>

                  {status && (
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded font-mono text-xs text-(--gold-light) animate-pulse">
                      {status}
                    </div>
                  )}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
