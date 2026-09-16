// NovusLease+ seed script (Neon PostgreSQL)
// Run with: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes("USER:PASSWORD")) {
  console.error(
    "✗ DATABASE_URL is not configured. Add your Neon connection string to .env before seeding."
  );
  console.error(
    "  Copy .env.example → .env and set DATABASE_URL, then retry."
  );
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Unique password per seeded account/role.
const ACCOUNT_PASSWORDS = {
  "admin@novuslease.in": "Nova@admin1",
  "operations@novuslease.in": "Nova@ops2024",
  "individual@novuslease.in": "Nova@user1",
  "corporate@novuslease.in": "Nova@corp1",
  "personaldriver@novuslease.in": "Nova@pdrive1",
  "commercialdriver@novuslease.in": "Nova@cdrive1",
  "ananya.rao@novuslease.in": "Nova@ananya1",
  "rohit.sharma@novuslease.in": "Nova@rohit1",
  "vikram.singh@novuslease.in": "Nova@vikram1",
  "sneha.patel@novuslease.in": "Nova@sneha1",
};

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 86400000);
}

async function seedDemoUsers() {
  const demoUsers = [
    {
      email: "admin@novuslease.in",
      name: "Deepak Kumar",
      phone: "9812345670",
      role: "ADMIN",
      accountType: "INDIVIDUAL",
      kycStatus: "NOT_REQUIRED",
      operatingCity: "Bengaluru",
    },
    {
      email: "operations@novuslease.in",
      name: "Neha Kapoor",
      phone: "9812345671",
      role: "OPERATIONS",
      accountType: "INDIVIDUAL",
      kycStatus: "NOT_REQUIRED",
      operatingCity: "Bengaluru",
    },
    {
      email: "individual@novuslease.in",
      name: "Aarav Sharma",
      phone: "9876543210",
      accountType: "INDIVIDUAL",
      operatingCity: "Bengaluru",
    },
    {
      email: "corporate@novuslease.in",
      name: "Priya Nair",
      phone: "9880765432",
      accountType: "CORPORATE",
      companyName: "Acme Logistics Pvt. Ltd.",
      gstin: "27ABCDE1234F1Z5",
      operatingCity: "Mumbai",
    },
    {
      email: "personaldriver@novuslease.in",
      name: "Rohan Verma",
      phone: "9765432109",
      accountType: "PERSONAL_DRIVER",
      licenceNumber: "MH01 2021 0001",
      licenceExpiry: new Date("2028-01-01"),
      operatingCity: "Mumbai",
    },
    {
      email: "commercialdriver@novuslease.in",
      name: "Suresh Kumar",
      phone: "9654321098",
      accountType: "COMMERCIAL_DRIVER",
      licenceNumber: "DL-04 2022 00321",
      licenceClass: "Transport",
      yearsExperience: 6,
      operatingCity: "Bengaluru",
    },
    // Customer personas shown in the admin Customers view.
    {
      email: "ananya.rao@novuslease.in",
      name: "Ananya Rao",
      phone: "9845011223",
      accountType: "INDIVIDUAL",
      operatingCity: "Bengaluru",
    },
    {
      email: "rohit.sharma@novuslease.in",
      name: "Rohit Sharma",
      phone: "9986044556",
      accountType: "INDIVIDUAL",
      operatingCity: "Mumbai",
    },
    {
      email: "vikram.singh@novuslease.in",
      name: "Vikram Singh",
      phone: "9740033221",
      accountType: "INDIVIDUAL",
      kycStatus: "PENDING",
      operatingCity: "Delhi NCR",
    },
    {
      email: "sneha.patel@novuslease.in",
      name: "Sneha Patel",
      phone: "9635099001",
      accountType: "INDIVIDUAL",
      operatingCity: "Ahmedabad",
    },
  ];

  const byEmail = {};
  for (const user of demoUsers) {
    const { email, ...rest } = user;
    const password = ACCOUNT_PASSWORDS[email];
    const passwordHash = hashPassword(password);
    const created = await prisma.user.upsert({
      where: { email },
      update: { ...rest, passwordHash },
      create: { ...rest, passwordHash, email },
    });
    byEmail[email] = created;
    const role = created.role ?? "CUSTOMER";
    console.log(`✓ ${role} — ${created.email}  (password: ${password})`);
  }
  return byEmail;
}

