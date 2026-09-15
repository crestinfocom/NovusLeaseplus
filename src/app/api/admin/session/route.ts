import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  return NextResponse.json({ ok: true, session });
}