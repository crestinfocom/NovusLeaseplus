"use client";

import { useEffect, useState } from "react";
import { onAdminSearch } from "@/lib/search-bus";

export function useAdminSearch(): string {
  const [q, setQ] = useState("");
  useEffect(() => onAdminSearch(setQ), []);
  return q.trim().toLowerCase();
}