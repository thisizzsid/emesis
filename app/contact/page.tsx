"use client";
import { useState } from "react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");

  const send = async () => {
    setStatus("Sending...");

    const req = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({ email, message: msg }),
    });

    const res = await req.json();

    if (res.success) {
      setStatus("Message sent! We will reply soon.");
      setEmail("");
      setMsg("");
    } else {
      setStatus("Failed — try again later.");
    }
  };

  return (
    <div
      className="
        min-h-screen w-full flex items-center justify-center 
        bg-[#0D0D0D] text-[#F5C26B] px-6 py-16
      "
    >
      {/* CARD */}
      <div
        className="
          relative max-w-xl w-full bg-black/50 border border-[#F4BC4B]/30 
          backdrop-blur-xl rounded-2xl shadow-2xl px-10 py-12
        "
      >
        {/* Neon Border Animation */}
        <div className="absolute -inset-0.5 bg-linear-to-r from-yellow-600 via-yellow-300 to-yellow-600 rounded-2xl blur opacity-20 animate-pulse" />

        <h1 className="relative z-10 text-5xl font-black tracking-wider mb-4 text-center text-[#F5C26B]">
          Contact Us
        </h1>

        <p className="relative z-10 text-center text-[#F4BC4B]/90 text-sm tracking-wide mb-10">
          We respond within 24 hours — support, complaints, feedback, anything.
        </p>

        {/* INPUTS */}
        <div className="relative z-10">
          <input
            type="email"
            placeholder="Your Email"
            className="
              w-full mb-4 px-4 py-3 bg-zinc-900/70 border border-zinc-700 
              rounded-lg text-[#F4BC4B] placeholder-zinc-500 tracking-wide
              focus:outline-none focus:border-[#F5C26B]
            "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            placeholder="Write your message..."
            className="
              w-full px-4 py-4 min-h-35 bg-zinc-900/70 border border-zinc-700 
              rounded-lg text-[#F4BC4B] placeholder-zinc-500 tracking-wide
              focus:outline-none focus:border-[#F5C26B]
            "
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />

          {/* BUTTON */}
          <button
            type="button"
            onClick={send}
            className="
              shockwave-btn mt-6 w-full py-3 rounded-lg bg-[#F5C26B] 
              text-black font-semibold tracking-wider transition
            "
          >
            Send Message
          </button>

          {/* STATUS */}
          <p className="text-xs mt-4 opacity-75">{status}</p>
        </div>
      </div>

      {/* Shockwave Button Style */}
      <style>{`
        .shockwave-btn {
          position: relative;
          overflow: hidden;
        }
        .shockwave-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%);
          opacity: 0;
          transform: scale(0.4);
          transition: transform .45s ease, opacity .45s ease;
        }
        .shockwave-btn:hover::after {
          opacity: 1;
          transform: scale(3.5);
        }
      `}</style>
    </div>
  );
}
