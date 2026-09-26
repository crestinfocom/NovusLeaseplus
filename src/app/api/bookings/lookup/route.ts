import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  bookingTypeLabel,
  bookingStatusLabel,
  normalizeBookingReference,
  statusJourney,
} from "@/lib/terms";

export const dynamic = "force-dynamic";

const LOOKUP_UNAVAILABLE =
  "Booking lookup is temporarily unavailable. Please try again shortly.";

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

async function findBooking(ref: string) {
  return prisma.booking.findFirst({
    where: { bookingRef: { equals: ref, mode: "insensitive" } },
    select: {
      bookingRef: true,
      bookingType: true,
      status: true,
      startDate: true,
      endDate: true,
      totalAmount: true,
      discountAmount: true,
      car: { select: { name: true } },
      city: { select: { name: true } },
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawRef = searchParams.get("ref") ?? "";

  if (!rawRef.trim()) {
    return json(
      { ok: false, error: "Please enter your booking reference." },
      400,
    );
  }

  const ref = normalizeBookingReference(rawRef);
  if (!ref) {
    return json(
      { ok: false, error: "Enter a valid booking reference." },
      400,
    );
  }

  let booking: Awaited<ReturnType<typeof findBooking>>;
  try {
    booking = await findBooking(ref);
  } catch {
    return json({ ok: false, error: LOOKUP_UNAVAILABLE }, 503);
  }

  if (!booking) {
    return json(
      {
        ok: false,
        error:
          "No booking found with that reference. Check the reference and try again.",
      },
      404,
    );
  }

  const journey = statusJourney(booking.status);

  return json(
    {
      ok: true,
      booking: {
        ref: booking.bookingRef.toUpperCase(),
        typeLabel: bookingTypeLabel(booking.bookingType),
        status: booking.status,
        statusLabel: bookingStatusLabel(booking.status),
        journey: {
          ...journey,
          steps: journey.nextActions,
          isDone: journey.terminal,
        },
        carName: booking.car.name,
        city: booking.city.name,
        startDate: booking.startDate.toISOString().slice(0, 10),
        endDate: booking.endDate.toISOString().slice(0, 10),
        discountAmount: Number(booking.discountAmount),
        totalAmount: Number(booking.totalAmount),
      },
    },
    200,
  );
}
