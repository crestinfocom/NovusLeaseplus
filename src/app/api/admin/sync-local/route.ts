import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { SyncError, syncFromNeon, syncState } from "@/lib/local-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  return NextResponse.json({ ok: true, ...syncState() });
}

export async function POST() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  try {
    const result = await syncFromNeon();
    return NextResponse.json({ ok: true, ...syncState(), ...result });
  } catch (error) {
    if (error instanceof SyncError) {
      return NextResponse.json(
        { ok: false, error: error.message, ...syncState() },
        { status: error.status }
      );
    }
    console.error("[sync-local]", error);
    return NextResponse.json(
      { ok: false, error: "Sync failed. Check the server logs.", ...syncState() },
      { status: 500 }
    );
  }
}