import { pool } from "@/lib/db";

export const runtime = "nodejs";

const cell = (v: string | number | null) => {
  const s = v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const { rows } = await pool.query<{
    serial: number;
    name: string;
    village: string;
    kind: "cash" | "gift";
    amount: number | null;
    gift_item: string | null;
  }>(
    `SELECT ROW_NUMBER() OVER (ORDER BY id)::int AS serial,
            name, village, kind, amount, gift_item
     FROM gifts ORDER BY id`
  );

  const lines = [["সিরিয়াল", "নাম", "গ্রামের নাম", "ধরন", "টাকা", "উপহার"].join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.serial,
        r.name,
        r.village,
        r.kind === "cash" ? "টাকা" : "উপহার",
        r.amount,
        r.gift_item,
      ]
        .map(cell)
        .join(",")
    );
  }

  // BOM থাকায় Excel-এ বাংলা ঠিকমতো দেখায়
  return new Response("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="khatna-list.csv"',
    },
  });
}
