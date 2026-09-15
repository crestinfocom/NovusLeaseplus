import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().regex(/^\S+@\S+\.\S+$/).optional(),
  phone: z.string().max(20).optional().or(z.literal("")).optional(),
  city: z.string().max(80).optional().or(z.literal("")),
  kycStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid customer fields." }, { status: 422 });
  }
  if (parsed.data.email) {
    const conflict = await prisma.user.findFirst({
      where: { email: parsed.data.email, id: { not: id } },
    });
    if (conflict) {
      return NextResponse.json({ ok: false, error: "Another customer already uses this email." }, { status: 409 });
    }
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.city !== undefined) data.operatingCity = data.city;
  delete data.city;

  try {
    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ ok: true, customer: { id: user.id, name: user.name } });
  } catch {
    return NextResponse.json({ ok: false, error: "Customer not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const bookings = await prisma.booking.count({ where: { userId: id } });
  if (bookings > 0) {
    return NextResponse.json(
      { ok: false, error: "This customer has bookings; reassign them before deleting." },
      { status: 409 }
    );
  }
  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Customer not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}