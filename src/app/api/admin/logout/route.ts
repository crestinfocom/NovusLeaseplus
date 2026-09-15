import { NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  return res;
}