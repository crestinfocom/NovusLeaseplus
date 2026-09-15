import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  userId: z.string().min(1).optional(),
  carId: z.string().min(1).optional(),
  bookingType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "SUBSCRIPTION"]).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  amount: z.coerce.number().min(0).optional(),
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
    return NextResponse.json({ ok: false, error: "Invalid booking fields." }, { status: 422 });
  }

  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.userId) data.userId = parsed.data.userId;
  if (parsed.data.carId) data.carId = parsed.data.carId;
  if (parsed.data.bookingType) data.bookingType = parsed.data.bookingType;
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate);
  if (parsed.data.endDate) data.endDate = new Date(parsed.data.endDate);
  if (parsed.data.amount != null) {
    data.baseAmount = parsed.data.amount;
    data.totalAmount = parsed.data.amount;
  }

  const booking = await prisma.booking.update({ where: { id }, data });
  return NextResponse.json({ ok: true, booking: { id: booking.id, bookingRef: booking.bookingRef } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  try {
    await prisma.booking.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}