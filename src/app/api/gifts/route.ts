import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { likePattern, parseGiftInput } from "@/lib/gifts";
import type { Gift, ListResponse } from "@/lib/types";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const name = (sp.get("name") ?? "").trim();
  const village = (sp.get("village") ?? "").trim();
  const requested = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);

  const conds: Prisma.Sql[] = [];
  if (name) conds.push(Prisma.sql`name ILIKE ${likePattern(name)}`);
  if (village) conds.push(Prisma.sql`village ILIKE ${likePattern(village)}`);
  const where = conds.length
    ? Prisma.sql`WHERE ${Prisma.join(conds, " AND ")}`
    : Prisma.empty;

  const [countRows, cashCount, giftCount, sum, total] = await Promise.all([
    prisma.$queryRaw<{ n: number }[]>`SELECT count(*)::int AS n FROM gifts ${where}`,
    prisma.gift.count({ where: { kind: "cash" } }),
    prisma.gift.count({ where: { kind: "gift" } }),
    prisma.gift.aggregate({ _sum: { amount: true } }),
    prisma.gift.count(),
  ]);

  const filteredTotal = countRows[0].n;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(requested, totalPages);

  // সিরিয়াল সবসময় পুরো তালিকার ক্রম অনুযায়ী
  const rows = await prisma.$queryRaw<Gift[]>`
    SELECT * FROM (
      SELECT id, name, village, kind::text AS kind, amount,
             gift_item AS "giftItem",
             ROW_NUMBER() OVER (ORDER BY id)::int AS serial
      FROM gifts
    ) t
    ${where}
    ORDER BY id
    LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`;

  const body: ListResponse = {
    rows,
    total: filteredTotal,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    stats: { total, cashCount, giftCount, totalAmount: sum._sum.amount ?? 0 },
  };
  return NextResponse.json(body);
}

export async function POST(req: Request) {
  const parsed = parseGiftInput(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const created = await prisma.gift.create({
    data: parsed.data,
    select: { id: true },
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}