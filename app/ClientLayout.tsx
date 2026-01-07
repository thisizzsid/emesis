"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isLoginPage = pathname === "/login" || pathname === "/signup" || pathname === "/onboarding";

  return (
    <>
      <Navbar />
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden ios-smooth-scroll ${
          isLoginPage ? "" : "pb-16 md:pb-20 pt-16"
        }`}
      >
        {children}
      </main>
      {!isLoginPage && <Footer />}
    </>
  );
}
