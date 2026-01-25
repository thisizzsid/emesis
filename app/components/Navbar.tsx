"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Bell, Home, Compass, LayoutDashboard, User, MessageCircle, LogOut, Sun, Moon } from "lucide-react";

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

  const isActive = (path: string) => {
    if (path === "/feed" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return pathname === path;
  };

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
    const duration = 2000;
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
      <header className="fixed top-0 w-full h-16 glass border-b border-[rgba(var(--gold-primary-rgb),0.2)] z-50 flex items-center px-4 md:px-6">
        {/* Left: Menu Button (Mobile Only) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[rgba(var(--gold-primary-rgb),0.1)] transition-colors"
          aria-label="Toggle sidebar"
          type="button"
        >
          <svg
            className="w-6 h-6 text-[var(--gold-primary)]"
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
            <div className="absolute inset-0 bg-linear-to-r from-[var(--gold-primary)] to-[var(--gold-light)] opacity-30 blur-xl group-hover:opacity-60 transition-opacity duration-500"></div>
            <Image
              src="/logoemesis.png"
              alt="Emesis Logo"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(var(--gold-primary-rgb),0.8)] relative z-10"
              sizes="40px"
            />
          </div>
          <span className="hidden sm:inline bg-linear-to-r from-[var(--gold-primary)] via-[var(--gold-light)] to-[var(--gold-primary)] bg-clip-text text-transparent font-black tracking-tighter">
            EMESIS
          </span>
          <div className="absolute -bottom-1 left-0 w-0 h-0.75 bg-linear-to-r from-[var(--gold-primary)] to-[var(--gold-light)] group-hover:w-full transition-all duration-500"></div>
        </button>

        {/* Right: Logout Button (Center-aligned on desktop, right-aligned on mobile) */}
        <div className="flex-1 flex items-center justify-end md:justify-center">
          <button
            onClick={toggleTheme}
            className={`relative mr-3 p-2 rounded-xl transition-all duration-300 active:scale-95 group overflow-hidden ${
              theme === "light"
                ? "bg-zinc-900 text-white hover:bg-black hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                : "bg-[rgba(var(--gold-primary-rgb),0.1)] text-[var(--gold-primary)] hover:bg-[rgba(var(--gold-primary-rgb),0.2)] hover:shadow-[0_0_20px_rgba(var(--gold-primary-rgb),0.4)] border border-[rgba(var(--gold-primary-rgb),0.3)]"
            }`}
            aria-live="polite"
            type="button"
          >
            <div className="flex items-center gap-2 relative z-10">
              <svg
                className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-500 ${
                  theme === "dark" ? "group-hover:rotate-90" : "group-hover:-rotate-12"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                {theme === "light" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
              <span className="hidden md:inline font-bold tracking-tight">
                {theme === "light" ? "Pitch Black" : "Light Mode"}
              </span>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="logout-btn relative p-2 rounded-xl transition-all duration-200 active:scale-95 text-[#ff0033] hover:bg-[#ff0033]/10 hover:shadow-[0_0_20px_rgba(255,0,51,0.6)] group"
            type="button"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
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
            <span className="hidden md:inline ml-2">Logout</span>
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
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl animate-fadeIn">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[rgba(var(--gold-primary-rgb),0.15)] via-transparent to-transparent opacity-50 animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                {/* Large Icon Animation */}
                <div className="mb-12 relative">
                    <div className="absolute inset-0 bg-[var(--gold-primary)] blur-[60px] opacity-20 animate-pulse"></div>
                    <div className="text-8xl md:text-9xl animate-bounceIn drop-shadow-[0_0_30px_rgba(var(--gold-primary-rgb),0.5)]">
                        {theme === "dark" ? "☀️" : "🌑"}
                    </div>
                </div>
                
                {/* Text Content */}
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-[var(--gold-primary)] via-white to-[var(--gold-primary)] mb-6 tracking-tighter text-center animate-slideInUp">
                    {theme === "dark" ? "ILLUMINATING" : "GOING DARK"}
                </h2>
                
                <p className="text-zinc-500 text-lg md:text-xl font-mono tracking-widest uppercase mb-12 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
                    System Reconfiguration in Progress
                </p>

                {/* Modern Progress Bar */}
                <div className="w-full max-w-md h-1 bg-zinc-900 rounded-full overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div 
                        className="h-full bg-linear-to-r from-[var(--gold-primary)] to-[var(--gold-light)] transition-all duration-75 ease-linear shadow-[0_0_15px_var(--gold-primary)] relative" 
                        style={{ width: `${progressWidth}%` }} 
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-white/50 blur-sm"></div>
                    </div>
                </div>
                
                {/* Percentage */}
                <div className="mt-4 font-mono text-[var(--gold-primary)] text-sm opacity-80">
                    {progressWidth}% COMPLETE
                </div>
            </div>
          </div>
        )}
      </header>

      {/* SIDEBAR - Responsive (Mobile Slide-out, Desktop Fixed) */}
      <aside
        className={`fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-black/40 backdrop-blur-xl border-r border-[rgba(var(--gold-primary-rgb),0.15)] transition-transform duration-300 z-40 flex flex-col overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        onMouseEnter={handleSidebarInteraction}
        onMouseLeave={() => {
          // Only auto-close on mobile
          if (window.innerWidth < 768) {
            sidebarTimeoutRef.current = setTimeout(() => {
              setSidebarOpen(false);
            }, 3000);
          }
        }}
      >
        {/* Navigation Items */}
        <div className="flex-1 px-3 py-6 space-y-2">
          <SidebarNavButton
            href="/feed"
            label="Feed"
            icon={Home}
            isActive={isActive("/feed")}
            onClick={handleNavClick}
          />

          <SidebarNavButton
            href="/explore"
            label="Explore"
            icon={Compass}
            isActive={isActive("/explore")}
            onClick={handleNavClick}
          />

          <SidebarNavButton
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            isActive={isActive("/dashboard")}
            onClick={handleNavClick}
          />

          <SidebarNavButton
            href="/profile"
            label="Profile"
            icon={User}
            isActive={isActive("/profile")}
            onClick={handleNavClick}
          />

          <div className="relative">
            <SidebarNavButton
              href="/chat"
              label="Chat"
              icon={MessageCircle}
              isActive={isActive("/chat")}
              onClick={handleNavClick}
            />
            {unreadMessages > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </div>
        </div>

        {/* Notifications Section in Sidebar (Mobile Only mainly, but nice to have) */}
        <div className="border-t border-[rgba(var(--gold-primary-rgb),0.15)] p-4 bg-gradient-to-t from-[rgba(var(--gold-primary-rgb),0.05)] to-transparent">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[var(--gold-primary)] uppercase tracking-wider flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${notificationCount > 0 ? "bg-red-500 animate-pulse" : "bg-zinc-700"}`}></span>
              Notifications
            </h3>
            {notificationCount > 0 && (
              <span className="text-[10px] bg-[rgba(var(--gold-primary-rgb),0.2)] text-[var(--gold-primary)] px-2 py-0.5 rounded-full">
                {notificationCount} New
              </span>
            )}
          </div>
          {notificationCount === 0 ? (
            <p className="text-xs text-zinc-500 font-light italic">All caught up!</p>
          ) : (
            <p className="text-xs text-zinc-400">
              You have <span className="text-white font-bold">{notificationCount}</span> unread notifications.
            </p>
          )}
        </div>
      </aside>


      {/* Sidebar Backdrop - Mobile Only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

// Modern Sidebar NavButton Component
function SidebarNavButton({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  icon: any;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 overflow-hidden ${
        isActive
          ? "text-[var(--gold-primary)] shadow-[0_0_20px_rgba(var(--gold-primary-rgb),0.15)]"
          : "text-zinc-400 hover:text-[var(--gold-light)]"
      }`}
    >
      {/* Active Background Gradient */}
      {isActive && (
        <div className="absolute inset-0 bg-linear-to-r from-[rgba(var(--gold-primary-rgb),0.15)] to-transparent opacity-100 transition-opacity duration-300"></div>
      )}
      
      {/* Hover Background */}
      <div className={`absolute inset-0 bg-[rgba(var(--gold-primary-rgb),0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'hidden' : ''}`}></div>

      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--gold-primary)] rounded-r-full shadow-[0_0_10px_var(--gold-primary)]"></div>
      )}

      {/* Icon */}
      <Icon className={`w-5 h-5 shrink-0 transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_8px_rgba(var(--gold-primary-rgb),0.6)] scale-110' : 'group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(var(--gold-primary-rgb),0.4)]'}`} />

      {/* Label */}
      <span className={`font-medium tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
        {label}
      </span>
      
      {/* Subtle Glow on Hover */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-[rgba(var(--gold-primary-rgb),0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Link>
  );
}
