import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  bookingTypeLabel,
  bookingStatusLabel,
  statusJourney,
} from "@/lib/terms";

export const dynamic = "force-dynamic";

// Public, read-only lookup by booking reference so customers can check their
// application / booking status without logging in (UX gap 5).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = (searchParams.get("ref") ?? "").trim().toUpperCase();

  if (!ref) {
    return NextResponse.json(
      { ok: false, error: "Please enter your booking reference." },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingRef: ref },
    select: {
      bookingRef: true,
      bookingType: true,
      status: true,
      startDate: true,
      endDate: true,
      totalAmount: true,
      baseAmount: true,
      discountAmount: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
      car: { select: { id: true, name: true } },
      city: { select: { id: true, name: true } },
    },
  });

  if (!booking) {
    return NextResponse.json(
      { ok: false, error: "No booking found with that reference. Check the reference and try again." },
      { status: 404 }
    );
  }

  const journey = statusJourney(booking.status);

  return NextResponse.json({
    ok: true,
    booking: {
      ref: booking.bookingRef,
      type: booking.bookingType,
      typeLabel: bookingTypeLabel(booking.bookingType),
      status: booking.status,
      statusLabel: bookingStatusLabel(booking.status),
      journey: {
        label: journey.label,
        steps: journey.steps,
        isDone: ["COMPLETED", "RETURNED", "CANCELLED"].includes(booking.status),
      },
      carName: booking.car.name,
      city: booking.city.name,
      startDate: booking.startDate.toISOString().slice(0, 10),
      endDate: booking.endDate.toISOString().slice(0, 10),
      baseAmount: Number(booking.baseAmount),
      discountAmount: Number(booking.discountAmount),
      totalAmount: Number(booking.totalAmount),
      customerName: booking.user.name,
      createdAt: booking.createdAt.toISOString().slice(0, 10),
    },
  });
}