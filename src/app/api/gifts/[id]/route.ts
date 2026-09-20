import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseGiftInput } from "@/lib/gifts";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function readId(ctx: Ctx) {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(req: Request, ctx: Ctx) {
  const id = await readId(ctx);
  if (id === null) return NextResponse.json({ error: "ভুল আইডি" }, { status: 400 });

  const parsed = parseGiftInput(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const res = await prisma.gift.updateMany({ where: { id }, data: parsed.data });
  if (res.count === 0) return NextResponse.json({ error: "এন্ট্রি পাওয়া যায়নি" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const id = await readId(ctx);
  if (id === null) return NextResponse.json({ error: "ভুল আইডি" }, { status: 400 });

  const res = await prisma.gift.deleteMany({ where: { id } });
  if (res.count === 0) return NextResponse.json({ error: "এন্ট্রি পাওয়া যায়নি" }, { status: 404 });
  return NextResponse.json({ ok: true });
}