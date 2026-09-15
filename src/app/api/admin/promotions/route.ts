import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const promoSchema = z.object({
  code: z.string().min(2).max(20),
  title: z.string().min(1).max(120),
  description: z.string().max(200).optional().or(z.literal("")),
  discountPct: z.coerce.number().min(0).max(100),
  minDays: z.coerce.number().int().min(1),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const promotions = await prisma.promotion.findMany({
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      discountPct: true,
      minDays: true,
      endsAt: true,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const redemptions = await prisma.booking.groupBy({
    by: ["promoCode"],
    _count: { _all: true },
    where: { promoCode: { not: null } },
  });
  const redeemedByCode = new Map(
    redemptions.map((r) => [r.promoCode, r._count._all])
  );

  const rows = promotions.map((p) => ({
    id: p.id,
    code: p.code,
    title: p.title,
    description: p.description,
    discount: p.discountPct ? p.discountPct + "%" : "—",
    redeemed: redeemedByCode.get(p.code) ?? 0,
    till: p.endsAt,
    isActive: p.isActive,
  }));

  return NextResponse.json({ ok: true, offers: rows });
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
  const parsed = promoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please enter a code and title." }, { status: 422 });
  }
  const data = parsed.data;
  const code = data.code.toUpperCase();

  const exists = await prisma.promotion.findUnique({ where: { code } });
  if (exists) {
    return NextResponse.json({ ok: false, error: "A promo code with this name already exists." }, { status: 409 });
  }

  const promo = await prisma.promotion.create({
    data: {
      code,
      title: data.title,
      description: data.description || null,
      discountPct: data.discountPct,
      minDays: data.minDays,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      isActive: data.isActive ?? true,
    },
  });
  return NextResponse.json({ ok: true, offer: { id: promo.id, code: promo.code } }, { status: 201 });
}