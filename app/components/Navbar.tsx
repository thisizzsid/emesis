"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Bell } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for notifications on mount and interval
  useEffect(() => {
    const checkNotifications = () => {
      try {
        const stored = localStorage.getItem("notificationCount");
        if (stored) {
          const count = parseInt(stored);
          setNotificationCount(isNaN(count) ? 0 : count);
        }
      } catch (e) {
        console.error("Notification error:", e);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check for unread messages
  useEffect(() => {
    const checkMessages = () => {
      try {
        const stored = localStorage.getItem("unreadMessages");
        if (stored) {
          const count = parseInt(stored);
          setUnreadMessages(isNaN(count) ? 0 : count);
        }
      } catch (e) {
        console.error("Messages error:", e);
      }
    };

    checkMessages();
    const interval = setInterval(checkMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide sidebar after 3 seconds
  useEffect(() => {
    if (sidebarOpen) {
      sidebarTimeoutRef.current = setTimeout(() => {
        setSidebarOpen(false);
      }, 3000);
    }
    return () => {
      if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    };
  }, [sidebarOpen]);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  const handleSidebarInteraction = () => {
    if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
  };

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showThemeNotice, setShowThemeNotice] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const initial = stored === "light" ? "light" : "dark";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setShowThemeNotice(true);
    setProgressWidth(0);
    const start = performance.now();
    const duration = 800;
    const step = (t: number) => {
      const elapsed = t - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgressWidth(pct);
      if (elapsed < duration) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
    setTimeout(() => {
      setTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
      document.documentElement.setAttribute("data-theme", next);
      setShowThemeNotice(false);
    }, duration);
  };

  useEffect(() => {
    try {
      document.documentElement.style.setProperty("--progress-width", `${progressWidth}%`);
    } catch {}
  }, [progressWidth]);
  if (!user) return null;

  return (
    <>
      <header className="fixed top-0 w-full h-16 glass border-b border-[#F5C26B]/20 z-50 flex items-center px-4 md:px-6">
        {/* Left: Menu Button (Mobile Only) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#F5C26B]/10 transition-colors"
          aria-label="Toggle sidebar"
          type="button"
        >
          <svg
            className="w-6 h-6 text-[#F5C26B]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Center: Logo */}
        <button
          onClick={() => router.push("/feed")}
          className="flex items-center gap-2 md:gap-3 text-xl md:text-3xl font-bold tracking-tight text-white hover:opacity-90 transition-all duration-500 group relative shrink-0"
          aria-label="Go to feed"
          type="button"
        >
          <div className="relative w-9 h-10 md:w-11 md:h-14 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <div className="absolute inset-0 bg-linear-to-r from-[#F5C26B] to-[#FFD56A] opacity-30 blur-xl group-hover:opacity-60 transition-opacity duration-500"></div>
            <Image
              src="/logoemesis.png"
              alt="Emesis Logo"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(245,194,107,0.8)] relative z-10"
              sizes="40px"
            />
          </div>
          <span className="hidden sm:inline bg-linear-to-r from-[#F5C26B] via-[#FFD56A] to-[#F5C26B] bg-clip-text text-transparent font-black tracking-tighter">
            EMESIS
          </span>
          <div className="absolute -bottom-1 left-0 w-0 h-0.75 bg-linear-to-r from-[#F5C26B] to-[#FFD56A] group-hover:w-full transition-all duration-500"></div>
        </button>

        {/* Right: Logout Button (Center-aligned on desktop, right-aligned on mobile) */}
        <div className="flex-1 flex items-center justify-end md:justify-center">
          <button
            onClick={toggleTheme}
            className="alert-btn relative mr-3"
            aria-live="polite"
            type="button"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {theme === "light" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m7-9h2M3 12H1m15.364-6.364l1.414 1.414M6.222 17.778l-1.414 1.414m12.556 0l1.414-1.414M6.222 6.222 4.808 4.808M12 8a4 4 0 100 8 4 4 0 000-8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              )}
            </svg>
            {theme === "light" ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleLogout}
            className="logout-btn alert-btn relative"
            type="button"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>

        {/* Right: Notifications (Desktop Only) */}
        <div className="hidden md:flex items-center gap-2 ml-6">
          <div className="relative">
            <button className="alert-btn relative p-2" aria-label="Notifications" type="button">
              <Bell className="w-5 h-5" />
            </button>
            {notificationCount > 0 && (
              <span className="notification-badge absolute -top-2 -right-2">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </div>
        </div>
        {showThemeNotice && (
          <div className="theme-notice glass rounded-xl px-4 py-3 text-sm font-semibold">
            <div className="mb-2">{theme === "dark" ? "Turning on light mode..." : "Turning on dark mode..."}</div>
            <div className="progress-bar">
              <div className="progress-bar-fill" />
            </div>
          </div>
        )}
      </header>

      {/* SIDEBAR - Mobile Only */}
      <aside
        className={`fixed left-0 top-16 w-64 h-[calc(100vh-64px)] glass border-r border-[#F5C26B]/20 transition-all duration-300 z-50 flex flex-col overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
        onMouseEnter={handleSidebarInteraction}
        onMouseLeave={() => {
          sidebarTimeoutRef.current = setTimeout(() => {
            setSidebarOpen(false);
          }, 3000);
        }}
      >
        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2">
          <SidebarNavButton
            href="/feed"
            label="Feed"
            isActive={isActive("/feed")}
            onClick={handleNavClick}
          />

          <SidebarNavButton
            href="/explore"
            label="Explore"
            isActive={isActive("/explore")}
            onClick={handleNavClick}
          />

          <SidebarNavButton
            href="/dashboard"
            label="Dashboard"
            isActive={isActive("/dashboard")}
            onClick={handleNavClick}
          />

          <SidebarNavButton
            href="/profile"
            label="Profile"
            isActive={isActive("/profile")}
            onClick={handleNavClick}
          />

          <div className="relative">
            <SidebarNavButton
              href="/chat"
              label="Chat"
              isActive={isActive("/chat")}
              onClick={handleNavClick}
            />
            {unreadMessages > 0 && (
              <span className="notification-badge animate-bounceIn absolute -top-2 -right-2">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </div>
        </div>

        {/* Notifications Section in Sidebar */}
        <div className="border-t border-[#F5C26B]/20 p-4">
          <h3 className="text-xs font-bold text-[#F5C26B] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f50707] animate-pulse"></span>
            Notifications
          </h3>
          {notificationCount === 0 ? (
            <p className="text-xs text-zinc-600">No new notifications</p>
          ) : (
            <div className="text-xs text-[#F5C26B] font-semibold">
              {notificationCount} new{" "}
              {notificationCount === 1 ? "notification" : "notifications"}
            </div>
          )}
        </div>
      </aside>


      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

// Sidebar NavButton Component
function SidebarNavButton({
  href,
  label,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-linear-to-r from-[#F5C26B]/20 to-[#FFD56A]/10 border border-[#F5C26B]/40 text-[#FFD56A]"
          : "hover:bg-[#F5C26B]/10 text-[#F5C26B]"
      }`}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {label === "Feed" && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        )}
        {label === "Explore" && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        )}
        {label === "Dashboard" && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        )}
        {label === "Profile" && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        )}
        {label === "Chat" && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        )}
      </svg>
      <span className="font-semibold">{label}</span>
    </Link>
  );
}
