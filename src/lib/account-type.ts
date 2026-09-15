import type { AccountType } from "@prisma/client";

const CLIENT_TYPES = [
  "individual",
  "corporate",
  "personal-driver",
  "commercial-driver",
] as const;

export type ClientAccountType = (typeof CLIENT_TYPES)[number];

export function isClientAccountType(v: unknown): v is ClientAccountType {
  return CLIENT_TYPES.includes(v as ClientAccountType);
}

export function toPrismaAccountType(v: ClientAccountType): AccountType {
  switch (v) {
    case "individual":
      return "INDIVIDUAL";
    case "corporate":
      return "CORPORATE";
    case "personal-driver":
      return "PERSONAL_DRIVER";
    case "commercial-driver":
      return "COMMERCIAL_DRIVER";
  }
}

export function fromPrismaAccountType(v: AccountType): ClientAccountType {
  switch (v) {
    case "INDIVIDUAL":
      return "individual";
    case "CORPORATE":
      return "corporate";
    case "PERSONAL_DRIVER":
      return "personal-driver";
    case "COMMERCIAL_DRIVER":
      return "commercial-driver";
  }
}

export function accountTypeLabel(v: AccountType): string {
  switch (v) {
    case "INDIVIDUAL":
      return "Individual";
    case "CORPORATE":
      return "Corporate";
    case "PERSONAL_DRIVER":
      return "Personal Driver";
    case "COMMERCIAL_DRIVER":
      return "Commercial Driver";
  }
}