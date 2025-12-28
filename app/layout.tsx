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
      <body className="bg-black text-[#F5C26B] font-sans antialiased h-screen flex flex-col relative overflow-hidden">
        <AuthContextProvider>
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-20 pt-16" style={{WebkitOverflowScrolling: 'touch'}}>
            {children}
          </main>
          <Footer />
        </AuthContextProvider>
      </body>
    </html>
  );
}
