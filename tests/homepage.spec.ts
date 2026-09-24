import { test, expect } from "@playwright/test";

test.describe("NovusLease+ homepage (marketing)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  async function revealAll(page: import("@playwright/test").Page) {
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      const innerH = window.innerHeight;
      let h = document.documentElement.scrollHeight - innerH;
      let guard = 0;
      while (guard++ < 40) {
        for (let y = 0; y <= h; y += 120) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 30));
        }
        window.scrollTo(0, h);
        await new Promise((r) => setTimeout(r, 400));
        const newH = document.documentElement.scrollHeight - innerH;
        if (newH <= h + 1) break;
        h = newH;
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
      await new Promise((r) => setTimeout(r, 500));
    });
  }

  test("critical sections are visible", async ({ page }) => {
    const selectors = [
      "#hdr",
      ".topbar",
      ".hero",
      ".usp-bg",
      "#plans",
      "#models",
      "#how",
      "#faq",
      ".footer",
    ];
    for (const sel of selectors) {
      await expect(page.locator(sel).first()).toBeVisible();
    }
  });

  test("every .reveal receives .in after full scroll", async ({ page }) => {
    const revealCount = await page.locator(".reveal").count();
    expect(revealCount).toBeGreaterThan(12);
    await revealAll(page);
    await page.waitForFunction(
      () => {
        const els = Array.from(document.querySelectorAll(".reveal"));
        return els.length > 12 && els.every((el) => el.classList.contains("in"));
      },
      undefined,
      { timeout: 10_000 }
    );
  });

  test("hero renders headline, eyebrow and CTAs", async ({ page }) => {
    const hero = page.locator(".hero");
    await expect(hero).toContainText("Premium self-drive");
    await expect(hero).toContainText("effortlessly");
    await expect(hero.locator(".hero-actions .btn-gold")).toBeVisible();
    await expect(hero.locator(".hero-actions .btn-gold")).toHaveText(/Get a quote/);
    await expect(hero.locator(".hero-actions .btn-ghost")).toHaveText(/Explore the fleet/);
  });

  test("best-selling models render with quote, wishlist and compare actions", async ({
    page,
  }) => {
    await revealAll(page);
    const cards = page.locator(".rail-model, .car-grid .model, #models .model");
    const n = await cards.count();
    expect(n).toBeGreaterThanOrEqual(5);
    for (const pick of ["Maruti Swift", "Hyundai Creta", "Tata Nexon EV"]) {
      await expect(page.locator(`.model[data-name="${pick}"]`)).toBeVisible();
    }
    const first = page.locator(".model").first();
    await expect(first.locator(".lease-btn")).toHaveText(/Get a quote/);
  });

  test("nav links point to existing sections and pages", async ({ page }) => {
    for (const href of ["#plans", "#models", "#how", "#faq"]) {
      await expect(page.locator(href)).toBeVisible();
    }
    const nav = page.locator("header .navlinks a");
    await expect(nav).toHaveCount(5);
    await expect(nav.nth(1)).toHaveAttribute("href", "/fleet");
    await expect(nav.nth(2)).toHaveAttribute("href", "/compare");
    await expect(nav.nth(3)).toHaveAttribute("href", "/quote");
    await expect(nav.nth(4)).toHaveAttribute("href", "/drive-with-us");
  });

  test("adding cars to compare shows tray and updates header badge", async ({
    page,
  }) => {
    await revealAll(page);
    const swift = page.locator('.model[data-name="Maruti Swift"]');
    await expect(swift).toBeVisible();
    await swift.locator(".icobtn.cmp").click();
    await expect(page.locator(".icobtn.cmp", { hasText: "" }).first()).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    const tray = page.locator("#cmptray");
    await expect(tray).toBeVisible();
    await expect(tray).toContainText("Maruti Swift");
    await expect(page.locator('header [data-testid="header-compare"] .cnt')).toHaveText("1");
  });

  test("wishlist heart saves a car and updates the header counter", async ({
    page,
  }) => {
    await revealAll(page);
    await page.locator('.model[data-name="Hyundai Creta"] .icobtn.wish').click();
    await expect(page.locator('header [data-testid="header-wishlist"] .cnt')).toHaveText("1");
    await expect(page.locator(".model[data-name='Hyundai Creta'] .icobtn.wish")).toHaveClass(/on/);
    // toast appears
    await expect(page.locator("#toastw .toast")).toContainText("Hyundai Creta");
  });

  test("FAQ details toggle open state", async ({ page }) => {
    await revealAll(page);
    const first = page.locator(".faq").first();
    const second = page.locator(".faq").nth(1);
    await expect(first).toHaveAttribute("open", "");

    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
  });

  test("footer contains links and company info", async ({ page }) => {
    const footer = page.locator(".footer");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/NovusLease/);
    expect(await footer.locator("a").count()).toBeGreaterThan(8);
  });

  test("no console errors and all images load after scrolling", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.evaluate(() => {
      for (const img of [...document.images]) {
        img.loading = "eager";
        img.src = img.src;
      }
    });
    await revealAll(page);
    await page.waitForFunction(() =>
      [...document.images].every((img) => img.complete && img.naturalWidth > 0)
    );
    const badImages = await page.evaluate(() =>
      [...document.images]
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src)
    );
    expect(badImages).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("sticky header gains scrolled class on scroll", async ({ page }) => {
    const header = page.locator("#hdr");
    await expect(header).not.toHaveClass(/scrolled/);
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    await expect(header).toHaveClass(/scrolled/);
  });

  test("mobile hamburger opens and closes the navigation menu", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const burger = page.locator('[data-testid="burger"]');
    const menu = page.locator('[data-testid="mobile-menu"]');

    await expect(burger).toBeVisible();
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await expect(menu).not.toHaveClass(/open/);

    await burger.click();
    await expect(menu).toHaveClass(/open/);
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(menu.locator(".mobile-links a")).toHaveCount(5);

    await menu.locator(".mobile-links a", { hasText: "Fleet" }).click();
    await expect(menu).not.toHaveClass(/open/);
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await page.waitForURL("**/fleet");
  });
});