import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { likePattern, parseGiftInput } from "@/lib/gifts";
import type { Gift, ListResponse, Stats } from "@/lib/types";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const name = (sp.get("name") ?? "").trim();
  const village = (sp.get("village") ?? "").trim();
  const requested = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);

  const conds: string[] = [];
  const params: unknown[] = [];
  if (name) {
    params.push(likePattern(name));
    conds.push(`name ILIKE $${params.length}`);
  }
  if (village) {
    params.push(likePattern(village));
    conds.push(`village ILIKE $${params.length}`);
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  const [countRes, statsRes] = await Promise.all([
    pool.query<{ n: number }>(`SELECT count(*)::int AS n FROM gifts ${where}`, params),
    pool.query<Stats>(
      `SELECT count(*)::int AS "total",
              (count(*) FILTER (WHERE kind = 'cash'))::int AS "cashCount",
              (count(*) FILTER (WHERE kind = 'gift'))::int AS "giftCount",
              COALESCE(sum(amount), 0)::float8 AS "totalAmount"
       FROM gifts`
    ),
  ]);

  const total = countRes.rows[0].n;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requested, totalPages);

  // সিরিয়াল সবসময় পুরো তালিকার ক্রম অনুযায়ী (সার্চ করলেও বদলায় না)
  const rowsRes = await pool.query<Gift>(
    `SELECT * FROM (
       SELECT id, name, village, kind, amount, gift_item AS "giftItem",
              ROW_NUMBER() OVER (ORDER BY id)::int AS serial
       FROM gifts
     ) t
     ${where}
     ORDER BY id
     LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    params
  );

  const body: ListResponse = {
    rows: rowsRes.rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    stats: statsRes.rows[0],
  };
  return NextResponse.json(body);
}

export async function POST(req: Request) {
  const parsed = parseGiftInput(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const d = parsed.data;
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO gifts (name, village, kind, amount, gift_item)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [d.name, d.village, d.kind, d.amount, d.giftItem]
  );
  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}
