import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

const COOKIE_NAME = "nl_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// AUTH_SECRET signs the admin session cookie. A dev fallback keeps the
// portal runnable out-of-the-box; set AUTH_SECRET in production.
const SECRET =
  process.env.AUTH_SECRET ?? "nl-dev-insecure-secret-manager-7f2a";

export type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function encodeSession(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function decodeSession(value: string | undefined): AdminSession | null {
  if (!value) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const provided = Buffer.from(sig);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as AdminSession;
    return parsed.id && parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE_NAME)?.value);
}

type AdminCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

let cookieOptions: AdminCookieOptions | undefined;

export function adminCookieOptions(): AdminCookieOptions {
  if (!cookieOptions) {
    cookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE,
    };
  }
  return cookieOptions;
}

export function adminCookieName() {
  return COOKIE_NAME;
}