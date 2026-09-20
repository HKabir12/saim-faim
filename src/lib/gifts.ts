import { toEnglishDigits } from "./format";
import type { Kind } from "./types";

export type GiftInput = {
  name: string;
  village: string;
  kind: Kind;
  amount: number | null;
  giftItem: string | null;
};

type Parsed = { ok: true; data: GiftInput } | { ok: false; error: string };

const fail = (error: string): Parsed => ({ ok: false, error });

export function parseGiftInput(body: unknown): Parsed {
  if (typeof body !== "object" || body === null) return fail("ভুল তথ্য পাঠানো হয়েছে");
  const b = body as Record<string, unknown>;

  const name = String(b.name ?? "").trim().replace(/\s+/g, " ");
  const village = String(b.village ?? "").trim().replace(/\s+/g, " ");
  if (!name) return fail("নাম লিখুন");
  if (name.length > 100) return fail("নাম খুব বড় হয়ে গেছে");
  if (!village) return fail("গ্রামের নাম লিখুন");
  if (village.length > 100) return fail("গ্রামের নাম খুব বড় হয়ে গেছে");

  if (b.kind === "cash") {
    const raw = toEnglishDigits(String(b.amount ?? "")).replace(/[,\s]/g, "");
    const amount = Number(raw);
    if (!raw || !Number.isInteger(amount) || amount < 1 || amount > 100_000_000) {
      return fail("সঠিক টাকার পরিমাণ লিখুন");
    }
    return { ok: true, data: { name, village, kind: "cash", amount, giftItem: null } };
  }

  if (b.kind === "gift") {
    const giftItem = String(b.giftItem ?? "").trim();
    if (!giftItem) return fail("উপহারের নাম লিখুন");
    if (giftItem.length > 200) return fail("উপহারের বর্ণনা খুব বড় হয়ে গেছে");
    return { ok: true, data: { name, village, kind: "gift", amount: null, giftItem } };
  }

  return fail("টাকা নাকি উপহার, একটি বেছে নিন");
}

// ILIKE প্যাটার্ন: ব্যবহারকারীর দেওয়া % _ \ কে সাধারণ অক্ষর হিসেবে ধরা হয়
export const likePattern = (s: string) =>
  `%${s.trim().replace(/[\\%_]/g, (m) => "\\" + m)}%`;
