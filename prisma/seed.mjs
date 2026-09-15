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

const DEMO_PASSWORD = "demo1234";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function seedDemoUsers() {
  const passwordHash = hashPassword(DEMO_PASSWORD);
  const demoUsers = [
    {
      email: "individual@novuslease.in",
      name: "Aarav Sharma",
      phone: "9876543210",
      accountType: "INDIVIDUAL",
    },
    {
      email: "corporate@novuslease.in",
      name: "Priya Nair",
      phone: "9880765432",
      accountType: "CORPORATE",
      companyName: "Acme Logistics Pvt. Ltd.",
      gstin: "27ABCDE1234F1Z5",
    },
    {
      email: "personaldriver@novuslease.in",
      name: "Rohan Verma",
      phone: "9765432109",
      accountType: "PERSONAL_DRIVER",
      licenceNumber: "MH01 2021 0001",
      licenceExpiry: new Date("2028-01-01"),
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
  ];

  for (const user of demoUsers) {
    const { email, ...rest } = user;
    const created = await prisma.user.upsert({
      where: { email },
      update: rest,
      create: { ...rest, email, passwordHash },
    });
    console.log(`✓ demo ${created.accountType.toLowerCase()} account — ${created.email}`);
  }
  console.log(`  password for all demo accounts: ${DEMO_PASSWORD}`);
}

async function main() {
  console.log("Seeding NovusLease+ …");

  await seedDemoUsers();

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

  // Promotions from the homepage
  await prisma.promotion.createMany({
    data: [
      { code: "NOVUS10", title: "1–3 rental days", description: "10% off quick weekend escapes", discountPct: 10, minDays: 1 },
      { code: "NOVUS15", title: "3–5 rental days", description: "15% off road trips", discountPct: 15, minDays: 3 },
      { code: "NOVUS20", title: "5+ days & subscriptions", description: "20% off extended drives", discountPct: 20, minDays: 5 },
    ],
    skipDuplicates: true,
  });
  console.log("✓ promotions NOVUS10 / NOVUS15 / NOVUS20");

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });