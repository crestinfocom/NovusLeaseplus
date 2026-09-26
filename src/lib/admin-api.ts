import { NextResponse } from "next/server";
import { getAdminSession, type AdminSession } from "@/lib/admin-auth";

export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not signed in. Please sign in to continue." },
      { status: 401 }
    );
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json(
      {
        ok: false,
        error: "Admin access required. This account cannot open the console.",
      },
      { status: 403 }
    );
  }
  return session;
}

export function isSession(
  value: AdminSession | NextResponse
): value is AdminSession {
  return !(value instanceof NextResponse);
}