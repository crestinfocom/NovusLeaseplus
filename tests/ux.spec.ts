import { test, expect } from "@playwright/test";

test.describe("UX / product gap work", () => {
  test("skip link is present and keyboard-focusable", async ({ page }) => {
    await page.goto("/");
    const skip = page.locator(".skip-link");
    await expect(skip).toHaveAttribute("href", "#app-wrap");
    await skip.focus();
    await expect(skip).toBeFocused();
    await expect(skip).toHaveText("Skip to content");
  });

  test("Escape closes the mobile menu and refocuses the burger", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const burger = page.locator('[data-testid="burger"]');
    const menu = page.locator('[data-testid="mobile-menu"]');
    await burger.click();
    await expect(menu).toHaveClass(/open/);
    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveClass(/open/);
    await expect(burger).toBeFocused();
    await expect(menu).toHaveAttribute("aria-hidden", "true");
  });

  test("track link is reachable from the footer", async ({ page }) => {
    await page.goto("/");
    const track = page.locator(".footer a[href='/track']");
    await expect(track).toBeVisible();
    await track.click();
    await expect(page).toHaveURL(/\/track$/);
    await expect(page.locator('[data-testid="track-card"]')).toBeVisible();
  });

  test("fleet filters expose accessible labels and pressed state", async ({
    page,
  }) => {
    await page.goto("/fleet");
    await expect(page.getByRole("textbox", { name: "Search cars" })).toBeVisible();
    const allChip = page.locator(".chips .chip", { hasText: "All cars" });
    await expect(allChip).toHaveAttribute("aria-pressed", "true");
    const luxury = page.locator(".chips .chip", { hasText: "Luxury" });
    await luxury.click();
    await expect(luxury).toHaveAttribute("aria-pressed", "true");
    await expect(allChip).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".resultbar .count")).toBeVisible();
  });

  test("offline banner appears on disconnect, hides on reconnect and dismisses", async ({
    page,
  }) => {
    await page.goto("/");
    const banner = page.getByTestId("offline-banner");
    // Drive the app's own "offline"/"online" listeners. poll() re-fires until
    // React has hydrated and the listener is attached (the first dispatch can
    // otherwise be dropped during hydration).
    await expect
      .poll(async () => {
        await page.evaluate(() => window.dispatchEvent(new Event("offline")));
        return page.locator("[data-testid='offline-banner']").count();
      })
      .toBeGreaterThan(0);
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("offline");
    await expect
      .poll(async () => {
        await page.evaluate(() => window.dispatchEvent(new Event("online")));
        return page.locator("[data-testid='offline-banner']").count();
      })
      .toBe(0);
    await expect
      .poll(async () => {
        await page.evaluate(() => window.dispatchEvent(new Event("offline")));
        return page.locator("[data-testid='offline-banner']").count();
      })
      .toBeGreaterThan(0);
    await page.getByRole("button", { name: "Dismiss offline notice" }).click();
    await expect(banner).toHaveCount(0);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect(banner).toHaveCount(0);
  });

  test("track page validates empty input and shows a status journey", async ({
    page,
  }) => {
    await page.goto("/track");
    await page.getByRole("button", { name: "Track booking" }).click();
    await expect(page.locator(".track-err")).toBeVisible();

    await page.getByLabel("Booking reference").fill("B1042");
    await page.getByRole("button", { name: "Track booking" }).click();
    const result = page.getByTestId("track-result");
    await expect(result).toBeVisible();
    await expect(result).toContainText("B1042");
    await expect(page.getByTestId("track-next")).toBeVisible();
  });

  test("public booking lookup API returns status and journey", async ({
    request,
  }) => {
    const bad = await request.get("/api/bookings/lookup?ref=ZZZZ9Z");
    await expect(bad).not.toBeOK();
    const res = await request.get("/api/bookings/lookup?ref=B1042");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.booking.ref).toBe("B1042");
    expect(json.booking.typeLabel).toBeTruthy();
    expect(json.booking.statusLabel).toBeTruthy();
    expect(json.booking.journey.milestones).toHaveLength(5);
    expect(json.booking.journey.nextActions.length).toBeGreaterThan(0);
    expect(json.booking.totalAmount).toBeGreaterThan(0);
  });

  test("shareable vehicle page has canonical, JSON-LD and term totals", async ({
    page,
  }) => {
    await page.goto("/fleet/maruti-swift");
    await expect(page.locator("h1").first()).toContainText("Maruti Swift");
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toContain("/fleet/maruti-swift");
    const ld = await page.locator('script[type="application/ld+json"]').first().innerText();
    expect(ld).toContain('"@type":"Product"');
    expect(ld).toContain("Maruti Swift");
    await expect(page.locator(".vshare .share-btn").first()).toBeVisible();
    await expect(page.getByTestId("vplan-total-loan")).toContainText("total over 36 months");
  });

  test("other vehicle slugs resolve and the fleet list links to details", async ({
    page,
  }) => {
    await page.goto("/fleet/hyundai-creta");
    await expect(page.locator("h1").first()).toContainText("Hyundai Creta");
    await page.goto("/fleet");
    const card = page.locator('.model[data-name="Hyundai Creta"] .view-btn');
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(/\/fleet\/hyundai-creta$/);
  });

  test("unknown vehicle slug returns a 404", async ({ page }) => {
    const res = await page.goto("/fleet/not-a-real-car");
    expect(res?.status()).toBe(404);
  });

  test("quote builder prices include a term total and accessible controls", async ({
    page,
  }) => {
    await page.goto("/quote");
    await page.locator('[data-testid="qcard"]').first().click();
    await expect(page.getByTestId("qb-term-total")).toContainText("Total over 36 months");
    // plan tabs toggle like buttons
    const sub = page.locator('.ptab[data-p="sub"]');
    await sub.click();
    await expect(sub).toHaveAttribute("aria-pressed", "true");
    // sliders named (all three plan slots include "<unit>/months" labels)
    await expect(page.getByRole("slider", { name: /months/i })).toBeVisible();
  });

  test("quote page includes the fees & charges guide with consistent terms", async ({
    page,
  }) => {
    await page.goto("/quote#fees");
    await expect(page.locator(".fees-sec")).toBeVisible();
    await expect(page.locator(".fee-card")).toHaveCount(6);
    const seo = page.locator(".terms-strip");
    await expect(seo).toContainText("Retail Car Lease");
    await expect(seo).toContainText("Monthly Subscription");
    await page.goto("/");
    await expect(page.locator('[data-testid="footer-terms"]')).toContainText("Rental");
  });

  test("customer and business entry points use the unified login", async ({
    page,
  }) => {
    await page.goto("/");
    const customerLogin = page.locator("header a[href='/login']").first();
    await expect(customerLogin).toHaveText("Login");
    const biz = page.locator('[data-testid="footer-business-login"]');
    await expect(biz).toHaveText(/Business login/);
    await expect(biz).toHaveAttribute(
      "href",
      "/login?next=%2Fadmin%2Fdashboard",
    );

    await page.goto("/admin/login");
    const url = new URL(page.url());
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe("/admin/dashboard");
    await expect(page.locator(".auth-card")).toBeVisible();
  });

  test("compare modal exposes dialog semantics and term totals", async ({
    page,
  }) => {
    await page.goto("/fleet");
    const swift = page.locator('.model[data-name="Maruti Swift"] .icobtn.cmp');
    await swift.click();
    await page.locator('.model[data-name="Hyundai Creta"] .icobtn.cmp').click();
    await page
      .locator("#cmptray")
      .getByRole("button", { name: /Compare/ })
      .click();
    const modal = page.locator("#cmpBack .modal");
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute("role", "dialog");
    await expect(modal).toHaveAttribute("aria-modal", "true");
    await expect(modal).toContainText("Total over 36 months");
    await page.getByLabel("Close compare dialog").click();
    await expect(modal).not.toBeVisible();
  });
});