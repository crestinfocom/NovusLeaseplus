// Formatting helpers shared by the admin views.

export function inr(n: number | string): string {
  const v = Number(n) || 0;
  return "₹" + Math.round(v).toLocaleString("en-IN");
}

export function inrShort(n: number | string): string {
  const v = Number(n) || 0;
  if (v >= 1e7) return "₹" + (v / 1e7).toFixed(2) + "Cr";
  if (v >= 1e5) return "₹" + (v / 1e5).toFixed(2) + "L";
  if (v >= 1e3) return "₹" + (v / 1e3).toFixed(1) + "K";
  return "₹" + v;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Map a DB booking status to the design's pill class.
const BOOKING_PILL: Record<string, string> = {
  PENDING: "pending",
  CONFIRMED: "active",
  PICKED_UP: "active",
  COMPLETED: "completed",
  RETURNED: "active",
  CANCELLED: "cancelled",
};

export function bookingPill(status: string): string {
  return BOOKING_PILL[status] ?? "pending";
}

// Cars have no persisted status — derive it from availability + bookings.
export function carPill(status: string): string {
  if (status === "leased") return "leased";
  if (status === "maintenance") return "maintenance";
  if (status === "retired") return "retired";
  return "available";
}

export function kycPill(status: string): string {
  if (status === "VERIFIED") return "active";
  if (status === "REJECTED") return "cancelled";
  return "pending";
}

export function promoPill(isActive: boolean, endsAt: Date | string | null): string {
  if (!isActive) return "retired";
  if (endsAt) {
    const end = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
    if (!Number.isNaN(end.getTime()) && end.getTime() < Date.now()) {
      return "retired";
    }
  }
  return "active";
}

export function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-IN", { month: "short" });
}

// "HATCHBACK" → "Hatchback" (the reference design shows Title-case categories/fuels).
export function titleCase(s: string | null | undefined): string {
  if (!s) return "—";
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}