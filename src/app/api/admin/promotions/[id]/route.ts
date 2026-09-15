import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  code: z.string().min(2).max(20).optional(),
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(200).optional().or(z.literal("")),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  minDays: z.coerce.number().int().min(1).optional(),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
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
    return NextResponse.json({ ok: false, error: "Invalid promo code fields." }, { status: 422 });
  }

  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Promo code not found." }, { status: 404 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.code) data.code = String(data.code).toUpperCase();
  if (data.endsAt !== undefined) {
    data.endsAt = data.endsAt ? new Date(String(data.endsAt)) : null;
  }

  const promo = await prisma.promotion.update({ where: { id }, data });
  return NextResponse.json({ ok: true, offer: { id: promo.id, code: promo.code } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  try {
    await prisma.promotion.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Promo code not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}