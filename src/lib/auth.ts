import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "admin_session";
export const MAX_AGE = 60 * 60 * 12; // ১২ ঘণ্টা

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET সেট করা নেই");
  return new TextEncoder().encode(s);
};

export async function createSession() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token?: string) {
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}
