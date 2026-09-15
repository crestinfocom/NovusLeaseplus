import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, randomPassword } from "@/lib/password";
import { isClientAccountType, toPrismaAccountType } from "@/lib/account-type";

export const dynamic = "force-dynamic";

const signupSchema = z.object({
  accountType: z.string(),
  name: z.string().min(2).max(120),
  email: z.string().regex(/^\S+@\S+\.\S+$/),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: z.string().min(6).max(200).optional().or(z.literal("")),
  companyName: z.string().max(160).optional().or(z.literal("")),
  gstin: z.string().max(30).optional().or(z.literal("")),
  licenceNumber: z.string().max(40).optional().or(z.literal("")),
  licenceExpiry: z.string().optional().or(z.literal("")),
  licenceClass: z.string().max(60).optional().or(z.literal("")),
  experience: z.string().max(3).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the details you entered." },
      { status: 422 }
    );
  }

  const {
    accountType,
    name,
    email,
    phone,
    password,
    companyName,
    gstin,
    licenceNumber,
    licenceExpiry,
    licenceClass,
    experience,
    city,
  } = parsed.data;

  if (!isClientAccountType(accountType)) {
    return NextResponse.json(
      { ok: false, error: "Unknown account type." },
      { status: 422 }
    );
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { ok: false, error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  let expiry: Date | null = null;
  if (licenceExpiry) {
    const parsed = new Date(licenceExpiry);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { ok: false, error: "Invalid licence expiry date." },
        { status: 422 }
      );
    }
    expiry = parsed;
  }

  const user = await prisma.user.create({
    data: {
      accountType: toPrismaAccountType(accountType),
      name,
      companyName: companyName || null,
      gstin: gstin || null,
      phone: phone || null,
      licenceNumber: licenceNumber || null,
      licenceExpiry: expiry,
      licenceClass: licenceClass || null,
      yearsExperience: experience ? Number(experience) : null,
      operatingCity: city || null,
      email,
      passwordHash: hashPassword(password || randomPassword()),
    },
  });

  return NextResponse.json(
    {
      ok: true,
      accountType: user.accountType,
      name: user.name,
      email: user.email,
    },
    { status: 201 }
  );
}