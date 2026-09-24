import { test, expect } from "@playwright/test";

test.describe("Drive With Us page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/drive-with-us");
  });

  test("renders hero, program badge, CTAs and jump links", async ({ page }) => {
    await expect(page.locator(".dwu-hero h1")).toContainText("Drive with us");
    await expect(page.locator(".dwu-eyebrow")).toHaveText(
      /Commercial Vehicle Lease Program/i
    );
    await expect(page.locator(".dwu-hero-actions a").first()).toHaveAttribute(
      "href",
      "/signup"
    );
    await expect(page.locator(".jump a")).toHaveCount(5);
  });

  test("program rules and journey steps are present", async ({ page }) => {
    await expect(page.locator("#model .p3")).toHaveCount(6);
    await expect(page.locator("#model")).toContainText("₦20,000–₦40,000");
    await expect(page.locator("#model")).toContainText("Daily / weekly repayment");
    const steps = page.locator("#how .step");
    await expect(steps).toHaveCount(6);
    await expect(steps.nth(0)).toContainText("Select an eligible vehicle");
  });

  test("calculator renders and responds to tenure change", async ({ page }) => {
    const contrib = page.locator('[data-testid="calc-contribution"] .v');
    await contrib.scrollIntoViewIfNeeded();
    await expect(contrib).toBeVisible();
    const before = await contrib.innerText();
    await page.locator('.dwu-calc .vdd-chip', { hasText: "60" }).click();
    await expect(contrib).not.toHaveText(before);
    await expect(page.locator(".dwu-calc .ctrl").last()).not.toBeHidden();
  });

  test("indicative disclaimer is shown with the estimator", async ({ page }) => {
    const calc = page.locator('[data-testid="drive-calculator"]');
    await calc.locator("text=Illustrative figures only").scrollIntoViewIfNeeded();
    await expect(calc).toContainText("Illustrative figures only");
  });

  test("vehicle categories section links to the fleet", async ({ page }) => {
    await expect(page.locator("#vehicles .dwu-veh")).toHaveCount(4);
    await expect(page.locator("#vehicles a[href='/fleet']").first()).toBeVisible();
  });

  test("eligibility and documents cards", async ({ page }) => {
    const cards = page.locator("#eligibility .who-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText("Who can apply");
    await expect(cards.nth(1)).toContainText("Documents");
  });

  test("FAQ toggles and bottom CTA goes to signup", async ({ page }) => {
    await expect(page.locator(".faq").first()).toHaveAttribute("open", "");
    const second = page.locator(".faq").nth(1);
    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
    const cta = page.locator(".cta-strip");
    await cta.scrollIntoViewIfNeeded();
    await cta.locator(".dwu-cta-actions a").first().click();
    await page.waitForURL("**/signup");
  });

  test("canonical link and JSON-LD are present", async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/drive-with-us$/
    );
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .innerText();
    expect(ld).toContain('"@type":"FAQPage"');
    expect(ld).toContain("Commercial vehicle lease");
  });
});