import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const cell = (v: string | number | null) => {
  const s = v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const rows = await prisma.gift.findMany({ orderBy: { id: "asc" } });

  const lines = [["সিরিয়াল", "নাম", "গ্রামের নাম", "ধরন", "টাকা", "উপহার"].join(",")];
  rows.forEach((r, i) => {
    lines.push(
      [i + 1, r.name, r.village, r.kind === "cash" ? "টাকা" : "উপহার", r.amount, r.giftItem]
        .map(cell)
        .join(",")
    );
  });

  return new Response("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="khatna-list.csv"',
    },
  });
}