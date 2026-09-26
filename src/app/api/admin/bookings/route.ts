import { randomInt } from "node:crypto";
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

const bookingSchema = z.object({
  userId: z.string().min(1),
  carId: z.string().min(1),
  bookingType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "SUBSCRIPTION"]),
  status: z.enum(BOOKING_STATUSES),
  startDate: bookingDateSchema,
  endDate: bookingDateSchema,
  amount: z.coerce.number().min(0),
});

const REFERENCE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const REFERENCE_LENGTH = 5;
const MAX_REFERENCE_ATTEMPTS = 20;

function createBookingReference(): string {
  let suffix = "";
  for (let index = 0; index < REFERENCE_LENGTH; index += 1) {
    suffix += REFERENCE_ALPHABET[randomInt(0, REFERENCE_ALPHABET.length)];
  }
  return `B${suffix}`;
}

function isReferenceCollision(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  return (error as { code?: unknown }).code === "P2002";
}

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const bookings = await prisma.booking.findMany({
    select: {
      id: true,
      bookingRef: true,
      bookingType: true,
      status: true,
      startDate: true,
      endDate: true,
      totalAmount: true,
      baseAmount: true,
      discountAmount: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
      car: { select: { id: true, name: true } },
      city: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, bookings });
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

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please fill in all required booking fields." },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  if (endDate <= startDate) {
    return NextResponse.json(
      { ok: false, error: "End date must be after start date." },
      { status: 422 },
    );
  }

  const [user, car] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.userId } }),
    prisma.car.findUnique({ where: { id: data.carId } }),
  ]);
  if (!user || !car) {
    return NextResponse.json(
      { ok: false, error: "Customer or car not found." },
      { status: 404 },
    );
  }

  const city = await prisma.city.findFirst({ orderBy: { name: "asc" } });
  if (!city) {
    return NextResponse.json(
      { ok: false, error: "No city configured yet." },
      { status: 409 },
    );
  }

  for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
    const bookingRef = createBookingReference();
    const existing = await prisma.booking.findFirst({
      where: { bookingRef: { equals: bookingRef, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) continue;

    try {
      const booking = await prisma.booking.create({
        data: {
          bookingRef,
          userId: data.userId,
          carId: data.carId,
          cityId: city.id,
          bookingType: data.bookingType,
          status: data.status,
          startDate,
          endDate,
          baseAmount: data.amount,
          discountAmount: 0,
          totalAmount: data.amount,
        },
      });
      return NextResponse.json(
        { ok: true, booking: { id: booking.id, bookingRef: booking.bookingRef } },
        { status: 201 },
      );
    } catch (error) {
      if (!isReferenceCollision(error)) throw error;
    }
  }

  return NextResponse.json(
    { ok: false, error: "Could not allocate a booking reference. Please try again." },
    { status: 500 },
  );
}
