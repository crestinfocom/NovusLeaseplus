import { test, expect } from "@playwright/test";

test.describe("Quote builder", () => {
  test("renders panel, carousel and builder", async ({ page }) => {
    await page.goto("/quote");
    await expect(page.locator(".panel .panel-h h3")).toContainText("dream car");
    await expect(page.locator('[data-testid="qcard"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="quote-builder"]')).toBeVisible();
    await expect(page.locator('[data-testid="sel-car"]')).toHaveText("No car selected");
  });

  test("selecting a car updates the builder and prices", async ({ page }) => {
    await page.goto("/quote");
    const card = page.locator('[data-testid="qcard"]', { hasText: "Maruti Swift" }).first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(page.locator('[data-testid="sel-car"]')).toContainText("Maruti Swift");
    const monthly = page.locator(".qtotal .v");
    await expect(monthly).not.toHaveText("₹0/mo");
    // all three plan monthly pills populated
    await expect(page.locator(".ptab .pm").nth(0)).not.toContainText("—");
    await expect(page.locator(".ptab .pm").nth(2)).not.toContainText("—");
  });

  test("switching to subscription bundles insurance and hides down payment", async ({
    page,
  }) => {
    await page.goto("/quote");
    await page.locator('[data-testid="qcard"]').first().click();
    await page.locator('.ptab[data-p="sub"]').click();
    const downCtrl = page.locator("#ctrlDown");
    await expect(downCtrl).toBeHidden();
    const ins = page.locator(".addon input[type=checkbox]").first();
    await expect(ins).toBeChecked();
    await expect(ins).toBeDisabled();
    await expect(page.locator(".addon").first()).toHaveClass(/locked/);
  });

  test("loan plan reveals interest-rate control and shows down payment", async ({
    page,
  }) => {
    await page.goto("/quote");
    await page.locator('[data-testid="qcard"]').first().click();
    await page.locator('.ptab[data-p="loan"]').click();
    await expect(page.locator("#ctrlRate")).toBeVisible();
    await expect(page.locator("#ctrlKm")).toBeHidden();
    await expect(page.locator("#ctrlDown")).toBeVisible();
  });

  test("tenure slider updates breakdown labels", async ({ page }) => {
    await page.goto("/quote");
    await page.locator('[data-testid="qcard"]').first().click();
    const slider = page.locator(".ctrl input.single").first();
    await slider.evaluate(() => {
      const el = document.querySelector(".ctrl input.single") as HTMLInputElement;
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      if (set) set.call(el, "60");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator(".ctrl .lbl b").first()).toHaveText("60 months");
  });

  test("tabs filter the carousel", async ({ page }) => {
    await page.goto("/quote");
    await page.locator('.tab[data-t="new"]').click();
    await expect(page.locator('[data-testid="qcard"]')).toHaveCount(7);
    await page.locator('.tab[data-t="all"]').click();
    expect((await page.locator('[data-testid="qcard"]').count())).toBeGreaterThanOrEqual(10);
    await page.locator('.tab[data-t="wish"]').click();
    await expect(page.locator('[data-testid="q-empty"]')).toBeVisible();
  });

  test("creating a quote validates fields then generates a reference", async ({
    page,
  }) => {
    await page.goto("/quote");
    await page.locator('[data-testid="qcard"]').first().click();
    await page.getByRole("button", { name: /Create personalised quote/ }).click();
    await page.locator('[data-testid="q-submit"]').click();
    // validation toast (no redirection) — modal still open
    await expect(page.locator(".modal2")).toBeVisible();

    const modal = page.locator(".modal2");
    await modal.locator('[data-testid="q-name"]').fill("Deepak Kumar");
    await modal.locator('[data-testid="q-email"]').fill("deepak@company.com");
    await modal.locator('[data-testid="q-phone"]').fill("+91 98450 12345");
    await modal.locator('[data-testid="q-submit"]').click();

    await expect(page.locator(".modal2 .okbox")).toBeVisible();
    await expect(page.locator(".modal2 .okbox")).toContainText("Your quote is ready");
    await expect(page.locator(".modal2 .okbox .refno")).toContainText(/Ref: NLQ-\d+/);
    await page.locator(".modal2").getByRole("button", { name: "Done" }).click();
    await expect(page.locator(".modal2")).not.toBeVisible();
  });

  test("send for approval flow works", async ({ page }) => {
    await page.goto("/quote");
    await page.locator('[data-testid="qcard"]').first().click();
    await page.getByRole("button", { name: /Send for approval/ }).click();
    const modal = page.locator(".modal2");
    await modal.locator('[data-testid="a-name"]').fill("Riya Sharma");
    await modal.locator('[data-testid="a-email"]').fill("riya@company.com");
    await modal.locator('[data-testid="a-submit"]').click();
    await expect(page.locator(".modal2 .okbox")).toContainText("Approval request sent");
    await expect(page.locator(".modal2 .okbox .refno")).toContainText(/Ref: NLA-\d+/);
  });

  test("?car= prefills the selection", async ({ page }) => {
    await page.goto("/quote?car=Tata%20Nexon%20EV");
    await expect(page.locator('[data-testid="sel-car"]')).toContainText("Tata Nexon EV");
    await expect(page.locator('[data-testid="quote-builder"]')).toBeVisible();
  });

  test("wishlist tab shows saved cars from across the site", async ({ page }) => {
    await page.goto("/fleet");
    await page.locator('.model[data-name="Hyundai Creta"] .icobtn.wish').click();
    await page.goto("/quote");
    await page.locator('.tab[data-t="wish"]').click();
    const wishCard = page.locator('[data-testid="qcard"]', { hasText: "Hyundai Creta" });
    await expect(wishCard).toBeVisible();
  });
});