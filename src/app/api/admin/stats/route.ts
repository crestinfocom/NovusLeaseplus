import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["CONFIRMED", "PICKED_UP"];

function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, n: number) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function pct(a: number, b: number): number {
  if (b <= 0) return a > 0 ? 100 : 0;
  return Math.round(((a - b) / b) * 1000) / 10;
}

// Days a booking occupies inside the trailing 365-day window.
function bookedDays(start: Date, end: Date, today: Date): number {
  const from = new Date(today.getTime() - 365 * 86400000);
  const s = start.getTime() > from.getTime() ? start : from;
  const e = end.getTime() < today.getTime() ? end : today;
  if (e <= s) return 0;
  return (e.getTime() - s.getTime()) / 86400000;
}

function carStatus(
  id: string,
  isAvailable: boolean,
  bookings: { status: string; endDate: Date }[],
  cutoff: Date
): "leased" | "available" | "maintenance" {
  if (!isAvailable) return "maintenance";
  const active = bookings.some(
    (b) => ACTIVE_STATUSES.includes(b.status) && b.endDate.getTime() >= cutoff.getTime()
  );
  return active ? "leased" : "available";
}

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const today = new Date();
  const startThisMonth = monthStart(today);
  const startLastMonth = addMonths(startThisMonth, -1);

  const rows = await prisma.booking.findMany({
    select: {
      id: true,
      bookingRef: true,
      status: true,
      totalAmount: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      car: { select: { name: true } },
    },
  });

  // ---- Revenue
  const revenue = rows
    .filter((b) => b.status !== "CANCELLED")
    .reduce((s, b) => s + Number(b.totalAmount), 0);
  const revenueMonth = (from: Date, to: Date) =>
    rows
      .filter(
        (b) =>
          b.status !== "CANCELLED" &&
          b.startDate.getTime() >= from.getTime() &&
          b.startDate.getTime() < to.getTime()
      )
      .reduce((s, b) => s + Number(b.totalAmount), 0);
  const revThis = revenueMonth(startThisMonth, addMonths(today, 1));
  const revLast = revenueMonth(startLastMonth, startThisMonth);
  const revDelta = pct(revThis, revLast);

  // ---- Chart: last 7 months
  const months: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const from = addMonths(startThisMonth, -i);
    const to = addMonths(from, 1);
    const label = from.toLocaleDateString("en-IN", { month: "short" });
    const value = rows
      .filter(
        (b) =>
          b.status !== "CANCELLED" &&
          b.startDate.getTime() >= from.getTime() &&
          b.startDate.getTime() < to.getTime()
      )
      .reduce((s, b) => s + Number(b.totalAmount), 0);
    months.push({ label, value });
  }

  // ---- Active bookings (ongoing)
  const activeNow = rows.filter(
    (b) => ACTIVE_STATUSES.includes(b.status) && b.endDate.getTime() >= today.getTime()
  ).length;

  // ---- Fleet
  const cars = await prisma.car.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      isAvailable: true,
      monthlySubscription: true,
      bookings: {
        select: { status: true, startDate: true, endDate: true },
      },
    },
  });

  const derived = cars.map((car) => {
    const util = Math.round(
      Math.min(
        100,
        car.bookings.reduce((s, b) => s + bookedDays(b.startDate, b.endDate, today), 0)
      )
    );
    return { ...car, util };
  });

  const status = (c: (typeof derived)[number]) =>
    carStatus(c.id, c.isAvailable, c.bookings, today);

  const fleetStatus = { available: 0, leased: 0, maintenance: 0, retired: 0 };
  for (const c of derived) fleetStatus[status(c)]++;

  const leasedNow = fleetStatus.leased;
  const leasedPrev = cars.filter((c) =>
    c.bookings.some(
      (b) =>
        ACTIVE_STATUSES.includes(b.status) &&
        b.endDate.getTime() >= startLastMonth.getTime() &&
        b.endDate.getTime() < startThisMonth.getTime()
    )
  ).length;

  const totalCars = cars.length;
  const utilisation = totalCars
    ? Math.round(
        derived.reduce((s, c) => s + c.util, 0) / totalCars
      )
    : 0;

  // Average utilisation one month ago (bookings ending last month).
  const utilPrev = totalCars
    ? Math.round(
        cars
          .map((c) => {
            const days = c.bookings
              .filter(
                (b) =>
                  b.endDate.getTime() >= startLastMonth.getTime() &&
                  b.endDate.getTime() < startThisMonth.getTime()
              )
              .reduce(
                (s, b) =>
                  s +
                  (Math.min(b.endDate.getTime(), today.getTime()) -
                    Math.max(b.startDate.getTime(), startLastMonth.getTime())) /
                    86400000,
                0
              );
            return Math.min(100, days);
          })
          .reduce((s, d) => s + d, 0) / totalCars
      )
    : 0;

  const statCards = [
    {
      ic: "g",
      emoji: "💰",
      lbl: "Total revenue",
      num: revenue,
      chg:
        (revDelta >= 0 ? "▲ " : "▼ ") +
        Math.abs(revDelta).toFixed(1) +
        "%",
      up: revDelta >= 0,
    },
    {
      ic: "b",
      emoji: "▤",
      lbl: "Active bookings",
      num: activeNow,
      chg: activeNow > 0 ? "▲ " + activeNow + " ongoing" : "— none today",
      up: true,
    },
    {
      ic: "gr",
      emoji: "🚗",
      lbl: "Cars leased",
      num: leasedNow + " / " + totalCars,
      chg:
        leasedPrev <= leasedNow
          ? "▲ " + (leasedNow - leasedPrev) + " vs last mo"
          : "▼ " + (leasedPrev - leasedNow) + " vs last mo",
      up: leasedPrev <= leasedNow,
    },
    {
      ic: "a",
      emoji: "📊",
      lbl: "Fleet utilisation",
      num: utilisation + "%",
      chg:
        utilPrev > 0
          ? (utilisation >= utilPrev ? "▲ " : "▼ ") +
            Math.abs(utilisation - utilPrev).toFixed(1) +
            "%"
          : "▲ computed on bookings",
      up: utilisation >= utilPrev,
    },
  ];

  const recentBookings = [...rows]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((b) => ({
      id: b.bookingRef,
      customer: b.user.name,
      email: b.user.email,
      car: b.car.name,
      amount: Number(b.totalAmount),
      status: b.status,
      start: b.startDate,
      end: b.endDate,
    }));

  const topCars = [...derived]
    .sort((a, b) => b.util - a.util)
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      lease: Number(c.monthlySubscription),
      util: c.util,
    }));

  return NextResponse.json({
    ok: true,
    statCards,
    revenue: { labels: months.map((m) => m.label), values: months.map((m) => m.value) },
    recentBookings,
    fleetStatus,
    topCars,
    totalCars,
  });
}