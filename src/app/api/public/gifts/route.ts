import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { likePattern } from "@/lib/gifts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type PublicRow = {
  serial: number;
  name: string;
  village: string;
  kind: "cash" | "gift";
  amount: number | null;
  giftItem: string | null;
};

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

  const countRows = await prisma.$queryRaw<{ n: number }[]>`
    SELECT count(*)::int AS n FROM gifts ${where}`;
  const total = countRows[0].n;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requested, totalPages);

  const rows = await prisma.$queryRaw<PublicRow[]>`
    SELECT serial, name, village, kind, amount, "giftItem" FROM (
      SELECT name, village, kind::text AS kind, amount,
             gift_item AS "giftItem",
             ROW_NUMBER() OVER (ORDER BY id)::int AS serial
      FROM gifts
    ) t
    ${where}
    ORDER BY serial
    LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`;

  return NextResponse.json({ rows, total, page, totalPages });
}