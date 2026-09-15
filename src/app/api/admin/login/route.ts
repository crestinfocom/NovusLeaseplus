import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  adminCookieName,
  adminCookieOptions,
  encodeSession,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().regex(/^\S+@\S+\.\S+$/),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please enter your email and password." },
      { status: 422 }
    );
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      {
        ok: false,
        error: "Admin access required. This account cannot open the console.",
      },
      { status: 403 }
    );
  }

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const res = NextResponse.json({
    ok: true,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  res.cookies.set(adminCookieName(), encodeSession(session), adminCookieOptions());
  return res;
}