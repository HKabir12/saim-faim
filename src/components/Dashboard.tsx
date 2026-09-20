"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EntryModal from "./EntryModal";
import { bn, taka } from "@/lib/format";
import type { Gift, ListResponse } from "@/lib/types";

const PAGE_SIZE = 20;

type Query = { name: string; village: string; page: number };
type ModalState = { open: false } | { open: true; gift: Gift | null };

function Entry({ g }: { g: Gift }) {
  if (g.kind === "cash") {
    return <span className="font-semibold text-pine">{taka(g.amount ?? 0)}</span>;
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="rounded-full bg-gold/25 px-2 py-0.5 text-xs font-semibold text-gold-700">
        উপহার
      </span>
      <span>{g.giftItem}</span>
    </span>
  );
}

function RowActions({
  g,
  onEdit,
  onDelete,
}: {
  g: Gift;
  onEdit: (g: Gift) => void;
  onDelete: (g: Gift) => void;
}) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onEdit(g)}
        className="rounded-md px-2.5 py-1.5 text-sm font-medium text-pine hover:bg-pine-50"
      >
        এডিট
      </button>
      <button
        onClick={() => onDelete(g)}
        className="rounded-md px-2.5 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        ডিলিট
      </button>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [nameInput, setNameInput] = useState("");
  const [villageInput, setVillageInput] = useState("");
  const [query, setQuery] = useState<Query>({ name: "", village: "", page: 1 });
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [toast, setToast] = useState("");

  // সার্চ বক্সে টাইপ থামলে ০.৩ সেকেন্ড পরে খোঁজা হবে
  useEffect(() => {
    const t = setTimeout(() => {
      const n = nameInput.trim();
      const v = villageInput.trim();
      setQuery((q) => (q.name === n && q.village === v ? q : { name: n, village: v, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [nameInput, villageInput]);

  const load = useCallback(
    async (q: Query, signal: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ name: q.name, village: q.village, page: String(q.page) });
        const res = await fetch(`/api/gifts?${params}`, { signal });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error("load failed");
        const json: ListResponse = await res.json();
        setData(json);
        setError("");
        // পাতা নম্বর সীমা ছাড়ালে সার্ভার শেষ পাতায় নামিয়ে দেয়
        if (json.page !== q.page) setQuery((prev) => ({ ...prev, page: json.page }));
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError("তালিকা লোড করা যায়নি। ইন্টারনেট বা ডাটাবেস দেখে আবার চেষ্টা করুন।");
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const c = new AbortController();
    load(query, c.signal);
    return () => c.abort();
  }, [query, load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const reload = () => setQuery((q) => ({ ...q }));

  function handleSaved(created: boolean) {
    if (created) {
      // নতুন এন্ট্রি সবার শেষে যোগ হয়, তাই শেষ পাতায় নিয়ে যাই
      const nextTotal = (data?.stats.total ?? 0) + 1;
      setNameInput("");
      setVillageInput("");
      setQuery({ name: "", village: "", page: Math.max(1, Math.ceil(nextTotal / PAGE_SIZE)) });
      setToast("এন্ট্রি সংরক্ষিত হয়েছে");
    } else {
      setModal({ open: false });
      reload();
      setToast("এন্ট্রি আপডেট হয়েছে");
    }
  }

  async function remove(g: Gift) {
    if (!window.confirm(`“${g.name}” (${g.village}) এর এন্ট্রি মুছে ফেলবেন?`)) return;
    const res = await fetch(`/api/gifts/${g.id}`, { method: "DELETE" });
    if (res.ok) {
      setToast("এন্ট্রি মুছে ফেলা হয়েছে");
      reload();
    } else {
      setToast("মুছে ফেলা যায়নি");
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  const rows = data?.rows ?? [];
  const stats = data?.stats;
  const filtered = query.name !== "" || query.village !== "";
  const closeModal = useCallback(() => setModal({ open: false }), []);

  return (
    <div className="min-h-dvh">
      <header className="bg-pine text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-display text-xl font-bold text-gold-300 sm:text-2xl">সাইম ও ফাইম</h1>
            <p className="text-sm text-white/70">সুন্নাতে খাতনা অনুষ্ঠান, ২৫ সেপ্টেম্বর ২০২৬</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-white/25 px-3.5 py-2 text-sm font-medium hover:bg-white/10"
          >
            লগআউট
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        {/* সারসংক্ষেপ */}
        <section
          aria-label="সারসংক্ষেপ"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-pine-100 ring-1 ring-pine-100 md:grid-cols-4"
        >
          <div className="bg-white p-4 sm:p-5">
            <p className="text-sm text-ink/60">মোট এসেছেন</p>
            <p className="mt-1 font-display text-3xl font-bold text-pine">
              {stats ? bn(stats.total) : "…"} <span className="text-base font-semibold">জন</span>
            </p>
          </div>
          <div className="bg-white p-4 sm:p-5">
            <p className="text-sm text-ink/60">টাকা দিয়েছেন</p>
            <p className="mt-1 font-display text-3xl font-bold text-pine">
              {stats ? bn(stats.cashCount) : "…"} <span className="text-base font-semibold">জন</span>
            </p>
          </div>
          <div className="bg-white p-4 sm:p-5">
            <p className="text-sm text-ink/60">উপহার দিয়েছেন</p>
            <p className="mt-1 font-display text-3xl font-bold text-pine">
              {stats ? bn(stats.giftCount) : "…"} <span className="text-base font-semibold">জন</span>
            </p>
          </div>
          <div className="bg-pine p-4 text-white sm:p-5">
            <p className="text-sm text-white/70">মোট টাকা</p>
            <p className="mt-1 font-display text-3xl font-bold text-gold-300">
              {stats ? taka(stats.totalAmount) : "…"}
            </p>
          </div>
        </section>

        {/* সার্চ ও অ্যাকশন */}
        <section className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="field md:max-w-xs"
            placeholder="নাম দিয়ে খুঁজুন"
            aria-label="নাম দিয়ে খুঁজুন"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <input
            className="field md:max-w-xs"
            placeholder="গ্রামের নাম দিয়ে খুঁজুন"
            aria-label="গ্রামের নাম দিয়ে খুঁজুন"
            value={villageInput}
            onChange={(e) => setVillageInput(e.target.value)}
          />
          <div className="flex gap-2 md:ml-auto">
            <a href="/api/gifts/export" className="btn-ghost flex-1 md:flex-none">
              CSV ডাউনলোড
            </a>
            <button onClick={() => setModal({ open: true, gift: null })} className="btn-gold flex-1 md:flex-none">
              + নতুন এন্ট্রি
            </button>
          </div>
        </section>

        {/* তালিকা */}
        <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-pine-100">
          {error && (
            <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          {!data && loading ? (
            <p className="px-4 py-12 text-center text-ink/60">তালিকা লোড হচ্ছে…</p>
          ) : rows.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="font-medium text-ink">
                {filtered ? "এই নামে কোনো এন্ট্রি পাওয়া যায়নি" : "এখনো কোনো এন্ট্রি নেই"}
              </p>
              <p className="mt-1 text-sm text-ink/60">
                {filtered
                  ? "বানান বদলে বা শুধু একটা অংশ লিখে খুঁজে দেখুন।"
                  : "“নতুন এন্ট্রি” চাপ দিয়ে প্রথম সম্মানী লিখুন।"}
              </p>
            </div>
          ) : (
            <>
              {/* ডেস্কটপ: টেবিল */}
              <div className={`hidden md:block ${loading ? "opacity-60" : ""}`}>
                <table className="w-full text-left">
                  <thead className="bg-pine-50 text-sm text-pine-700">
                    <tr>
                      <th className="w-24 px-5 py-3 font-semibold">সিরিয়াল</th>
                      <th className="px-3 py-3 font-semibold">নাম</th>
                      <th className="px-3 py-3 font-semibold">গ্রামের নাম</th>
                      <th className="px-3 py-3 font-semibold">টাকা / উপহার</th>
                      <th className="w-40 px-5 py-3 text-right font-semibold">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pine-100">
                    {rows.map((g) => (
                      <tr key={g.id} className="hover:bg-pine-50/60">
                        <td className="px-5 py-3 text-ink/60">{bn(g.serial)}</td>
                        <td className="px-3 py-3 font-medium">{g.name}</td>
                        <td className="px-3 py-3">{g.village}</td>
                        <td className="px-3 py-3">
                          <Entry g={g} />
                        </td>
                        <td className="px-5 py-2 text-right">
                          <div className="flex justify-end">
                            <RowActions g={g} onEdit={(x) => setModal({ open: true, gift: x })} onDelete={remove} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* মোবাইল: কার্ড তালিকা */}
              <ul className={`divide-y divide-pine-100 md:hidden ${loading ? "opacity-60" : ""}`}>
                {rows.map((g) => (
                  <li key={g.id} className="flex gap-3 p-4">
                    <span className="mt-0.5 grid h-8 min-w-8 shrink-0 place-items-center rounded-full bg-pine-50 px-2 text-sm font-semibold text-pine">
                      {bn(g.serial)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-sm text-ink/60">{g.village}</p>
                      <p className="mt-1">
                        <Entry g={g} />
                      </p>
                    </div>
                    <div className="shrink-0 self-start">
                      <RowActions g={g} onEdit={(x) => setModal({ open: true, gift: x })} onDelete={remove} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
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

      {modal.open && (
        <EntryModal gift={modal.gift} onClose={closeModal} onSaved={handleSaved} />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
