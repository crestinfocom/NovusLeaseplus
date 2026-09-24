export type Fuel = "Petrol" | "Diesel" | "Electric" | "CNG";
export type Trans = "Manual" | "Automatic";
export type Cat = "Economy" | "Compact" | "Standard" | "MUV" | "Luxury";
export type PlanId = "loan" | "lease" | "sub";
export type CarTag = "popular" | "new";

export interface Car {
  name: string;
  make: string;
  body: string;
  cls: string;
  trans: Trans;
  fuel: Fuel;
  seats: number;
  cat: Cat;
  onroad: number;
  pct: number;
  tag: CarTag;
  img: string;
}

const RAW: Omit<Car, "img">[] = [
  { name: "Maruti Wagon R", make: "Maruti", body: "Hatchback", cls: "Super Economy", trans: "Manual", fuel: "Petrol", seats: 5, cat: "Economy", onroad: 600000, pct: 1.95, tag: "popular" },
  { name: "Maruti Celerio", make: "Maruti", body: "Hatchback", cls: "Super Economy", trans: "Manual", fuel: "Petrol", seats: 5, cat: "Economy", onroad: 650000, pct: 1.95, tag: "popular" },
  { name: "Maruti Swift", make: "Maruti", body: "Hatchback", cls: "Economy", trans: "Automatic", fuel: "Petrol", seats: 5, cat: "Economy", onroad: 800000, pct: 1.95, tag: "popular" },
  { name: "MG Comet EV", make: "MG", body: "Hatchback", cls: "Economy", trans: "Automatic", fuel: "Electric", seats: 4, cat: "Economy", onroad: 900000, pct: 1.85, tag: "new" },
  { name: "Maruti Baleno", make: "Maruti", body: "Hatchback", cls: "Compact", trans: "Manual", fuel: "Petrol", seats: 5, cat: "Compact", onroad: 900000, pct: 1.8, tag: "popular" },
  { name: "Toyota Glanza", make: "Toyota", body: "Hatchback", cls: "Compact", trans: "Automatic", fuel: "Petrol", seats: 5, cat: "Compact", onroad: 980000, pct: 1.8, tag: "new" },
  { name: "Hyundai Exter", make: "Hyundai", body: "SUV", cls: "Compact", trans: "Manual", fuel: "Petrol", seats: 5, cat: "Compact", onroad: 1020000, pct: 1.8, tag: "new" },
  { name: "Suzuki Fronx", make: "Maruti", body: "SUV", cls: "Standard", trans: "Manual", fuel: "Petrol", seats: 5, cat: "Standard", onroad: 1050000, pct: 1.67, tag: "new" },
  { name: "Hyundai Venue", make: "Hyundai", body: "SUV", cls: "Standard", trans: "Manual", fuel: "Diesel", seats: 5, cat: "Standard", onroad: 1100000, pct: 1.67, tag: "popular" },
  { name: "Tata Nexon", make: "Tata", body: "SUV", cls: "Standard", trans: "Manual", fuel: "Diesel", seats: 5, cat: "Standard", onroad: 1120000, pct: 1.67, tag: "popular" },
  { name: "Renault Kiger", make: "Renault", body: "SUV", cls: "Standard", trans: "Automatic", fuel: "Petrol", seats: 5, cat: "Standard", onroad: 1150000, pct: 1.67, tag: "popular" },
  { name: "Mahindra XUV 300", make: "Mahindra", body: "SUV", cls: "Standard", trans: "Automatic", fuel: "Diesel", seats: 5, cat: "Standard", onroad: 1250000, pct: 1.67, tag: "popular" },
  { name: "Kia Sonet", make: "Kia", body: "SUV", cls: "Standard", trans: "Manual", fuel: "Diesel", seats: 5, cat: "Standard", onroad: 1300000, pct: 1.67, tag: "new" },
  { name: "Tata Nexon EV", make: "Tata", body: "SUV", cls: "Standard", trans: "Automatic", fuel: "Electric", seats: 5, cat: "Standard", onroad: 1450000, pct: 1.62, tag: "new" },
  { name: "Maruti Vitara Brezza", make: "Maruti", body: "SUV", cls: "Standard", trans: "Automatic", fuel: "Petrol", seats: 5, cat: "Standard", onroad: 1450000, pct: 1.67, tag: "popular" },
  { name: "Maruti Ertiga", make: "Maruti", body: "MUV", cls: "MUV", trans: "Manual", fuel: "CNG", seats: 7, cat: "MUV", onroad: 1500000, pct: 1.55, tag: "popular" },
  { name: "Hyundai Creta", make: "Hyundai", body: "SUV", cls: "MUV", trans: "Automatic", fuel: "Petrol", seats: 5, cat: "MUV", onroad: 1550000, pct: 1.55, tag: "popular" },
  { name: "Kia Carens", make: "Kia", body: "MUV", cls: "MUV", trans: "Manual", fuel: "Diesel", seats: 7, cat: "MUV", onroad: 1620000, pct: 1.55, tag: "new" },
  { name: "Mahindra Scorpio N", make: "Mahindra", body: "SUV", cls: "MUV", trans: "Manual", fuel: "Diesel", seats: 7, cat: "MUV", onroad: 1800000, pct: 1.55, tag: "new" },
  { name: "Toyota Innova Crysta", make: "Toyota", body: "MUV", cls: "MUV", trans: "Manual", fuel: "Diesel", seats: 7, cat: "MUV", onroad: 2200000, pct: 1.55, tag: "popular" },
  { name: "Executive Sedan", make: "Skoda", body: "Sedan", cls: "Luxury", trans: "Automatic", fuel: "Diesel", seats: 5, cat: "Luxury", onroad: 4500000, pct: 1.4, tag: "new" },
];