async function seedDemoBookings(users) {
  const bengaluru = await prisma.city.findUnique({ where: { name: "Bengaluru" } });
  const cityId = bengaluru?.id ?? null;
  const cars = await prisma.car.findMany({ select: { slug: true, id: true } });
  const carBySlug = new Map(cars.map((c) => [c.slug, c.id]));

  const demoBookings = [
    {
      ref: "B1042",
      userId: users["ananya.rao@novuslease.in"].id,
      car: "hyundai-creta",
      status: "CONFIRMED",
      start: daysFromNow(-14),
      end: daysFromNow(76),
      amount: 75150,
    },
    {
      ref: "B1041",
      userId: users["corporate@novuslease.in"].id,
      car: "toyota-innova-crysta",
      status: "CONFIRMED",
      start: daysFromNow(-46),
      end: daysFromNow(44),
      amount: 136400,
    },
    {
      ref: "B1040",
      userId: users["rohit.sharma@novuslease.in"].id,
      car: "maruti-swift",
      status: "PENDING",
      start: daysFromNow(-25),
      end: daysFromNow(3),
      amount: 15600,
    },
    {
      ref: "B1039",
      userId: users["sneha.patel@novuslease.in"].id,
      car: "executive-sedan",
      status: "CONFIRMED",
      start: daysFromNow(-62),
      end: daysFromNow(28),
      amount: 67200,
    },
    {
      ref: "B1038",
      userId: users["vikram.singh@novuslease.in"].id,
      car: "executive-sedan",
      status: "COMPLETED",
      start: daysFromNow(-92),
      end: daysFromNow(-85),
      amount: 12400,
    },
    {
      ref: "B1037",
      userId: users["ananya.rao@novuslease.in"].id,
      car: "maruti-swift",
      status: "CANCELLED",
      start: daysFromNow(-122),
      end: daysFromNow(-118),
      amount: 8300,
    },
  ];

  // Tidy any earlier demo bookings for these accounts that we don't seed now.
  const refs = demoBookings.map((b) => b.ref);
  const userIds = [...new Set(demoBookings.map((b) => b.userId))];
  await prisma.booking.deleteMany({
    where: { userId: { in: userIds }, bookingRef: { notIn: refs } },
  });

  for (const b of demoBookings) {
    const carId = carBySlug.get(b.car);
    if (!carId || !cityId) continue;
    const body = {
      userId: b.userId,
      carId,
      cityId,
      bookingType: "MONTHLY",
      status: b.status,
      startDate: b.start,
      endDate: b.end,
      deliveryType: "PICKUP",
      kmPackage: "KM120",
      baseAmount: b.amount,
      discountAmount: 0,
      totalAmount: b.amount,
    };
    const created = await prisma.booking.upsert({
      where: { bookingRef: b.ref },
      update: body,
      create: { ...body, bookingRef: b.ref },
    });
    console.log(`✓ demo booking ${created.bookingRef} (${b.status})`);
  }
}

async function cleanTestRecords() {
  // Remove users created by E2E signup tests (unique emails containing
  // "@example.com" or "@acme.in" that are NOT seeded demo accounts).
  const seededEmails = Object.keys(ACCOUNT_PASSWORDS);
  const testUsers = await prisma.user.findMany({
    where: {
      email: { notIn: seededEmails },
      OR: [{ email: { contains: "@example.com" } }, { email: { contains: "@acme.in" } }],
    },
    select: { id: true },
  });
  if (testUsers.length > 0) {
    const ids = testUsers.map((u) => u.id);
    await prisma.booking.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    console.log(`✓ cleaned ${ids.length} test user(s) and their bookings`);
  }
}

