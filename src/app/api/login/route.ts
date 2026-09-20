import { NextResponse } from "next/server";
import { COOKIE, MAX_AGE, createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");

  const okUser = username === (process.env.ADMIN_USERNAME ?? "");
  const okPass = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH ?? "");

  if (!okUser || !okPass) {
    await new Promise((r) => setTimeout(r, 600)); // ঘনঘন ভুল চেষ্টা ধীর করে
    return NextResponse.json({ error: "নাম বা পাসওয়ার্ড ঠিক নয়" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}
