import { test, expect } from "@playwright/test";

test.describe("Lease vs Buy (compare) page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compare");
  });

  test("renders headline, jump links and verdict cards", async ({ page }) => {
    await expect(page.locator(".lhero h1")).toContainText("which actually costs less");
    await expect(page.locator(".jump")).toBeVisible();
    await expect(page.locator(".jump a, .jump")).toContainText(["Full comparison", "Which suits you"]);
    await expect(page.locator(".verdict .vcard")).toHaveCount(3);
    await expect(page.locator(".vcard.best .tagtop")).toHaveText("BEST VALUE");
  });

  test("comparison matrix contains the key factors", async ({ page }) => {
    const table = page.locator(".mtable");
    await table.scrollIntoViewIfNeeded();
    for (const txt of [
      "Monthly EMI",
      "Down payment",
      "Ownership at end",
      "Resale value",
      "Mileage limit",
      "Tax benefit",
    ]) {
      await expect(table).toContainText(txt);
    }
  });

  test("tax section explains the employer lease saving", async ({ page }) => {
    const tax = page.locator("#tax");
    await tax.scrollIntoViewIfNeeded();
    await expect(tax.locator(".taxbox")).toHaveCount(3);
    await expect(tax).toContainText("~31%");
  });

  test("decision guide has both lease and buy cards", async ({ page }) => {
    const grid = page.locator(".who-grid .who-card");
    await grid.first().scrollIntoViewIfNeeded();
    await expect(grid).toHaveCount(2);
    await expect(grid.nth(0)).toContainText("Lease if you");
    await expect(grid.nth(1)).toContainText("Buy with a loan");
  });

  test("FAQ details toggle", async ({ page }) => {
    const first = page.locator(".faq").first();
    const second = page.locator(".faq").nth(1);
    await expect(first).toHaveAttribute("open", "");
    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
  });

  test("bottom CTA navigates to the quote builder", async ({ page }) => {
    const cta = page.locator(".cta-strip");
    await cta.scrollIntoViewIfNeeded();
    await cta.locator("a").first().click();
    await page.waitForURL("**/quote");
    await expect(page.locator('[data-testid="quote-builder"]')).toBeVisible();
  });
});