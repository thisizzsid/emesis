import "./globals.css";
import type { Metadata } from "next";
import { AuthContextProvider } from "./context/AuthContext";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "EMESIS",
  description: "Free Your Mind",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth h-full">
      <body className="font-sans antialiased h-dvh flex flex-col relative overflow-hidden">
        <AuthContextProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthContextProvider>
      </body>
    </html>
  );
}
