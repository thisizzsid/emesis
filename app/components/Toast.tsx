"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "border-[#F5C26B] text-[#F5C26B] shadow-[#F5C26B]/20",
    error: "border-red-500 text-red-500 shadow-red-500/20",
    info: "border-blue-500 text-blue-500 shadow-blue-500/20",
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slideInUp`}>
      <div className={`glass px-6 py-3 rounded-xl border ${colors[type]} shadow-lg flex items-center gap-3 backdrop-blur-xl bg-black/80`}>
        <span className="text-xl">
          {type === "success" && "✨"}
          {type === "error" && "⚠️"}
          {type === "info" && "ℹ️"}
        </span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
