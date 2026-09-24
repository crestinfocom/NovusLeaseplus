import type { MetadataRoute } from "next";
import { CARS, carSlug } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://novuslease.in";
  const staticRoutes = [
    "",
    "/fleet",
    "/compare",
    "/quote",
    "/track",
  ];
  const vehicles = CARS.map((c) => `/fleet/${carSlug(c.name)}`);
  return [...staticRoutes, ...vehicles].map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: r.startsWith("/fleet/") ? "weekly" : "monthly",
    priority: r === "" ? 1 : r.startsWith("/fleet/") ? 0.8 : 0.6,
  }));
}