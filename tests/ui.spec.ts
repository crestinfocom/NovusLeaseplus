import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/fleet", "/compare", "/quote", "/track", "/drive-with-us", "/login", "/signup", "/forgot-password"];

const VIEWPORTS: { name: string; width: number; height: number }[] = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`${route} renders at ${vp.name} size without overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, "page must not overflow horizontally").toBeLessThanOrEqual(
        1,
      );

      await page.screenshot({
        path: `test-results/ui/${route.replace(/\//g, "_")}-${vp.name}.png`,
        fullPage: vp.name === "desktop",
      });
    });
  }
}