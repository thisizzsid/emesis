"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?mode=signup");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-[var(--gold-primary)]">
      Redirecting...
    </div>
  );
}