const IMGS: Record<Cat, string> = {
  Economy: "/images/swift.jpg",
  Compact: "/images/swift.jpg",
  Standard: "/images/suv.jpg",
  MUV: "/images/hero.jpg",
  Luxury: "/images/sedan.jpg",
};

export const CARS: Car[] = RAW.map((c) => ({ ...c, img: IMGS[c.cat] }));

export const PICKED_MODELS = [
  "Maruti Swift",
  "Hyundai Creta",
  "Toyota Innova Crysta",
  "Executive Sedan",
  "Tata Nexon EV",
];

export const CAT_FILTERS: Cat[] = [
  "Economy",
  "Compact",
  "Standard",
  "MUV",
  "Luxury",
];

export const FUELS: Fuel[] = ["Petrol", "Diesel", "Electric", "CNG"];
export const GEARS: Trans[] = ["Manual", "Automatic"];
export const CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kochi",
  "Ahmedabad",
];

export const MAX_COMPARE = 3;

export function carByName(name: string): Car | undefined {
  return CARS.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

/** URL-safe slug for a car — powers the shareable /fleet/[slug] pages. */
export function carSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function carBySlug(slug: string): Car | undefined {
  return CARS.find((c) => carSlug(c.name) === slug);
}

/** Display name — avoids doubling the make when `name` already includes it. */
export function carFullName(car: { make: string; name: string }): string {
  return car.name.toLowerCase().startsWith(car.make.toLowerCase())
    ? car.name
    : `${car.make} ${car.name}`;
}

/**
 * Total cost over a full term — monthly figure (GST already included) × tenure.
 * Also available as the one-time down payment on top (callers add R.down).
 */
export function termTotal(car: Car, plan: PlanId, months = 36): number {
  return Math.round(Math.max(monthly(car, plan), 0) * months);
}

export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function lakh(n: number): string {
  return "₹" + (n / 100000).toFixed(2) + " L";
}

export type QuoteBreakdownRow = [string, number | "Included"];

export interface PlanCalc {
  total: number;
  rows: QuoteBreakdownRow[];
  down: number;
  own: number;
  extra: number;
}

export const PLANS: Record<
  PlanId,
  {
    name: string;
    icon: string;
    label: string;
    note: string;
  }
> = {
  loan: {
    name: "Car Loan",
    icon: "🏦",
    label: "Estimated monthly EMI",
    note: "EMI shown for the loan only. Insurance, servicing and fuel are paid separately. You own the car at the end.",
  },
  lease: {
    name: "Retail Car Lease",
    icon: "🔑",
    label: "Estimated monthly lease",
    note: "Fixed-term lease incl. GST. Insurance and maintenance bundled. Return or pay the residual buy-out at term end.",
  },
  sub: {
    name: "Monthly Subscription",
    icon: "♾️",
    label: "Estimated monthly subscription",
    note: "All-inclusive monthly plan. No down payment, cancel with 30 days notice.",
  },
};

/** Baseline monthly (lease) used on cards and the compare table. */
export function monthly(car: Car, plan: PlanId): number {
  const P = car.onroad;
  const pct = car.pct || 1.67;
  if (plan === "loan") {
    const r = 9.5 / 100 / 12;
    const n = 36;
    const e = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round((e + P * 0.0016 + P * 0.0013) * 1.18);
  }
  if (plan === "sub") {
    return Math.round(((P * (pct + 0.22)) / 100) * 1.18);
  }
  return Math.round(((P * pct) / 100 + P * 0.0016 + P * 0.0013) * 1.18);
}

/** Subscription plan durations (months) offered across the car detail + quote pages. */
export const PLAN_TENURES = [36, 48, 60] as const;
export type PlanTenure = (typeof PLAN_TENURES)[number];

/** Annual kilometres range for lease / subscription plans. */
export const KM_MIN_YEAR = 30000;
export const KM_MAX_YEAR = 150000;

/**
 * Km factor for lease / subscription rentals. Continuous, based on annual km:
 * factor 1 at the 30K km/year baseline, then +5%/10k km/yr (lease) and
 * +6%/10k km/yr (sub) above it. Clamped to the 30K–150K range.
 */
export function kmFactor(km: number, plan: "lease" | "sub"): number {
  const k = Math.min(Math.max(km, KM_MIN_YEAR), KM_MAX_YEAR);
  const rate = plan === "lease" ? 0.05 : 0.06;
  return 1 + ((k - KM_MIN_YEAR) / 10000) * rate;
}

export interface QuoteControls {
  tenure: number;
  downPct: number;
  ratePct: number;
  /** Kilometres per year (30,000–150,000). */
  km: number;
  addons: {
    insurance: boolean;
    maintenance: boolean;
    rsa: boolean;
    chauffeur: boolean;
    tyre: boolean;
  };
}

/** Full plan breakdown for the quote builder (mirrors reference quote()/calcPlan). */
export function calcPlan(
  car: Car,
  plan: PlanId,
  c: QuoteControls
): PlanCalc {
  const P = car.onroad;
  const ten = c.tenure;
  const dp = c.downPct;
  const rsa = c.addons.rsa ? 499 : 0;
  const drv = c.addons.chauffeur ? 18000 : 0;
  const tyre = c.addons.tyre ? 899 : 0;
  const extra = rsa + drv + tyre;
  const rows: QuoteBreakdownRow[] = [];
  let base = 0;
  let ins = 0;
  let mnt = 0;
  let down = 0;
  let own = 0;

  if (plan === "loan") {
    down = (P * dp) / 100;
    const loan = P - down;
    const r = c.ratePct / 100 / 12;
    const n = ten;
    base = r > 0 ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
    ins = c.addons.insurance ? Math.round(P * 0.0016) : 0;
    mnt = c.addons.maintenance ? Math.round(P * 0.0013) : 0;
    rows.push(["Loan EMI", Math.round(base)]);
    if (ins) rows.push(["Insurance (self-paid)", ins]);
    if (mnt) rows.push(["Maintenance (self-paid)", mnt]);
    own = P * Math.pow(1 - 0.15, ten / 12);
  } else if (plan === "lease") {
    down = (P * dp) / 100;
    const ta = 1 + ((36 - ten) / 36) * 0.12;
    const da = 1 - (dp / 100) * 0.55;
    const ka = kmFactor(c.km, "lease");
    base = ((P * car.pct) / 100) * ta * da * ka;
    ins = Math.round(P * 0.0016);
    mnt = Math.round(P * 0.0013);
    rows.push(["Base lease rental", Math.round(base)]);
    rows.push(["Comprehensive insurance", ins]);
    rows.push(["Maintenance & servicing", mnt]);
  } else {
    const ta = 1 + ((36 - ten) / 36) * 0.22;
    const ka = kmFactor(c.km, "sub");
    base = ((P * (car.pct + 0.22)) / 100) * ta * ka;
    rows.push(["All-inclusive rental", Math.round(base)]);
    rows.push(["Insurance (bundled)", 0]);
    rows.push(["Maintenance (bundled)", 0]);
  }
  if (rsa) rows.push(["Roadside assistance", rsa]);
  if (drv) rows.push(["Chauffeur service", drv]);
  if (tyre) rows.push(["Tyre & battery cover", tyre]);
  const sub = Math.round(base + (plan === "sub" ? 0 : ins + mnt) + extra);
  const gst = Math.round(sub * 0.18);
  rows.push(["GST @ 18%", gst]);
  return { total: sub + gst, rows, down: Math.round(down), own: Math.round(own), extra };
}

export function quoteRef(prefix: "NLQ" | "NLA"): string {
  return prefix + "-" + String(Date.now()).slice(-6);
}