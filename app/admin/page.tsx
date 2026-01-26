"use client";

import { useState } from "react";
import { Shield, Bell, Send, Lock, Image as ImageIcon, Link as LinkIcon, CheckCircle, AlertCircle } from "lucide-react";
import Toast from "../components/Toast";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [campaign, setCampaign] = useState({
    title: "",
    body: "",
    image: "",
    link: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, verify against server, but here we just unlock the UI
    // The real check happens when sending the campaign API request
    if (password) {
      setIsAuthenticated(true);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password, // Send password to verify on server
          ...campaign
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send campaign");
      }

      setToast({ 
        message: `Sent to ${data.sent} users (${data.failed} failed)`, 
        type: "success" 
      });
      
      // Reset form (optional)
      // setCampaign({ title: "", body: "", image: "", link: "" });

    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
      if (error.message === "Unauthorized") {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-(--background) p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-(--glass-border) bg-(--glass-bg)">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-(--gold-primary)/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-(--gold-primary)" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-zinc-400">Enter secure password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-(--gold-primary) outline-none transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-(--gold-primary) text-black font-bold py-3 rounded-xl hover:bg-(--gold-light) transition-colors"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-(--background) text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-(--gold-primary)/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-(--gold-primary)" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-400">Push Notification Campaigns</p>
          </div>
        </header>

        <div className="glass-card p-6 md:p-8 rounded-3xl border border-(--glass-border) bg-(--glass-bg)">
          <form onSubmit={handleSend} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">Campaign Title</label>
              <div className="relative">
                <Bell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={campaign.title}
                  onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                  placeholder="e.g., New Feature Alert! 🚀"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-(--gold-primary) outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">Message Body</label>
              <textarea
                value={campaign.body}
                onChange={(e) => setCampaign({ ...campaign, body: e.target.value })}
                placeholder="Write your message here..."
                className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-(--gold-primary) outline-none transition-colors h-32 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">Image URL (Optional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="url"
                    value={campaign.image}
                    onChange={(e) => setCampaign({ ...campaign, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-(--gold-primary) outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">Target Link (Optional)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={campaign.link}
                    onChange={(e) => setCampaign({ ...campaign, link: e.target.value })}
                    placeholder="/feed"
                    className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-(--gold-primary) outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-(--gold-primary) to-(--gold-light) text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(var(--gold-primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Pushing Campaign...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Notification Campaign</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
