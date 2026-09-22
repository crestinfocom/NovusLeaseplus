import { NextResponse } from "next/server";
import { activeConnectionString, isLocalDb, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const mode = isLocalDb ? "local-docker" : "neon";
  const isPlaceholder = activeConnectionString.includes("USER:PASSWORD");

  if (isPlaceholder) {
    return NextResponse.json(
      {
        status: "error",
        mode,
        message: isLocalDb
          ? "DATABASE_URL_LOCAL is not configured and no local fallback applies."
          : "DATABASE_URL is not configured. Add your Neon PostgreSQL connection string to .env",
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      provider: "postgresql",
      mode,
      time: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        mode,
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}