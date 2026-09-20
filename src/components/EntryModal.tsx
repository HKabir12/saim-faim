"use client";

import { useEffect, useRef, useState } from "react";
import { toEnglishDigits } from "@/lib/format";
import type { Gift, Kind } from "@/lib/types";

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function EntryModal({
  gift,
  onClose,
  onSaved,
}: {
  gift: Gift | null;
  onClose: () => void;
  onSaved: (created: boolean) => void;
}) {
  const editing = gift !== null;
  const [name, setName] = useState(gift?.name ?? "");
  const [village, setVillage] = useState(gift?.village ?? "");
  const [kind, setKind] = useState<Kind>(gift?.kind ?? "cash");
  const [amount, setAmount] = useState(gift?.amount ? String(gift.amount) : "");
  const [item, setItem] = useState(gift?.giftItem ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/gifts/${gift.id}` : "/api/gifts", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          village,
          kind,
          amount: kind === "cash" ? amount : null,
          giftItem: kind === "gift" ? item : null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "সংরক্ষণ করা যায়নি");
        return;
      }
      onSaved(!editing);
      if (!editing) {
        // পরপর এন্ট্রির জন্য: গ্রামের নাম রেখে বাকিটা খালি
        setName("");
        setAmount("");
        setItem("");
        nameRef.current?.focus();
      }
    } catch {
      setError("নেটওয়ার্কে সমস্যা, আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-pine-900/60 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between">
          <h2 id="entry-title" className="font-display text-xl font-bold text-pine">
            {editing ? "এন্ট্রি এডিট করুন" : "নতুন এন্ট্রি"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="-mr-2 -mt-1 rounded-md p-2 text-ink/60 hover:bg-pine-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="f-name" className="mb-1 block text-sm font-medium">
              নাম
            </label>
            <input
              id="f-name"
              ref={nameRef}
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="f-village" className="mb-1 block text-sm font-medium">
              গ্রামের নাম
            </label>
            <input
              id="f-village"
              className="field"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              autoComplete="off"
              maxLength={100}
              required
            />
          </div>

          <div
            role="radiogroup"
            aria-label="সম্মানীর ধরন"
            className="grid grid-cols-2 gap-1 rounded-xl bg-pine-50 p-1"
          >
            {(["cash", "gift"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={`rounded-lg py-2 text-base font-semibold transition-colors ${
                  kind === k ? "bg-pine text-white shadow-sm" : "text-pine hover:bg-white"
                }`}
              >
                {k === "cash" ? "টাকা" : "উপহার"}
              </button>
            ))}
          </div>

          {kind === "cash" ? (
            <div>
              <label htmlFor="f-amount" className="mb-1 block text-sm font-medium">
                টাকার পরিমাণ
              </label>
              <input
                id="f-amount"
                className="field"
                inputMode="numeric"
                value={amount}
                onChange={(e) =>
                  setAmount(toEnglishDigits(e.target.value).replace(/[^0-9]/g, ""))
                }
                autoComplete="off"
                required
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(String(q))}
                    className="rounded-full border border-pine-100 px-3 py-1 text-sm text-pine hover:bg-pine-50"
                  >
                    {q.toLocaleString("bn-BD")}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="f-item" className="mb-1 block text-sm font-medium">
                উপহারের নাম
              </label>
              <input
                id="f-item"
                className="field"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="যেমন: শাড়ি, ঘড়ি, জামা"
                autoComplete="off"
                maxLength={200}
                required
              />
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              বন্ধ করুন
            </button>
            <button type="submit" disabled={saving} className="btn-pine flex-1">
              {saving ? "সংরক্ষণ হচ্ছে…" : editing ? "আপডেট করুন" : "সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
