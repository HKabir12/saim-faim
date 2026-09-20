"use client";

import { useEffect, useState } from "react";
import { bn } from "@/lib/format";

// ২৫ সেপ্টেম্বর ২০২৬, বাংলাদেশ সময় (UTC+6)
const TARGET = new Date("2026-09-25T00:00:00+06:00").getTime();
const DAY = 86_400_000;

export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (now === null) return <div className="h-[92px]" aria-hidden="true" />;

  const diff = TARGET - now;
  if (diff <= 0) {
    return (
      <p className="font-display text-xl text-gold-300">
        {now - TARGET < DAY ? "আজ সেই শুভদিন" : "অনুষ্ঠান সম্পন্ন হয়েছে, সবাইকে ধন্যবাদ"}
      </p>
    );
  }

  const parts = [
    { value: Math.floor(diff / DAY), label: "দিন" },
    { value: Math.floor((diff % DAY) / 3_600_000), label: "ঘণ্টা" },
    { value: Math.floor((diff % 3_600_000) / 60_000), label: "মিনিট" },
  ];

  return (
    <dl className="flex items-stretch justify-center">
      {parts.map((p, i) => (
        <div
          key={p.label}
          className={`min-w-[5.5rem] px-5 sm:min-w-[7rem] ${i > 0 ? "border-l border-gold/40" : ""}`}
        >
          <dd className="font-display text-4xl font-bold text-white sm:text-5xl">{bn(p.value)}</dd>
          <dt className="mt-1 text-sm text-white/70">{p.label}</dt>
        </div>
      ))}
    </dl>
  );
}
