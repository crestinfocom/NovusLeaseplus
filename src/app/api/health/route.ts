import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasUrl = Boolean(process.env.DATABASE_URL);
  if (!hasUrl || process.env.DATABASE_URL?.includes("USER:PASSWORD")) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "DATABASE_URL is not configured. Add your Neon PostgreSQL connection string to .env",
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
      time: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}