import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  userId: z.string().min(1),
  carId: z.string().min(1),
  bookingType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "SUBSCRIPTION"]),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
  startDate: z.string(),
  endDate: z.string(),
  amount: z.coerce.number().min(0),
});

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
      { status: 422 }
    );
  }
  const data = parsed.data;

  const [user, car] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.userId } }),
    prisma.car.findUnique({ where: { id: data.carId } }),
  ]);
  if (!user || !car) {
    return NextResponse.json({ ok: false, error: "Customer or car not found." }, { status: 404 });
  }

  const city = await prisma.city.findFirst({ orderBy: { name: "asc" } });
  if (!city) {
    return NextResponse.json({ ok: false, error: "No city configured yet." }, { status: 409 });
  }

  const bookingRef = "B" + Date.now().toString(36).toUpperCase().slice(-6);
  const amount = data.amount;
  const booking = await prisma.booking.create({
    data: {
      bookingRef,
      userId: data.userId,
      carId: data.carId,
      cityId: city.id,
      bookingType: data.bookingType,
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      baseAmount: amount,
      discountAmount: 0,
      totalAmount: amount,
    },
  });

  return NextResponse.json({ ok: true, booking: { id: booking.id, bookingRef: booking.bookingRef } }, { status: 201 });
}