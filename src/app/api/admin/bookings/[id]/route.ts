import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";
import { BOOKING_STATUSES } from "@/lib/terms";

export const dynamic = "force-dynamic";

function isValidDate(value: string): boolean {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const datePart = /^(\d{4}-\d{2}-\d{2})(?:$|T)/.exec(value)?.[1];
  if (datePart) {
    const dateOnly = new Date(`${datePart}T00:00:00.000Z`);
    return dateOnly.toISOString().slice(0, 10) === datePart;
  }
  return true;
}

const bookingDateSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isValidDate, "Enter a valid date.");

const updateSchema = z.object({
  userId: z.string().min(1).optional(),
  carId: z.string().min(1).optional(),
  bookingType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "SUBSCRIPTION"]).optional(),
  status: z.enum(BOOKING_STATUSES).optional(),
  startDate: bookingDateSchema.optional(),
  endDate: bookingDateSchema.optional(),
  amount: z.coerce.number().min(0).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
    return NextResponse.json(
      { ok: false, error: "Invalid booking fields." },
      { status: 422 },
    );
  }

  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
  }

  const data = parsed.data;
  const [user, car] = await Promise.all([
    data.userId
      ? prisma.user.findUnique({ where: { id: data.userId }, select: { id: true } })
      : null,
    data.carId
      ? prisma.car.findUnique({ where: { id: data.carId }, select: { id: true } })
      : null,
  ]);
  if ((data.userId && !user) || (data.carId && !car)) {
    return NextResponse.json(
      { ok: false, error: "Customer or car not found." },
      { status: 404 },
    );
  }

  const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
  const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;
  if (endDate <= startDate) {
    return NextResponse.json(
      { ok: false, error: "End date must be after start date." },
      { status: 422 },
    );
  }

  const update: Record<string, unknown> = {};
  if (data.userId !== undefined) update.userId = data.userId;
  if (data.carId !== undefined) update.carId = data.carId;
  if (data.bookingType !== undefined) update.bookingType = data.bookingType;
  if (data.status !== undefined) update.status = data.status;
  if (data.startDate !== undefined) update.startDate = startDate;
  if (data.endDate !== undefined) update.endDate = endDate;
  if (data.amount !== undefined) {
    update.baseAmount = data.amount;
    update.totalAmount = data.amount;
  }

  try {
    const booking = await prisma.booking.update({ where: { id }, data: update });
    return NextResponse.json({
      ok: true,
      booking: { id: booking.id, bookingRef: booking.bookingRef },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Booking could not be updated." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
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
