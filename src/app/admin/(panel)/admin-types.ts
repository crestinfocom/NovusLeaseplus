// Client-facing shapes returned by the admin API routes.

export type StatCard = {
  ic: string;
  emoji: string;
  lbl: string;
  num: string;
  chg: string;
  up: boolean;
};

export type StatsData = {
  statCards: StatCard[];
  revenue: { labels: string[]; values: number[] };
  recentBookings: {
    id: string;
    customer: string;
    email: string;
    car: string;
    amount: number;
    status: string;
    start: string;
    end: string;
  }[];
  fleetStatus: { available: number; leased: number; maintenance: number; retired: number };
  topCars: { id: string; name: string; category: string; lease: number; util: number }[];
  totalCars: number;
};

export type BookingRow = {
  id: string;
  bookingRef: string;
  bookingType: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  baseAmount: number;
  discountAmount: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  car: { id: string; name: string };
  city: { id: string; name: string };
};

export type CarRow = {
  id: string;
  slug: string;
  regNo: string | null;
  name: string;
  brand: string;
  category: string;
  fuelType: string;
  seats: number;
  transmission: string;
  lease: number;
  hourly: number;
  featured: boolean;
  status: "leased" | "available" | "maintenance";
  util: number;
};

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  accountType: string;
  kycStatus: string;
  city: string | null;
  bookings: number;
  ltv: number;
};

export type OfferRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount: string;
  redeemed: number;
  till: string | null;
  isActive: boolean;
};

export type MetaData = {
  customers: { id: string; name: string; email: string }[];
  cars: { id: string; name: string; brand: string }[];
  cities: { id: string; name: string }[];
};