async function main() {
  console.log("Seeding NovusLease+ …");

  await cleanTestRecords();
  const users = await seedDemoUsers();

  // Cities
  const cities = await prisma.city.createMany({
    data: [
      { name: "Bengaluru", state: "Karnataka" },
      { name: "Mumbai", state: "Maharashtra" },
      { name: "Delhi NCR", state: "Delhi" },
      { name: "Hyderabad", state: "Telangana" },
      { name: "Chennai", state: "Tamil Nadu" },
      { name: "Pune", state: "Maharashtra" },
      { name: "Kochi", state: "Kerala" },
      { name: "Ahmedabad", state: "Gujarat" },
    ],
    skipDuplicates: true,
  });
  console.log(`✓ ${cities.count} cities`);

  const bengaluru = await prisma.city.findUnique({ where: { name: "Bengaluru" } });

  // Affordable car models matching the homepage fleet
  const carsData = [
    {
      slug: "maruti-swift",
      regNo: "KA01AB1234",
      name: "Maruti Swift",
      brand: "Maruti Suzuki",
      category: "HATCHBACK",
      seats: 5,
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      rentalRateHour: 60,
      monthlySubscription: 16000,
      onroadPrice: 800000,
      isFeatured: true,
      imageUrl: "/images/swift.jpg",
      lease: { leasePct: 1.95, tenure: 3, residual: 45, depr: 15, insurance: 18000, maint: 2000, fuel: 6000 },
    },
    {
      slug: "hyundai-creta",
      regNo: "KA05CD5678",
      name: "Hyundai Creta",
      brand: "Hyundai",
      category: "SUV",
      seats: 5,
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      rentalRateHour: 95,
      monthlySubscription: 26000,
      onroadPrice: 1500000,
      isFeatured: true,
      imageUrl: "/images/creta.jpg",
      lease: { leasePct: 1.67, tenure: 3, residual: 50, depr: 14, insurance: 28000, maint: 3000, fuel: 8000 },
    },
    {
      slug: "executive-sedan",
      regNo: "KA02GH3456",
      name: "Executive Sedan",
      brand: "Tata",
      category: "SEDAN",
      seats: 5,
      transmission: "AUTOMATIC",
      fuelType: "DIESEL",
      rentalRateHour: 140,
      monthlySubscription: 42000,
      onroadPrice: 4500000,
      isFeatured: true,
      imageUrl: "/images/sedan.jpg",
      lease: { leasePct: 1.4, tenure: 4, residual: 55, depr: 18, insurance: 70000, maint: 9000, fuel: 12000 },
    },
    {
      slug: "toyota-innova-crysta",
      regNo: "KA03EF9012",
      name: "Toyota Innova Crysta",
      brand: "Toyota",
      category: "MUV",
      seats: 7,
      transmission: "MANUAL",
      fuelType: "DIESEL",
      rentalRateHour: 120,
      monthlySubscription: 34000,
      onroadPrice: 2200000,
      isFeatured: true,
      imageUrl: "/images/innova.jpg",
      lease: { leasePct: 1.55, tenure: 4, residual: 52, depr: 13, insurance: 38000, maint: 4500, fuel: 11000 },
    },
  ];

  for (const car of carsData) {
    const { lease, ...rest } = car;
    const created = await prisma.car.upsert({
      where: { slug: car.slug },
      update: rest,
      create: {
        ...rest,
        leaseParams: { create: lease },
        cities: bengaluru ? { create: [{ cityId: bengaluru.id }] } : undefined,
      },
    });
    console.log(`✓ ${created.name}`);
  }

  // Promotions from the homepage + a festive offer for the admin Offers view
  // Always sync: upsert each promotion so titles/descriptions stay current.
  const promos = [
    { code: "NOVUS10", title: "1–3 rental days", description: "10% off quick weekend escapes", discountPct: 10, minDays: 1 },
    { code: "NOVUS15", title: "3–5 rental days", description: "15% off road trips", discountPct: 15, minDays: 3 },
    { code: "NOVUS20", title: "5+ days & subscriptions", description: "20% off extended drives", discountPct: 20, minDays: 5 },
    { code: "FESTIVE25", title: "Diwali special", description: "Flat 25% off flagship vehicles", discountPct: 25, minDays: 2, endsAt: daysFromNow(30) },
  ];
  for (const p of promos) {
    const { code, ...rest } = p;
    await prisma.promotion.upsert({
      where: { code },
      update: rest,
      create: { code, ...rest },
    });
  }
  console.log("✓ promotions NOVUS10 / NOVUS15 / NOVUS20 / FESTIVE25");

  await seedDemoBookings(users);

  console.log("Seeding complete.");
  console.log("Demo credentials (unique per role/account):");
  for (const [email, pw] of Object.entries(ACCOUNT_PASSWORDS)) {
    console.log(`  ${email.padEnd(34)} → ${pw}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });