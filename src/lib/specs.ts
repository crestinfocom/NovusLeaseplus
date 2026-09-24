import type { Car } from "./catalog";

export interface MileageSpec {
  value: number;
  unit: "kmpl" | "km/charge";
}

export interface PowerSpec {
  value: number;
  unit: "bhp" | "kW";
}

export interface ColourSpec {
  name: string;
  hex: string;
}

const CAT_PETROL_MPG: Record<string, number> = {
  Economy: 21,
  Compact: 19,
  Standard: 17,
  MUV: 15,
  Luxury: 12,
};

const CAT_RANGE: Record<string, number> = {
  Economy: 230,
  Compact: 252,
  Standard: 298,
  MUV: 335,
  Luxury: 445,
};

const CAT_POWER: Record<string, number> = {
  Economy: 67,
  Compact: 88,
  Standard: 116,
  MUV: 170,
  Luxury: 192,
};

const CAT_COLOURS: Record<string, ColourSpec[]> = {
  Economy: [
    { name: "Arctic White", hex: "#f2f3f5" },
    { name: "Classic Silver", hex: "#b9bec4" },
    { name: "Ocean Blue", hex: "#1f4e8c" },
  ],
  Compact: [
    { name: "Arctic White", hex: "#f2f3f5" },
    { name: "Granite Grey", hex: "#6b7280" },
    { name: "Crimson Red", hex: "#b0303a" },
    { name: "Ocean Blue", hex: "#1f4e8c" },
  ],
  Standard: [
    { name: "Arctic White", hex: "#f2f3f5" },
    { name: "Classic Silver", hex: "#b9bec4" },
    { name: "Midnight Black", hex: "#1c1f24" },
    { name: "Ocean Blue", hex: "#1f4e8c" },
    { name: "Crimson Red", hex: "#b0303a" },
  ],
  MUV: [
    { name: "Arctic White", hex: "#f2f3f5" },
    { name: "Midnight Black", hex: "#1c1f24" },
    { name: "Granite Grey", hex: "#6b7280" },
    { name: "Ocean Blue", hex: "#1f4e8c" },
  ],
  Luxury: [
    { name: "Midnight Black", hex: "#1c1f24" },
    { name: "Pearl White", hex: "#f0ede6" },
    { name: "Graphite Grey", hex: "#464b53" },
  ],
};

/** ARAI mileage (petrol/diesel/CNG) or range (EV), derived from category. */
export function carMileage(car: Car): MileageSpec {
  if (car.fuel === "Electric") {
    return { value: CAT_RANGE[car.cat] ?? 300, unit: "km/charge" };
  }
  const petrol = CAT_PETROL_MPG[car.cat] ?? 17;
  const boost = car.fuel === "Diesel" ? 4 : car.fuel === "CNG" ? 7 : 0;
  return { value: petrol + boost, unit: "kmpl" };
}

/** Approximate engine power output for the category. */
export function carPower(car: Car): PowerSpec {
  const value = CAT_POWER[car.cat] ?? 110;
  return { value, unit: "bhp" };
}

/** Curated feature list — universal base plus category / fuel extras. */
export function carFeatures(car: Car): string[] {
  const set = new Set([
    "6 Airbags",
    "ABS with EBD",
    "Air Conditioning",
    "Central Locking",
    "Power Windows",
    "LED Headlamps",
    "Touchscreen Infotainment",
    "Keyless Entry",
  ]);

  const cat = set.add.bind(set);
  if (car.cat === "Economy" || car.cat === "Compact") {
    cat("Rear Parking Camera");
  } else if (car.cat === "Luxury") {
    cat("Panoramic Sunroof");
    cat("Ventilated Seats");
    cat("Adaptive Cruise Control");
    cat("Premium Sound System");
    cat("Wireless Charging");
  } else {
    cat("Rear Parking Camera");
    cat("Cruise Control");
    cat("Hill Hold Assist");
    if (car.cat === "MUV") cat("Rear AC Vents");
  }

  if (car.fuel === "Electric") {
    cat("Fast DC Charging");
    cat("Regenerative Braking");
    cat("Multiple Drive Modes");
  }

  return [...set];
}

/** Exterior colour palette offered for the car. */
export function carColours(car: Car): ColourSpec[] {
  return CAT_COLOURS[car.cat] ?? CAT_COLOURS.Standard;
}