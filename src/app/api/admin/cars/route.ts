import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["CONFIRMED", "PICKED_UP"];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function bookedDays(start: Date, end: Date, today: Date): number {
  const from = new Date(today.getTime() - 365 * 86400000);
  const s = Math.max(start.getTime(), from.getTime());
  const e = Math.min(end.getTime(), today.getTime());
  return e > s ? (e - s) / 86400000 : 0;
}

function deriveStatus(
  car: { isAvailable: boolean; bookings: { status: string; endDate: Date }[] },
  today: Date
): "leased" | "available" | "maintenance" {
  if (!car.isAvailable) return "maintenance";
  const active = car.bookings.some(
    (b) =>
      ACTIVE_STATUSES.includes(b.status) && b.endDate.getTime() >= today.getTime()
  );
  return active ? "leased" : "available";
}

const carSchema = z.object({
  name: z.string().min(1).max(120),
  brand: z.string().min(1).max(60).optional(),
  regNo: z.string().min(1).max(20).optional(),
  category: z.enum(["HATCHBACK", "SEDAN", "SUV", "MUV", "LUXURY", "ELECTRIC"]),
  fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG"]),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]),
  seats: z.coerce.number().int().min(2).max(12),
  monthlySubscription: z.coerce.number().min(0),
  rentalRateHour: z.coerce.number().min(0),
  isAvailable: z.boolean().optional().or(z.boolean()),
  isFeatured: z.boolean().optional().or(z.boolean()),
});

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const today = new Date();
  const cars = await prisma.car.findMany({
    select: {
      id: true,
      slug: true,
      regNo: true,
      name: true,
      brand: true,
      category: true,
      fuelType: true,
      seats: true,
      transmission: true,
      monthlySubscription: true,
      rentalRateHour: true,
      isFeatured: true,
      isAvailable: true,
      bookings: { select: { status: true, startDate: true, endDate: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows = cars.map((car) => {
    const util = Math.round(
      Math.min(
        100,
        car.bookings.reduce((s, b) => s + bookedDays(b.startDate, b.endDate, today), 0)
      )
    );
    return {
      id: car.id,
      slug: car.slug,
      regNo: car.regNo,
      name: car.name,
      brand: car.brand,
      category: car.category,
      fuelType: car.fuelType,
      seats: car.seats,
      transmission: car.transmission,
      lease: Number(car.monthlySubscription),
      hourly: Number(car.rentalRateHour),
      featured: car.isFeatured,
      status: deriveStatus(car, today),
      util,
    };
  });

  return NextResponse.json({ ok: true, cars: rows });
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
  const parsed = carSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please fill in all required car fields." }, { status: 422 });
  }
  const data = parsed.data;

  let slug = slugify(data.name);
  const existing = await prisma.car.findUnique({ where: { slug } });
  if (existing) slug = slug + "-" + Date.now().toString(36).slice(-4);

  const city = await prisma.city.findFirst({ orderBy: { name: "asc" } });

  const car = await prisma.car.create({
    data: {
      slug,
      name: data.name,
      brand: data.brand ?? "NovusLease",
      regNo: data.regNo ?? null,
      category: data.category,
      fuelType: data.fuelType,
      transmission: data.transmission,
      seats: data.seats,
      monthlySubscription: data.monthlySubscription,
      rentalRateHour: data.rentalRateHour,
      onroadPrice: 0,
      isAvailable: data.isAvailable ?? true,
      isFeatured: data.isFeatured ?? false,
      cities: city ? { create: [{ cityId: city.id }] } : undefined,
    },
  });
  return NextResponse.json({ ok: true, car: { id: car.id, slug: car.slug, name: car.name } }, { status: 201 });
}