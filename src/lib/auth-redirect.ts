import type { UserRole } from "@prisma/client";

const BASE_URL = "https://novuslease.invalid";
const ADMIN_PATHS = new Set([
  "/admin",
  "/admin/dashboard",
  "/admin/bookings",
  "/admin/fleet",
  "/admin/customers",
  "/admin/offers",
  "/admin/settings",
]);
const SAFE_PATHS = new Set(["/", ...ADMIN_PATHS]);

function normalizePath(value: string): string | null {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(value, BASE_URL);
  } catch {
    return null;
  }

  if (parsed.origin !== BASE_URL) return null;
  const path = parsed.pathname.replace(/\/+$/, "") || "/";
  return SAFE_PATHS.has(path) ? path : null;
}

export function getSafeLoginRedirect(value: unknown): string | null {
  return typeof value === "string" ? normalizePath(value) : null;
}

export function isAdminPath(value: string): boolean {
  const path = value.replace(/\/+$/, "") || "/";
  return ADMIN_PATHS.has(path);
}

export function getLoginRedirect(
  safeNext: string | null,
  role: UserRole,
): string {
  if (role === "ADMIN") return safeNext ?? "/admin/dashboard";
  return safeNext && !isAdminPath(safeNext) ? safeNext : "/";
}

export function getAdminLoginPath(value: unknown): string {
  const safeNext = getSafeLoginRedirect(value);
  return safeNext && isAdminPath(safeNext) ? safeNext : "/admin/dashboard";
}

export function adminLoginUrl(value: unknown): string {
  return `/login?next=${encodeURIComponent(getAdminLoginPath(value))}`;
}
