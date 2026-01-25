"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import OnboardingTour from "./components/OnboardingTour";
import { useAuth } from "./context/AuthContext";
import { useState, useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fading out after 2 seconds
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Unmount after fade out completes (0.5s)
    const timer2 = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const isLoginPage = pathname === "/login" || pathname === "/signup" || pathname === "/onboarding";

  return (
    <>
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--dark-base)] text-[var(--text-main)] transition-opacity duration-500 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[var(--gold-primary)] animate-fadeIn">Welcome to EMESIS</h1>
              <p className="text-lg md:text-xl text-[var(--text-main)] opacity-80 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                A confession place for everyone
              </p>
            </div>
        </div>
      )}

      <Navbar />
      <OnboardingTour />
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden ios-smooth-scroll ${
          isLoginPage ? "" : "pb-24 md:pb-20 pt-16 md:ml-64 safe-area-bottom"
        }`}
      >
        {children}
      </main>
      {!isLoginPage && <Footer />}
    </>
  );
}
