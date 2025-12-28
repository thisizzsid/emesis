import "./globals.css";
import type { Metadata } from "next";
import { AuthContextProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotificationSetup from "./components/NotificationSetup";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "./firebase";

export const metadata: Metadata = {
  title: "E2",
  description: "Connect and communicate",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    // This function will be called by the Android WebView
    (window as any).onFCMToken = async (token: string) => {
      try {
        const auth = getAuth(app);
        const db = getFirestore(app);

        const user = auth.currentUser;
        if (!user) return;

        await setDoc(
          doc(db, "users", user.uid),
          { fcmToken: token },
          { merge: true }
        );

        console.log("FCM token saved:", token);
      } catch (err) {
        console.error("FCM save error", err);
      }
    };
  }, []);

  return (
    <html lang="en" style={{ scrollBehavior: "smooth", height: "100%" }}>
      <body className="bg-black text-[#F5C26B] font-sans antialiased h-screen flex flex-col relative">
        <AuthContextProvider>
          <NotificationSetup />
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-2 md:px-4 pb-16 md:pb-20 pt-16">
            {children}
          </main>
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <Footer />
          </div>
        </AuthContextProvider>
      </body>
    </html>
  );
}
