import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

const forgotSchema = z.object({
  email: z.string().regex(/^\S+@\S+\.\S+$/),
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

  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 422 }
    );
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Demo reset — no email provider wired up yet. In production this would
    // email a signed reset link instead.
    const token = randomPassword(20);
    console.log(`[forgot-password] reset token for ${email}: ${token}`);
  }

  // Always respond the same to avoid leaking which emails have accounts.
  return NextResponse.json({
    ok: true,
    message:
      "If an account exists for that email, a password reset link has been sent.",
  });
}