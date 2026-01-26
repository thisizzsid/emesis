"use client";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  where,
  updateDoc,
  doc,
  Firestore,
} from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, Users } from "lucide-react";
import Toast from "../../components/Toast";

export default function ChatRoom({ params }: { params: any }) {
  const { user, logout } = useAuth();
  const [id, setId] = useState<string>("");
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const bottomRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize/resume audio context after user interaction (autoplay policy)
  useEffect(() => {
    const unlock = () => {
      try {
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
      } catch {}
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const playPing = () => {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = audioCtxRef.current || new Ctx();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") {
        // Will resume on next user interaction
        return;
      }
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  useEffect(() => {
    if (params && typeof params.then === "function") {
      params.then((p: any) => setId(p?.id ?? ""));
    } else {
      setId(params?.id ?? "");
    }
  }, [params]);

  const partnerUid =
    user && id
      ? id.startsWith(user.uid + "_")
        ? id.substring(user.uid.length + 1)
        : id.endsWith("_" + user.uid)
        ? id.substring(0, id.length - user.uid.length - 1)
        : null
      : null;

  // Load chat partner profile
  const loadPartner = async () => {
    if (!partnerUid || !db) return;
    const q = query(collection(db as Firestore, "users"), where("uid", "==", partnerUid));
    const snap = await getDocs(q);
    if (!snap.empty) setOtherUser(snap.docs[0].data());
  };

  const send = async () => {
    if (!user || !text.trim() || !id || !db) return;
    setSending(true);
    const messageText = text; // Capture text for AI
    try {
      await addDoc(collection(db as Firestore, `chats/${id}/messages`), {
        uid: user.uid,
        text,
        createdAt: Timestamp.now(),
        reactions: [],
      });
      setText("");

      // AI Response Logic
      if (partnerUid === "ai") {
        setIsTyping(true);
        try {
          const res = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: messageText, mode: "chat" }),
          });
          const data = await res.json();
          if (data.output) {
            await addDoc(collection(db as Firestore, `chats/${id}/messages`), {
              uid: "ai",
              text: data.output,
              createdAt: Timestamp.now(),
              reactions: [],
            });
          }
        } catch (err) {
          console.error("AI Chat Error:", err);
          setToast({ message: "AI failed to respond. Please try again.", type: "error" });
        } finally {
          setIsTyping(false);
        }
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setToast({ message: "Failed to send message. Please check your connection.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  // Add reaction to message
  const addReaction = async (messageId: string, emoji: string) => {
    if (!user || !id || !db) return;
    const messageRef = doc(db as Firestore, `chats/${id}/messages`, messageId);
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
      const reactions = message.reactions || [];
      const existingReaction = reactions.find((r: any) => r.uid === user.uid);
      
      if (existingReaction) {
        // Update existing reaction
        const updatedReactions = reactions.map((r: any) => 
          r.uid === user.uid ? { ...r, emoji } : r
        );
        await updateDoc(messageRef, { reactions: updatedReactions });
      } else {
        // Add new reaction
        await updateDoc(messageRef, { 
          reactions: [...reactions, { uid: user.uid, emoji }] 
        });
      }
    }
    
    setShowReactions(null);
  };

  // Handle typing indicator
  const handleTyping = () => {
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Listen for messages
  useEffect(() => {
    if (!id || !user || !db) return;
    
    const q = query(
      collection(db as Firestore, `chats/${id}/messages`),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setMessages(arr);

      // Play a subtle ping for new incoming messages (not from me)
      const latest = arr[arr.length - 1];
      if (!latest) return;
      const prevId = lastMessageIdRef.current;
      lastMessageIdRef.current = latest.id;
      if (!prevId) return; // first load: don't play
      if (latest.id !== prevId && latest.uid !== user.uid && !document.hidden) {
        playPing();
      }
    }, (error) => {
       console.error("Chat snapshot error:", error);
       if (error.code === 'permission-denied') {
          setToast({ message: "Access denied. Check your permissions.", type: "error" });
       } else if (error.code === 'failed-precondition') {
          setToast({ message: "System configuration error. Check console.", type: "error" });
       } else {
          setToast({ message: "Connection lost. Reconnecting...", type: "error" });
       }
     });
    return () => unsub();
  }, [id, user]);

  useEffect(() => {
    loadPartner();
  }, [partnerUid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user)
    return (
      <div className="h-screen bg-linear-to-br from-(--dark-base) via-(--dark-base) to-(--dark-base) text-(--gold-primary) flex items-center justify-center">
        <div className="glass rounded-3xl p-12 animate-bounceIn">
          <p className="text-2xl font-bold">Login Required</p>
        </div>
      </div>
    );

  return (
    <div data-theme={theme} className="relative flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)] min-h-[calc(100vh-5rem)] bg-linear-to-br from-(--dark-base) via-(--dark-base) to-(--dark-base) text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[rgba(var(--gold-primary-rgb),0.1)] rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-(--neon-blue)/5 rounded-full blur-3xl animate-float animation-delay-2000"></div>

      <div className="glass border-b border-[rgba(var(--gold-primary-rgb),0.2)] backdrop-blur-3xl px-4 md:px-6 py-2 md:py-2.5 flex items-center gap-3 md:gap-5 shadow-2xl relative z-10 shrink-0">
        <button
          type="button"
          onClick={() => router.push("/chat")}
          className="alert-btn relative group"
          aria-label="Back to chats"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="alert-btn relative group"
          aria-label="Toggle participants sidebar"
        >
          <Users className="w-4.5 h-4.5" />
        </button>
        
        {/* User Avatar & Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-(--gold-primary) to-(--gold-light) flex items-center justify-center shadow-lg shadow-[rgba(var(--gold-primary-rgb),0.5)] font-bold text-black text-lg">
              {otherUser?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
          </div>
          
          <div>
            <p className="font-bold text-xl text-(--gold-primary)">
              {otherUser?.username || "User"}
            </p>
            <p className="text-xs text-zinc-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Online • {messages.length} messages
            </p>
          </div>
        </div>


      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative z-10 grid grid-cols-1 md:grid-cols-[280px_1fr]">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-black/95 backdrop-blur-xl border-r border-[rgba(var(--gold-primary-rgb),0.1)] transition-transform duration-300 md:relative md:block md:w-auto md:bg-transparent md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"}`}>
          <div className="h-full p-4 space-y-4 pt-20 md:pt-4">
            <div className="flex items-center justify-between md:hidden mb-4">
              <span className="text-lg font-bold text-(--gold-primary)">Participants</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-zinc-400" aria-label="Close sidebar">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-(--gold-primary)"></span>
              Participants
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-linear-to-br from-(--gold-primary) to-(--gold-light) text-black font-bold flex items-center justify-center shrink-0">
                {user?.displayName?.[0]?.toUpperCase() || "Y"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-(--gold-primary) font-semibold truncate">
                  {user?.displayName || "You"}
                </div>
                <div className="text-xs text-zinc-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`relative w-12 h-12 rounded-full font-bold flex items-center justify-center shrink-0 ${
                otherUser?.isBot
                  ? "bg-linear-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50"
                  : "bg-linear-to-br from-(--gold-primary) to-(--gold-light) text-black"
              }`}>
                {otherUser?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-(--gold-primary) font-semibold truncate">
                  {otherUser?.username || "User"}
                </div>
                <div className="text-xs text-zinc-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </div>
              </div>
            </div>
          </div>
        </aside>
        <div className="min-h-0 overflow-y-auto px-2 md:px-6 py-4 md:py-6 pb-24 space-y-4 md:space-y-6">
        {messages.map((m, index) => {
          const mine = m.uid === user.uid;
          const showTime = index === 0 || 
            (messages[index - 1]?.createdAt?.seconds && 
             m.createdAt?.seconds && 
             m.createdAt.seconds - messages[index - 1].createdAt.seconds > 300);

          return (
            <div key={m.id} className="animate-fadeIn">
              {showTime && (
                <div className="flex justify-center mb-4">
                  <span className="text-xs text-zinc-600 bg-(--dark-base)/40 px-4 py-2 rounded-full border border-[rgba(var(--gold-primary-rgb),0.2)]">
                    {m.createdAt?.seconds
                      ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              )}

              <div className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] sm:max-w-[70%] group">
                  <div
                    className={`
                      relative px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-300
                      ${mine 
                        ? "bg-linear-to-br from-(--gold-primary) to-(--gold-light) text-black rounded-br-md hover:shadow-2xl hover:shadow-[rgba(var(--gold-primary-rgb),0.5)]" 
                        : "glass border border-[rgba(var(--gold-primary-rgb),0.2)] text-(--gold-primary) rounded-bl-md hover:border-[rgba(var(--gold-primary-rgb),0.4)]"}
                    `}
                  >
                    <div className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap">
                      {m.text}
                    </div>

                    <div className={`text-[10px] mt-2 text-right ${mine ? "text-(--dark-base)/60" : "text-zinc-600"} font-semibold`}>
                      {m.createdAt?.seconds
                        ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>

                    {m.reactions && m.reactions.length > 0 && (
                      <div className="absolute -bottom-3 right-4 flex gap-1">
                        {Array.from(new Set(m.reactions.map((r: any) => r.emoji))).map((emoji: any) => {
                          const count = m.reactions.filter((r: any) => r.emoji === emoji).length;
                          return (
                            <div
                              key={emoji}
                              className="bg-(--dark-base)/80 border border-[rgba(var(--gold-primary-rgb),0.3)] rounded-full px-2 py-0.5 text-xs flex items-center gap-1 shadow-lg"
                            >
                              <span>{emoji}</span>
                              <span className="text-(--gold-primary) font-bold">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setShowReactions(showReactions === m.id ? null : m.id)}
                      className="text-xs text-zinc-600 hover:text-(--gold-primary) transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                    >
                      <span>😊</span>
                      <span>React</span>
                    </button>

                    {showReactions === m.id && (
                      <div className="absolute left-0 mt-2 glass rounded-2xl p-3 shadow-2xl border border-[rgba(var(--gold-primary-rgb),0.3)] flex gap-2 animate-bounceIn z-50">
                        {["❤️", "👍", "😂", "😮", "😢", "🔥", "✨", "🎉"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => addReaction(m.id, emoji)}
                            className="text-2xl hover:scale-125 transition-transform duration-200 hover:rotate-12"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="glass rounded-2xl px-6 py-4 border border-[rgba(var(--gold-primary-rgb),0.2)]">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
        </div>
      </div>

      <div className="glass border-t border-[rgba(var(--gold-primary-rgb),0.2)] backdrop-blur-3xl px-2 md:px-6 py-2 md:py-2.5 flex gap-2 md:gap-4 shadow-2xl relative z-20 shrink-0">
        <button className="alert-btn relative group shrink-0" aria-label="Add emoji" type="button">
          <span className="text-lg md:text-xl group-hover:scale-125 transition-transform">😊</span>
        </button>

        <div className="flex-1 relative min-w-0">
          <input
            className="w-full bg-black/60 px-3 md:px-6 py-2 md:py-3 rounded-2xl text-(--gold-primary) border-2 border-[rgba(var(--gold-primary-rgb),0.3)] focus:border-(--gold-primary) outline-none placeholder-zinc-600 font-medium transition-all duration-300 focus:shadow-lg focus:shadow-[rgba(var(--gold-primary-rgb),0.2)] text-sm md:text-base"
            placeholder="Message..."
            value={text}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <div className="absolute right-3 bottom-1.5 md:bottom-2 text-[10px] md:text-xs text-zinc-600">
            {text.length}/1000
          </div>
        </div>

        <button className="alert-btn relative group shrink-0" aria-label="Attach file" type="button">
          <svg className="w-4 md:w-4.5 h-4 md:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <button
          type="button"
          onClick={send}
          disabled={!text.trim() || sending}
          className="alert-btn bg-(--gold-primary) text-black hover:bg-(--gold-light) disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
        >
          {sending ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        :root {
          --color-bg: var(--dark-base);
          --color-primary: var(--gold-primary);
          --color-primary-2: var(--gold-light);
          --text-primary: var(--text-main);
          --text-secondary: #9CA3AF;
        }
        [data-theme="light"] {
          --color-bg: #FAFAFA;
          --text-primary: #1F2937;
          --text-secondary: #4B5563;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
