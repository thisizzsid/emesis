"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, Clock } from "lucide-react";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export function MessageStatusIcon({ status }: { status: MessageStatus }) {
  return (
    <div className="flex items-center justify-center">
      {status === "sending" && <Clock className="w-3 h-3 text-zinc-500 animate-pulse" />}
      {status === "sent" && <Check className="w-3 h-3 text-zinc-500" />}
      {status === "delivered" && <CheckCheck className="w-3 h-3 text-zinc-500" />}
      {status === "read" && <CheckCheck className="w-3 h-3 text-blue-500" />}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-2 bg-zinc-900/50 rounded-2xl w-fit border border-white/5">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
        className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
        className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
        className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
      />
    </div>
  );
}
