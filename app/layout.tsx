import "./globals.css";
import type { Metadata } from "next";
import { AuthContextProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "E2",
  description: "Connect and communicate",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ scrollBehavior: "smooth", height: "100%" }}>
      <body className="bg-black text-[#F5C26B] font-sans antialiased h-screen flex flex-col relative">
        <AuthContextProvider>
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
