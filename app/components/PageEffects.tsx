"use client";

import { useEffect, useRef, useState } from "react";

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
      { threshold: 0.1 }
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

export function TiltCard({
  children,
  className = "",
  tilt = 5,
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
    const refEl = ref.current;
    if (refEl) refEl.style.transform = "perspective(1000px)";
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

export function ShimmerButton({ children, onClick, className = "", type = "button" }: { children: React.ReactNode; onClick?: () => void; className?: string; type?: "button" | "submit" | "reset" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`relative overflow-hidden isolate group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-black bg-linear-to-r from-(--gold-primary) to-(--gold-light) shadow-2xl shadow-(--gold-primary)/30 transition-transform duration-200 active:scale-95 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute -inset-1 rounded-xl bg-[radial-gradient(150px_50px_at_var(--x,0%)_-20%,rgba(255,255,255,0.35),transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
    </button>
  );
}

export function GlowBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* soft radial glows */}
        <div className="absolute -inset-[20%] opacity-60 mask-[linear-gradient(to_bottom,black,transparent_75%)] bg-[radial-gradient(60%_40%_at_50%_-10%,color-mix(in_srgb,var(--gold-primary),transparent_90%),transparent_70%),radial-gradient(40%_30%_at_80%_40%,color-mix(in_srgb,var(--gold-light),transparent_92%),transparent_70%),radial-gradient(30%_25%_at_15%_60%,color-mix(in_srgb,var(--gold-primary),transparent_94%),transparent_70%)]" />
        {/* subtle scanlines */}
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.12)_95%)] bg-size-[100%_8px]" />
        {/* highlight ring */}
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] rounded-full blur-3xl bg-(--gold-primary)/10" />
    </div>
  );
}
