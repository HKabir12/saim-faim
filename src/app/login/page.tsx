"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Star from "@/components/Star";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "লগইন করা যায়নি");
    } catch {
      setError("নেটওয়ার্কে সমস্যা, আবার চেষ্টা করুন");
    }
    setBusy(false);
  }

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-pine px-5 py-12">
      <div className="pattern absolute inset-0 -z-10" aria-hidden="true" />

      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <Star className="h-12 w-12 text-gold" />
          <h1 className="mt-4 font-display text-2xl font-bold text-gold-300">এডমিন লগইন</h1>
          <p className="mt-1 text-sm text-white/70">সাইম ও ফাইমের সুন্নাতে খাতনা</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              নাম
            </label>
            <input
              id="username"
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-pine w-full">
            {busy ? "যাচাই হচ্ছে…" : "লগইন করুন"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          <Link href="/" className="text-white/70 underline-offset-4 hover:text-white hover:underline">
            হোম পেজে ফিরুন
          </Link>
        </p>
      </div>
    </main>
  );
}
