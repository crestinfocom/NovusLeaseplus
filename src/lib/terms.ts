// Canonical product terminology shared across the customer site, quote builder
// and the "Fees & charges explained" guide. This is the single source of truth
// so "rental", "lease" and "subscription" always mean the same thing everywhere.

export const PLAN_IDS = ["loan", "lease", "sub"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const PLAN_NAMES: Record<PlanId, string> = {
  loan: "Car Loan",
  lease: "Retail Car Lease",
  sub: "Monthly Subscription",
};

// Short descriptions used on cards, buttons and the fees guide.
export const PLAN_SHORT: Record<PlanId, string> = {
  loan: "Buy it — you own the asset",
  lease: "Fixed term, buy-out option",
  sub: "All-inclusive, cancel anytime",
};

export function planName(id: PlanId): string {
  return PLAN_NAMES[id];
}

// The three customer products and how NovusLease+ names them consistently.
export const PRODUCT_GLOSSARY = [
  {
    term: "Self-Drive Rental",
    detail:
      "Short-term — by the hour, day or week. Pay per use, insured, unlimited driving within a distance package.",
  },
  {
    term: "Retail Car Lease",
    detail:
      "Fixed term (12–60 months). Insurance and maintenance bundled. Return the car or pay the buy-out at term end.",
  },
  {
    term: "Monthly Subscription",
    detail:
      "Month-to-month and all-inclusive. No down payment. Cancel anytime with 30 days notice.",
  },
  {
    term: "Car Loan",
    detail:
      "Finance the purchase and own the asset. You arrange insurance and servicing; resale value stays with you.",
  },
];

export const BOOKING_TYPE_LABELS: Record<string, string> = {
  DAILY: "Daily Rental",
  WEEKLY: "Weekly Rental",
  MONTHLY: "Monthly Rental",
  SUBSCRIPTION: "Monthly Subscription",
};

export function bookingTypeLabel(t: string): string {
  return BOOKING_TYPE_LABELS[t] ?? t;
}

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PICKED_UP",
  "RETURNED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  PICKED_UP: "On the road",
  RETURNED: "Returned",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function bookingStatusLabel(s: string): string {
  return BOOKING_STATUS_LABELS[s as BookingStatus] ?? s;
}

export const BOOKING_REFERENCE_PATTERN = /^B[A-Z0-9]{4,6}$/;

export function normalizeBookingReference(value: string): string | null {
  const normalized = value.trim().toUpperCase();
  return BOOKING_REFERENCE_PATTERN.test(normalized) ? normalized : null;
}

export type JourneyMilestoneState =
  | "completed"
  | "current"
  | "upcoming"
  | "cancelled";

export interface JourneyMilestone {
  id: string;
  label: string;
  state: JourneyMilestoneState;
}

export interface StatusJourney {
  label: string;
  milestones: JourneyMilestone[];
  nextActions: string[];
  terminal: boolean;
}

const JOURNEY_MILESTONES = [
  { id: "received", label: "Booking received" },
  { id: "confirmed", label: "Booking confirmed" },
  { id: "picked-up", label: "Vehicle picked up" },
  { id: "returned", label: "Vehicle returned" },
  { id: "completed", label: "Booking completed" },
] as const;

function buildJourney(
  label: string,
  states: JourneyMilestoneState[],
  nextActions: string[],
  terminal = false,
): StatusJourney {
  return {
    label,
    milestones: JOURNEY_MILESTONES.map((milestone, index) => ({
      ...milestone,
      state: states[index] ?? "upcoming",
    })),
    nextActions,
    terminal,
  };
}

export const STATUS_JOURNEY: Record<BookingStatus, StatusJourney> = {
  PENDING: buildJourney(
    "Awaiting confirmation",
    ["completed", "current", "upcoming", "upcoming", "upcoming"],
    [
      "Keep your booking details ready for confirmation.",
      "Our team will confirm your booking within 24 hours.",
    ],
  ),
  CONFIRMED: buildJourney(
    "Locked in & confirmed",
    ["completed", "completed", "current", "upcoming", "upcoming"],
    [
      "Review your confirmed dates and pickup details.",
      "Choose a pickup slot and location.",
      "Bring your booking reference and required documents.",
    ],
  ),
  PICKED_UP: buildJourney(
    "On the road with you",
    ["completed", "completed", "completed", "current", "upcoming"],
    [
      "Review the handover checklist and confirm the odometer reading.",
      "Use the bundled support for any incident during the journey.",
      "Contact support if your plans change.",
    ],
  ),
  RETURNED: buildJourney(
    "Returned — closing out",
    ["completed", "completed", "completed", "completed", "current"],
    [
      "Complete the final inspection and odometer/fuel check.",
      "Settle any final dues before the deposit is processed.",
      "Share feedback about your booking.",
    ],
  ),
  COMPLETED: buildJourney(
    "Completed",
    ["completed", "completed", "completed", "completed", "completed"],
    [],
    true,
  ),
  CANCELLED: buildJourney(
    "Cancelled",
    ["completed", "cancelled", "cancelled", "cancelled", "cancelled"],
    [],
    true,
  ),
};

export function statusJourney(status: string): StatusJourney {
  const known = STATUS_JOURNEY[status as BookingStatus];
  if (known) {
    return {
      ...known,
      milestones: known.milestones.map((milestone) => ({ ...milestone })),
      nextActions: [...known.nextActions],
    };
  }

  return {
    label: bookingStatusLabel(status),
    milestones: JOURNEY_MILESTONES.map((milestone, index) => ({
      ...milestone,
      state: index === 0 ? "current" : "upcoming",
    })),
    nextActions: ["Contact our 24×7 support team for the latest update."],
    terminal: false,
  };
}

// Fees & charges explained — the exact items flagged in the UX review.
export interface FeeItem {
  id: string;
  title: string;
  summary: string;
  points: string[];
}

export const FEE_GUIDE: FeeItem[] = [
  {
    id: "deposit",
    title: "Security deposit",
    summary:
      "A refundable security deposit applies to every lease and rental to cover damage beyond fair wear.",
    points: [
      "Typically 1–2 months of the monthly rental, or ₹5,000–₹10,000 for short rentals.",
      "Fully refundable within 7–10 days of return after the final inspection.",
      "Deducted only for excess damage, missing documents or pending dues — never for normal wear.",
    ],
  },
  {
    id: "taxes",
    title: "Taxes & fees",
    summary:
      "Quoted prices are inclusive of 18% GST. Road tax and registration are inside the on-road price.",
    points: [
      "GST @ 18% is already included in every monthly figure on this site.",
      "The on-road price you see on each car includes road tax and registration.",
      "No hidden processing or document fees on standard plans.",
    ],
  },
  {
    id: "insurance",
    title: "Insurance",
    summary:
      "Comprehensive insurance is bundled into every lease and subscription and is available on rentals.",
    points: [
      "Retail Car Lease & Monthly Subscription — comprehensive cover included.",
      "Car Loan — you arrange and pay for insurance yourself (shown separately in the quote).",
      "Zero-dep and personal accident cover can be added in the quote builder.",
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance & servicing",
    summary:
      "Scheduled servicing and wear-and-tear items are bundled on lease and subscription plans.",
    points: [
      "Included: scheduled service, engine oil, brake pads, tyres and battery (term).",
      "Lease & subscription quotes include maintenance; a car loan keeps it as your own cost.",
      "Accident damage is covered by insurance; negligence repair costs may apply.",
    ],
  },
  {
    id: "mileage",
    title: "Excess mileage",
    summary:
      "Lease and subscription plans cap monthly kilometres. Going over is billed at a per-km rate.",
    points: [
      "Pick 1,500 / 2,500 / 3,600 km per month in the quote builder.",
      "Excess usage is billed at ₹4–₹7/km depending on the car and plan.",
      "Car Loans have no mileage limits at all.",
    ],
  },
  {
    id: "early",
    title: "Early termination",
    summary:
      "Exiting before the term ends has defined, transparent charges depending on the plan.",
    points: [
      "Monthly Subscription — 30 days notice, no penalty beyond pending dues.",
      "Retail Car Lease — early-exit charge of ~2–3 months of rental or a settling fee.",
      "Car Loan — no penalty; sell the car and close the loan early.",
    ],
  },
];

export function feeById(id: string): FeeItem | undefined {
  return FEE_GUIDE.find((f) => f.id === id);
}