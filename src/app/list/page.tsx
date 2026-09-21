"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bn, taka } from "@/lib/format";
import type { Gift } from "@/lib/types";

type Row = Omit<Gift, "id">;
type Resp = { rows: Row[]; total: number; page: number; totalPages: number };
type Query = { name: string; village: string; page: number };

function Entry({ g }: { g: Row }) {
  if (g.kind === "cash") {
    return <span className="font-semibold text-pine">{taka(g.amount ?? 0)}</span>;
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-gold/25 px-2 py-0.5 text-xs font-semibold text-gold-700">
        উপহার
      </span>
      <span>{g.giftItem}</span>
    </span>
  );
}

export default function PublicListPage() {
  const [nameInput, setNameInput] = useState("");
  const [villageInput, setVillageInput] = useState("");
  const [query, setQuery] = useState<Query>({ name: "", village: "", page: 1 });
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const n = nameInput.trim();
      const v = villageInput.trim();
      setQuery((q) => (q.name === n && q.village === v ? q : { name: n, village: v, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [nameInput, villageInput]);

  useEffect(() => {
    const c = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          name: query.name,
          village: query.village,
          page: String(query.page),
        });
        const res = await fetch(`/api/public/gifts?${params}`, { signal: c.signal });
        if (!res.ok) throw new Error("load failed");
        const json: Resp = await res.json();
        setData(json);
        setError("");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError("তালিকা লোড করা যায়নি, আবার চেষ্টা করুন।");
      } finally {
        if (!c.signal.aborted) setLoading(false);
      }
    })();
    return () => c.abort();
  }, [query]);

  const rows = data?.rows ?? [];
  const filtered = query.name !== "" || query.village !== "";

  return (
    <div className="min-h-dvh">
      <header className="bg-pine text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-display text-xl font-bold text-gold-300 sm:text-2xl">সাইম ও ফাইম</h1>
            <p className="text-sm text-white/70">সুন্নাতে খাতনা, সম্মানীর তালিকা</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/25 px-3.5 py-2 text-sm font-medium hover:bg-white/10"
          >
            হোম
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="field"
            placeholder="নাম দিয়ে খুঁজুন"
            aria-label="নাম দিয়ে খুঁজুন"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <input
            className="field"
            placeholder="গ্রামের নাম দিয়ে খুঁজুন"
            aria-label="গ্রামের নাম দিয়ে খুঁজুন"
            value={villageInput}
            onChange={(e) => setVillageInput(e.target.value)}
          />
        </div>

        <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-pine-100">
          {error && (
            <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          {!data && loading ? (
            <p className="px-4 py-12 text-center text-ink/60">তালিকা লোড হচ্ছে…</p>
          ) : rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-ink/70">
              {filtered ? "এই নামে কোনো এন্ট্রি পাওয়া যায়নি" : "এখনো কোনো এন্ট্রি নেই"}
            </p>
          ) : (
            <table className={`w-full text-left ${loading ? "opacity-60" : ""}`}>
              <thead className="bg-pine-50 text-sm text-pine-700">
                <tr>
                  <th className="w-16 px-4 py-3 font-semibold sm:w-24 sm:px-5">সিরিয়াল</th>
                  <th className="px-3 py-3 font-semibold">নাম</th>
                  <th className="hidden px-3 py-3 font-semibold sm:table-cell">গ্রামের নাম</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">টাকা / উপহার</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-100">
                {rows.map((g) => (
                  <tr key={g.serial}>
                    <td className="px-4 py-3 text-ink/60 sm:px-5">{bn(g.serial)}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{g.name}</p>
                      <p className="text-sm text-ink/60 sm:hidden">{g.village}</p>
                    </td>
                    <td className="hidden px-3 py-3 sm:table-cell">{g.village}</td>
                    <td className="px-4 py-3 sm:px-5">
                      <Entry g={g} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {data && data.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pine-100 px-4 py-3">
              <p className="text-sm text-ink/70">
                পাতা {bn(data.page)} / {bn(data.totalPages)}
                {filtered && `, খুঁজে পাওয়া গেছে ${bn(data.total)} জন`}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-ghost px-3 py-1.5 text-sm"
                  disabled={data.page <= 1 || loading}
                  onClick={() => setQuery((q) => ({ ...q, page: data.page - 1 }))}
                >
                  আগের পাতা
                </button>
                <button
                  className="btn-ghost px-3 py-1.5 text-sm"
                  disabled={data.page >= data.totalPages || loading}
                  onClick={() => setQuery((q) => ({ ...q, page: data.page + 1 }))}
                >
                  পরের পাতা
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}