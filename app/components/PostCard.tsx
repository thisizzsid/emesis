"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "../../firebase";
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, Timestamp, getDoc, Firestore } from "firebase/firestore";
import Comments from "./Comments";
import { Heart, MessageCircle, Share2, Pencil, Trash2, Smartphone, Monitor, MapPin } from "lucide-react";

interface PostCardProps {
  post: any;
  user: any;
  isFollowing: boolean;
  onFollow: (uid: string) => Promise<void>;
  onUnfollow: (uid: string) => Promise<void>;
  onRefresh: () => void;
}

export default function PostCard({ post, user, isFollowing, onFollow, onUnfollow, onRefresh }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareProgress, setShareProgress] = useState(0);
  const shareBtnRef = useRef<HTMLButtonElement | null>(null);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/gi;
    return text.match(hashtagRegex) || [];
  };

  const like = async () => {
    if (!user || !db) return;
    const ref = doc(db as Firestore, "posts", post.id);
    const hasLiked = Array.isArray(post.likes) && post.likes.includes(user.uid);
    
    // Optimistic update locally would be nice, but for now just call API
    await updateDoc(ref, {
      likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
    onRefresh();
  };

  const removePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    if (!db) return;
    setLoading(true);
    await deleteDoc(doc(db as Firestore, "posts", post.id));
    setLoading(false);
    onRefresh();
  };

  const saveEdit = async () => {
    if (!editText.trim() || !user || !db) return;
    setLoading(true);
    const ref = doc(db as Firestore, "posts", post.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        setLoading(false);
        return;
    }

    const old = snap.data();
    const newHashtags = extractHashtags(editText);
    
    await updateDoc(ref, {
      ...old,
      text: editText,
      hashtags: newHashtags,
      updatedAt: Timestamp.now()
    });

    setIsEditing(false);
    setLoading(false);
    onRefresh();
  };

  const renderTextWithHashtags = (text: string) => {
    const parts = text.split(/(#[\w\u0590-\u05ff]+)/gi);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <Link
          key={i}
          href={`/explore?tag=${part.replace('#', '')}`}
          className="text-(--gold-light) font-bold hover:text-(--gold-primary) hover:underline cursor-pointer transition-colors z-10 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!shareOpen) return;
      const target = e.target as Node;
      if (shareMenuRef.current && shareMenuRef.current.contains(target)) return;
      if (shareBtnRef.current && shareBtnRef.current.contains(target)) return;
      setShareOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (!shareOpen) return;
      if (e.key === "Escape") {
        setShareOpen(false);
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = shareMenuRef.current?.querySelectorAll<HTMLButtonElement>('[data-menuitem="true"]');
        if (!items || items.length === 0) return;
        const focusedIndex = Array.from(items).findIndex((el) => el === document.activeElement);
        let nextIndex = focusedIndex;
        if (e.key === "ArrowDown") nextIndex = Math.min(items.length - 1, focusedIndex + 1);
        else nextIndex = Math.max(0, focusedIndex - 1);
        items[nextIndex].focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [shareOpen]);

  useEffect(() => {
    if (shareOpen) {
      const first = shareMenuRef.current?.querySelector<HTMLButtonElement>('[data-menuitem="true"]');
      first?.focus();
    }
  }, [shareOpen]);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(/\s+/);
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    return y;
  };

  const generateShareCard = async (platform: "instagramStory" | "whatsapp" | "generic") => {
    // Standardize output resolution to avoid memory issues on mobile
    // We don't need devicePixelRatio here because we are generating a static image file with fixed dimensions
    const size = platform === "instagramStory" ? { w: 1080, h: 1920 } : platform === "whatsapp" ? { w: 1024, h: 1024 } : { w: 1200, h: 1800 };
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d")!;
    // No scaling needed since we work with direct pixel values corresponding to the target resolution

    // Get theme colors
    const style = getComputedStyle(document.documentElement);
    const goldPrimary = style.getPropertyValue('--gold-primary').trim() || "#F5C26B";
    const goldLight = style.getPropertyValue('--gold-light').trim() || "#FFD56A";
    const goldPrimaryRgb = style.getPropertyValue('--gold-primary-rgb').trim() || "245,194,107";

    const grd = ctx.createLinearGradient(0, 0, size.w, size.h);
    grd.addColorStop(0, "#0A0A0A");
    grd.addColorStop(0.5, "#121212");
    grd.addColorStop(1, "#1A1A1A");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.fillStyle = `rgba(${goldPrimaryRgb},0.08)`;
    ctx.beginPath();
    ctx.arc(size.w * 0.2, size.h * 0.25, size.w * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,240,255,0.06)";
    ctx.beginPath();
    ctx.arc(size.w * 0.85, size.h * 0.85, size.w * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(size.w * 0.08, size.h * 0.1, size.w * 0.84, size.h * 0.8);
    ctx.strokeStyle = `rgba(${goldPrimaryRgb},0.2)`;
    ctx.lineWidth = 3;
    ctx.strokeRect(size.w * 0.08, size.h * 0.1, size.w * 0.84, size.h * 0.8);
    ctx.font = `bold ${Math.floor(size.w * 0.06)}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
    const titleGradient = ctx.createLinearGradient(0, 0, size.w, 0);
    titleGradient.addColorStop(0, goldPrimary);
    titleGradient.addColorStop(1, goldLight);
    ctx.fillStyle = titleGradient;
    ctx.fillText("EMESIS", size.w * 0.1, size.h * 0.18);
    ctx.font = `normal ${Math.floor(size.w * 0.05)}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = goldLight;
    const maxTextWidth = size.w * 0.8;
    const startY = size.h * 0.25;
    const endY = wrapText(ctx, post.text, size.w * 0.1, startY, maxTextWidth, Math.floor(size.w * 0.07));
    ctx.font = `600 ${Math.floor(size.w * 0.04)}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = `rgba(${goldPrimaryRgb},0.9)`;
    ctx.fillText("Emesis — Confess your Thought", size.w * 0.1, Math.min(size.h * 0.9, endY + size.w * 0.2));
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png", 0.95));
  };

  const nativeShare = async (blob: Blob, text: string) => {
    const file = new File([blob], "emesis-confession.png", { type: "image/png" });
    if (typeof navigator !== "undefined" && "share" in navigator) {
      const canFiles = (navigator as any).canShare ? (navigator as any).canShare({ files: [file] }) : true;
      if (canFiles) {
        await (navigator as any).share({ files: [file], text });
        return true;
      }
      await (navigator as any).share({ text });
      return true;
    }
    return false;
  };

  const openDeepLink = (platform: "whatsapp" | "instagram", text: string) => {
    if (platform === "whatsapp") {
      const t = encodeURIComponent(text);
      const link = `https://wa.me/?text=${t}`;
      window.location.href = link;
      return;
    }
    if (platform === "instagram") {
      window.location.href = "instagram://app";
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "emesis-confession.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleShare = async (platform: "instagramStory" | "whatsapp" | "generic") => {
    try {
      setSharing(true);
      setShareProgress(0);
      const start = performance.now();
      const duration = 700;
      const step = (t: number) => {
        const elapsed = t - start;
        const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
        setShareProgress(pct);
        if (elapsed < duration) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      const blob = await generateShareCard(platform);
      const text = post.text;
      const used = await nativeShare(blob, text);
      if (used) {
        setSharing(false);
        setShareOpen(false);
        return;
      }
      if (platform === "whatsapp") {
        openDeepLink("whatsapp", text);
      } else if (platform === "instagramStory") {
        downloadBlob(blob);
        // Instagram deep link might fail if app not installed or protocol not supported in browser context
        // Try-catch block around openDeepLink or just handle it gracefully
        try {
            openDeepLink("instagram", text);
        } catch (e) {
            console.warn("Could not open Instagram", e);
        }
      } else {
        downloadBlob(blob);
      }
      setSharing(false);
      setShareOpen(false);
    } catch {
      setSharing(false);
    }
  };

  useEffect(() => {
    try {
      document.documentElement.style.setProperty("--progress-width", `${shareProgress}%`);
    } catch {}
  }, [shareProgress]);

  return (
    <div className="glass glass-hover p-6 rounded-2xl relative border border-[rgba(var(--gold-primary-rgb),0.2)] group transition-all duration-300">
        {post.uid === user?.uid && (
          <div className="absolute right-4 top-4 z-20">
              <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-xl text-zinc-400 hover:text-[var(--gold-primary)] transition-colors"
                >
                    ⋮
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 top-8 bg-black/90 border border-[rgba(var(--gold-primary-rgb),0.2)] rounded-xl text-sm shadow-xl overflow-hidden w-36 backdrop-blur-xl">
                    <button 
                      type="button"
                      aria-label="Edit post"
                      onClick={() => { setEditText(post.text); setIsEditing(true); setMenuOpen(false); }} 
                      className="w-full px-4 py-3 text-left transition-colors flex items-center gap-2 text-(--gold-primary) hover:bg-[rgba(var(--gold-primary-rgb),0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--gold-primary)"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      type="button"
                      aria-label="Delete post"
                      onClick={() => { removePost(); setMenuOpen(false); }} 
                      className="w-full px-4 py-3 text-left transition-colors flex items-center gap-2 text-red-400 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
            </div>
        )}

        {isEditing ? (
          <div className="animate-fadeIn">
            <label htmlFor={`edit-textarea-${post.id}`} className="sr-only">Edit Post</label>
            <textarea
              id={`edit-textarea-${post.id}`}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-black/50 p-4 border border-[rgba(var(--gold-primary-rgb),0.3)] rounded-xl text-(--gold-secondary) focus:outline-none focus:border-(--gold-primary) transition-all min-h-25"
              placeholder="Edit your confession/thoughts/whisper..."
            />
            <div className="mt-4 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsEditing(false)} 
                className="px-4 py-2 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={saveEdit} 
                disabled={loading}
                className="px-6 py-2 bg-(--gold-primary) text-black rounded-xl font-bold hover:shadow-lg hover:shadow-[rgba(var(--gold-primary-rgb),0.2)] transition-all text-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 flex-wrap pr-8">
              <p className="text-xs opacity-50 font-medium tracking-tight flex items-center gap-2">
                {post.anonymous ? (
                    <span className="flex items-center gap-1">
                        👻 Anonymous
                    </span>
                ) : (
                    <Link href={`/profile?uid=${post.uid}`} className="hover:text-(--gold-primary) transition-colors">
                        @{post.username}
                    </Link>
                )}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                {post.location && (
                  <div className="flex items-center gap-1" title={post.location}>
                    <MapPin className="w-3 h-3 opacity-50" />
                    <span className="truncate max-w-25">{post.location}</span>
                  </div>
                )}
                {post.device && (
                  <div className="flex items-center gap-1" title={`Posted from ${post.device}`}>
                    {post.device === "iPhone" || post.device === "Android" ? (
                      <Smartphone className="w-3 h-3 opacity-50" />
                    ) : (
                      <Monitor className="w-3 h-3 opacity-50" />
                    )}
                    <span>{post.device}</span>
                  </div>
                )}
                {post.createdAt && (
                  <span>
                    {new Date(post.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-4 text-(--gold-secondary) leading-relaxed font-normal whitespace-pre-wrap text-[15px]">
                {renderTextWithHashtags(post.text)}
            </p>

            <div className="mt-6 flex gap-4 text-sm items-center pt-4 border-t border-[rgba(var(--gold-primary-rgb),0.05)]">
              {post.uid !== user?.uid && (
                isFollowing ? (
                  <button 
                    type="button"
                    onClick={() => onUnfollow(post.uid)} 
                    className="px-4 py-3 bg-[rgba(var(--gold-primary-rgb),0.1)] text-(--gold-primary) border border-[rgba(var(--gold-primary-rgb),0.2)] rounded-lg font-medium text-sm hover:bg-[rgba(var(--gold-primary-rgb),0.2)] transition-all min-h-11"
                  >
                    Following
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => onFollow(post.uid)} 
                    className="px-4 py-3 bg-(--gold-primary) text-black rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-[rgba(var(--gold-primary-rgb),0.2)] hover:scale-105 active:scale-95 transition-all min-h-11"
                  >
                    Follow
                  </button>
                )
              )}

              <button 
                type="button"
                onClick={like} 
                title="Like"
                className={`relative group flex items-center gap-2 px-4 py-3 rounded-lg transition-all focus:outline-none focus-visible:ring-2 ring-(--gold-primary) hover:bg-[rgba(var(--gold-primary-rgb),0.1)] active:scale-95 min-h-11 ${
                  post.likes?.includes(user?.uid) ? "text-red-500 bg-red-500/10" : "text-zinc-400"
                }`}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-[rgba(var(--gold-primary-rgb),0.05)] to-transparent"></span>
                <Heart className={`w-5 h-5 transition-transform duration-300 ${post.likes?.includes(user?.uid) ? "scale-110" : "scale-100"}`} />
                <span className="font-medium text-sm">{post.likes?.length || 0}</span>
              </button>

              <button 
                type="button"
                onClick={() => setShowComments(!showComments)} 
                title="Comments"
                className="relative group flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-[rgba(var(--gold-primary-rgb),0.1)] transition-all hover:text-(--gold-primary) text-zinc-400 active:scale-95 focus:outline-none focus-visible:ring-2 ring-(--gold-primary) min-h-11"
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-[rgba(var(--gold-primary-rgb),0.05)] to-transparent"></span>
                <MessageCircle className="w-5 h-5 transition-transform duration-300 group-active:scale-95" />
                <span className="font-medium text-sm">Comment</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShareOpen((v) => !v)}
                  title="Share"
                  className="relative group flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-[rgba(var(--gold-primary-rgb),0.1)] transition-all text-zinc-400 hover:text-(--gold-primary) active:scale-95 focus:outline-none focus-visible:ring-2 ring-(--gold-primary) min-h-11"
                  aria-haspopup="menu"
                  aria-label="Share options"
                  ref={shareBtnRef}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-transparent via-[rgba(var(--gold-primary-rgb),0.05)] to-transparent"></span>
                  <Share2 className="w-5 h-5 transition-transform duration-300 group-active:scale-95" />
                  <span className="font-medium text-sm">Share</span>
                </button>
                {shareOpen && (
                  <div
                    ref={shareMenuRef}
                    role="menu"
                    className={`absolute z-50 top-full right-0 mt-2 w-56 glass rounded-xl border border-[rgba(var(--gold-primary-rgb),0.2)] shadow-xl overflow-hidden transform-gpu transition duration-300 ease-out ${shareOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                  >
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-[rgba(var(--gold-primary-rgb),0.1)] transition-colors duration-300 ease-out text-xs focus:outline-none"
                      onClick={() => handleShare("instagramStory")}
                      role="menuitem"
                      data-menuitem="true"
                    >
                      Instagram Story
                    </button>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-[rgba(var(--gold-primary-rgb),0.1)] transition-colors duration-300 ease-out text-xs focus:outline-none"
                      onClick={() => handleShare("whatsapp")}
                      role="menuitem"
                      data-menuitem="true"
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-[rgba(var(--gold-primary-rgb),0.1)] transition-colors duration-300 ease-out text-xs focus:outline-none"
                      onClick={() => handleShare("generic")}
                      role="menuitem"
                      data-menuitem="true"
                    >
                      Download Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t border-[rgba(var(--gold-primary-rgb),0.1)] animate-fadeIn">
                    <Comments postId={post.id} />
                </div>
            )}

            {sharing && (
              <div className="mt-4 glass rounded-xl p-4 animate-fadeIn">
                <div className="font-semibold text-sm mb-2">Preparing share card...</div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" />
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
}
