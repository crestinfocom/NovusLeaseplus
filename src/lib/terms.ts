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

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  PICKED_UP: "On the road",
  COMPLETED: "Completed",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

export function bookingStatusLabel(s: string): string {
  return BOOKING_STATUS_LABELS[s] ?? s;
}

// Persistent booking/application status with actionable next steps (UX gap 5).
export interface StatusJourney {
  label: string;
  steps: string[];
}

export const STATUS_JOURNEY: Record<string, StatusJourney> = {
  PENDING: {
    label: "Awaiting confirmation",
    steps: [
      "Complete your KYC and upload your supporting documents",
      "Review and e-sign the agreement",
      "Pay the token advance to lock the car",
      "Our team confirms within 24 hours",
    ],
  },
  CONFIRMED: {
    label: "Locked in & confirmed",
    steps: [
      "Download your signed agreement",
      "Pay the security deposit to reserve the vehicle",
      "Pick a delivery slot or pickup location",
      "The car is allocated to you for the full period",
    ],
  },
  PICKED_UP: {
    label: "On the road with you",
    steps: [
      "Review the handover checklist and odometer photo",
      "Follow bundled insurance, maintenance and RSA cover",
      "Report any incident within 24 hours on 24×7 support",
    ],
  },
  RETURNED: {
    label: "Returned — closing out",
    steps: [
      "Final inspection and odometer/fuel check",
      "Refundable deposit is processed after dues are settled",
      "Rate your journey — feedback closes the loop",
    ],
  },
  COMPLETED: {
    label: "Completed",
    steps: [
      "Download your invoice and payment history",
      "Renew, extend or start a fresh quote",
      "Refer a friend to earn partner rewards",
    ],
  },
  CANCELLED: {
    label: "Cancelled",
    steps: [
      "No further amount is collected",
      "Start a new quote to rebook any car",
      "Contact support if a refund is due to you",
    ],
  },
};

export function statusJourney(status: string): StatusJourney {
  return (
    STATUS_JOURNEY[status] ?? {
      label: bookingStatusLabel(status),
      steps: ["Contact our 24×7 support team for the latest update."],
    }
  );
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