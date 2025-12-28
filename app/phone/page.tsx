"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function PhoneLoginPage() {
  const router = useRouter();
  const { sendOTP, verifyOTP, user } = useAuth();

  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [msg, setMsg] = useState("");

  // redirect if logged in
  useEffect(() => {
    if (user) router.push("/feed");
  }, [user, router]);

  // resend OTP countdown
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const formatPhone = (num: string) => {
    let x = num.replace(/\s+/g, "");
    if (!x.startsWith("+91")) {
      x = "+91" + x.replace("+", "");
    }
    return x;
  };

  const handleSend = async () => {
    const formatted = formatPhone(phone);
    if (formatted.length < 13) return alert("Enter valid mobile no.");

    try {
      setLoading(true);
      const conf = await sendOTP(formatted);
      setConfirmation(conf);
      setMsg(`OTP sent to ${formatted}`);
      setStage("otp");
      setTimer(30);
    } catch (err: any) {
      alert(err.message || "OTP send failed");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!confirmation) return alert("Send OTP first");
    if (otp.length < 6) return alert("Enter valid 6-digit OTP");

    try {
      setLoading(true);
      await verifyOTP(confirmation, otp);
      router.push("/feed");
    } catch (err) {
      alert("Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center px-6 text-yellow-300">
      
      {/* Always Mounted */}
      <div id="recaptcha-container" className="hidden"></div>

      <div className="bg-zinc-900 border border-yellow-700 p-8 rounded-2xl w-full max-w-sm shadow-xl">
        <h1 className="text-3xl font-bold text-yellow-400 text-center mb-6">
          Phone Login
        </h1>

        {stage === "phone" && (
          <>
            <label className="text-xs opacity-70">Enter Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-black border border-zinc-700 rounded-lg text-yellow-300"
              placeholder="+91XXXXXXXXXX"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="mt-5 w-full py-3 bg-yellow-400 text-black rounded-lg font-bold hover:bg-yellow-500"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {stage === "otp" && (
          <>
            <p className="text-sm opacity-70 mb-3">{msg}</p>
            <label className="text-xs opacity-70">Enter OTP</label>

            <input
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-black border border-zinc-700 rounded-lg text-yellow-300 text-center tracking-widest text-xl"
              placeholder="••••••"
            />

            <button
              onClick={handleVerify}
              disabled={loading}
              className="mt-5 w-full py-3 bg-yellow-400 text-black rounded-lg font-bold hover:bg-yellow-500"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Resend Row */}
            <div className="text-center mt-4 text-xs">
              {timer > 0 ? (
                <span className="opacity-60">Resend OTP in {timer}s</span>
              ) : (
                <button
                  onClick={handleSend}
                  className="text-yellow-400 hover:text-yellow-200 underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-xs text-yellow-500 hover:text-yellow-300"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
