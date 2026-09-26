import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  adminCookieName,
  adminCookieOptions,
  createSession,
  encodeSession,
} from "@/lib/admin-auth";
import {
  getLoginRedirect,
  getSafeLoginRedirect,
  isAdminPath,
} from "@/lib/auth-redirect";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().regex(/^\S+@\S+\.\S+$/),
  password: z.string().min(1),
  remember: z.boolean().default(true),
  next: z.string().optional(),
});

type LoginOptions = {
  adminOnly?: boolean;
};

export async function handleLogin(
  request: Request,
  options: LoginOptions = {},
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please enter your email and password." },
      { status: 422 },
    );
  }

  const { email, password, remember, next } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const safeNext = getSafeLoginRedirect(next);
  const wantsAdmin =
    options.adminOnly || (safeNext !== null && isAdminPath(safeNext));
  if (wantsAdmin && user.role !== "ADMIN") {
    return NextResponse.json(
      {
        ok: false,
        error: "Admin access required. This account cannot open the console.",
      },
      { status: 403 },
    );
  }

  const redirectTo = options.adminOnly
    ? safeNext && isAdminPath(safeNext)
      ? safeNext
      : "/admin/dashboard"
    : getLoginRedirect(safeNext, user.role);
  const normalizedEmail = user.email.trim().toLowerCase();
  const session = createSession({
    id: user.id,
    name: user.name,
    email: normalizedEmail,
    role: user.role,
  });

  const res = NextResponse.json({
    ok: true,
    name: user.name,
    email: normalizedEmail,
    role: user.role,
    accountType: user.accountType,
    redirectTo,
  });
  res.cookies.set(
    adminCookieName(),
    encodeSession(session),
    adminCookieOptions(remember),
  );
  return res;
}
