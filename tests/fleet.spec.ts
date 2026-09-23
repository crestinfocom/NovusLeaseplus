import { test, expect } from "@playwright/test";

test.describe("Fleet page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fleet");
  });

  test("renders hero, toolbar and the full grid", async ({ page }) => {
    await expect(page.locator(".fhero h1")).toContainText("fleet");
    await expect(page.locator(".toolbar")).toBeVisible();
    const grid = page.locator('[data-testid="fleet-grid"] .model');
    const count = await grid.count();
    expect(count).toBeGreaterThanOrEqual(10);
    await expect(page.locator(".resultbar .count b")).toHaveText(String(count));
  });

  test("search narrows results", async ({ page }) => {
    await page.getByPlaceholder(/Search e\.g\./).fill("creta");
    const grid = page.locator('[data-testid="fleet-grid"] .model');
    await expect(grid).toHaveCount(1);
    await expect(grid.first()).toHaveAttribute("data-name", "Hyundai Creta");
  });

  test("chips filter by category", async ({ page }) => {
    const luxury = page.locator(".chips .chip", { hasText: "Luxury" });
    await luxury.click();
    const grid = page.locator('[data-testid="fleet-grid"] .model');
    const count = await grid.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(4);
    // every card is a luxury cat
    for (let i = 0; i < count; i++) {
      await expect(grid.nth(i)).toContainText("Sedan");
    }
  });

  test("fuel select filters to diesel cars", async ({ page }) => {
    await page.locator(".tools-row select").nth(0).selectOption("Diesel");
    const grid = page.locator('[data-testid="fleet-grid"] .model');
    const count = await grid.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(grid.nth(i)).toContainText("Diesel");
    }
  });

  test("transmission select filters to automatic", async ({ page }) => {
    await page.locator(".tools-row select").nth(1).selectOption("Automatic");
    const grid = page.locator('[data-testid="fleet-grid"] .model');
    for (let i = 0; i < Math.min(await grid.count(), 5); i++) {
      await expect(grid.nth(i)).toContainText("Automatic");
    }
  });

  test("sort by price high → low orders the grid", async ({ page }) => {
    await page.locator(".tools-row select").nth(2).selectOption("highlow");
    const first = page.locator('[data-testid="fleet-grid"] .model').first();
    await expect(first).toHaveAttribute("data-name", "Executive Sedan");
  });

  test("clear filters restores the full grid", async ({ page }) => {
    await page.getByPlaceholder(/Search e\.g\./).fill("creta");
    await page.locator('[data-testid="fleet-clear"]').click();
    const count = await page.locator('[data-testid="fleet-grid"] .model').count();
    expect(count).toBeGreaterThanOrEqual(18);
  });

  test("model card links to the quote builder prefilled", async ({ page }) => {
    await page.locator('.model[data-name="Tata Nexon EV"] .lease-btn').click();
    await page.waitForURL("**/quote?car=**");
    await expect(page.locator('[data-testid="sel-car"]')).toContainText("Tata Nexon EV");
    await expect(page.locator('[data-testid="quote-builder"]')).toBeVisible();
  });
});