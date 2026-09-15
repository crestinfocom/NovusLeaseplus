import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomPassword, hashPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const CANCELLED = new Set(["CANCELLED"]);

const customerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().regex(/^\S+@\S+\.\S+$/),
  phone: z.string().max(20).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
});

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const users = await prisma.user.findMany({
    where: { role: { notIn: ["ADMIN", "OPERATIONS"] } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      accountType: true,
      kycStatus: true,
      operatingCity: true,
      createdAt: true,
      bookings: { select: { status: true, totalAmount: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    accountType: u.accountType,
    kycStatus: u.kycStatus,
    city: u.operatingCity,
    bookings: u.bookings.length,
    ltv: u.bookings
      .filter((b) => !CANCELLED.has(b.status))
      .reduce((s, b) => s + Number(b.totalAmount), 0),
  }));

  return NextResponse.json({ ok: true, customers: rows });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please enter a name and a valid email." }, { status: 422 });
  }
  const data = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) {
    return NextResponse.json({ ok: false, error: "A customer with this email already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      operatingCity: data.city || null,
      kycStatus: "VERIFIED",
      passwordHash: hashPassword(randomPassword()),
    },
  });

  return NextResponse.json({ ok: true, customer: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
}