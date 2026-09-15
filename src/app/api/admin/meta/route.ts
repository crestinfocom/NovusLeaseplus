import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// Dropdown sources used by the admin modals (new/edit booking etc.).
export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const [customers, cars, cities] = await Promise.all([
    prisma.user.findMany({
      where: { role: { notIn: ["ADMIN", "OPERATIONS"] } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.car.findMany({
      select: { id: true, name: true, brand: true },
      orderBy: { name: "asc" },
    }),
    prisma.city.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    customers: customers.map((c) => ({ id: c.id, name: c.name, email: c.email })),
    cars: cars.map((c) => ({ id: c.id, name: c.name, brand: c.brand })),
    cities: cities.map((c) => ({ id: c.id, name: c.name })),
  });
}