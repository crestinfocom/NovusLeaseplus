import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, SCRYPT.keylen, SCRYPT) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, salt, hex] = stored.split(":");
  if (algo !== "scrypt" || !salt || !hex) return false;
  const derived = scryptSync(password, salt, SCRYPT.keylen, SCRYPT) as Buffer;
  const expected = Buffer.from(hex, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export function randomPassword(length = 16): string {
  return randomBytes(length).toString("base64url");
}