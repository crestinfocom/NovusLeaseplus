import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  category: z.enum(["HATCHBACK", "SEDAN", "SUV", "MUV", "LUXURY", "ELECTRIC"]).optional(),
  fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG"]).optional(),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]).optional(),
  seats: z.coerce.number().int().min(2).max(12).optional(),
  monthlySubscription: z.coerce.number().min(0).optional(),
  rentalRateHour: z.coerce.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
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
    return NextResponse.json({ ok: false, error: "Invalid car fields." }, { status: 422 });
  }

  const existing = await prisma.car.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Car not found." }, { status: 404 });
  }

  const data = { ...parsed.data };
  const car = await prisma.car.update({ where: { id }, data });
  return NextResponse.json({ ok: true, car: { id: car.id, name: car.name } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const bookings = await prisma.booking.count({ where: { carId: id } });
  if (bookings > 0) {
    return NextResponse.json(
      { ok: false, error: "This car has bookings; reassign them before deleting." },
      { status: 409 }
    );
  }
  try {
    await prisma.car.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Car not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}