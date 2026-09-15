import { test, expect } from "@playwright/test";

test.describe("NovusLease+ homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  async function revealAll(page: import("@playwright/test").Page) {
    await page.waitForTimeout(600);
    await page.evaluate(async () => {
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

  test("critical sections are visible (reveal animation fires)", async ({ page }) => {
    const selectors = [
      "#hdr",
      "#top.hero",
      ".usp-bg",
      "#offers",
      "#models",
      "#calc",
      "#how",
      "#why",
      "#faq",
      "#footer",
    ];
    for (const sel of selectors) {
      await expect(page.locator(sel).first()).toBeVisible();
    }
  });

  test("every .reveal wrapper receives .in class after full scroll", async ({ page }) => {
    const revealCount = await page.locator(".reveal").count();
    expect(revealCount).toBeGreaterThan(30);
    await revealAll(page);
    const settled = await page
      .locator(".reveal")
      .evaluateAll((els) => els.every((el) => el.classList.contains("in")));
    expect(settled).toBe(true);
  });

  test("hero renders headline, eyebrow and booking CTA", async ({ page }) => {
    const hero = page.locator(".hero");
    await expect(hero).toContainText("Premium self-drive");
    await expect(hero).toContainText("effortlessly");
    await expect(hero.locator(".hero-actions .btn-gold")).toBeVisible();
    await expect(hero.locator(".hero-actions .btn-gold")).toHaveText(/Book your car/);
  });

  test("booking widget toggles daily vs monthly", async ({ page }) => {
    const daily = page.locator('button[data-mode="daily"]');
    const monthly = page.locator('button[data-mode="monthly"]');
    await expect(daily).toHaveClass(/active/);

    await monthly.click();
    await expect(monthly).toHaveClass(/active/);
    await expect(daily).not.toHaveClass(/active/);
    await expect(page.locator("[aria-label='Subscription duration']")).toBeVisible();

    await daily.click();
    await expect(daily).toHaveClass(/active/);
  });

  test("nav links point to existing sections and scroll works", async ({ page }) => {
    const links = page.locator("header .navlinks a");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(6);

    for (const href of ["#offers", "#models", "#calc", "#how", "#why", "#faq"]) {
      await expect(page.locator(href)).toBeVisible();
    }
  });

  test("leasing a car from fleet prefills the calculator and shows chip", async ({
    page,
  }) => {
    await revealAll(page);

    const swift = page.locator('.model[data-name="Maruti Swift"]');
    await expect(swift).toBeVisible();
    await swift.locator(".lease-btn").click();

    const chip = page.locator("#calcChip");
    await expect(chip).toHaveClass(/show/);
    await expect(chip).toContainText("Maruti Swift");

    await expect(page.locator("#v_carPrice")).toHaveText("₹8.00 L");

    await expect(page.locator("#reco")).toBeVisible();
  });

  test("calculator sliders update computed values", async ({ page }) => {
    await revealAll(page);
    const slider = page.locator("#carPrice");
    await slider.evaluate(() => {
      const el = document.getElementById("carPrice") as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;
      if (setter) setter.call(el, "1800000");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("#v_carPrice")).toHaveText("₹18.00 L");
  });

  test("calculator chip can be cleared and resets inputs", async ({ page }) => {
    await revealAll(page);
    await page.locator('.model[data-name="Hyundai Creta"] .lease-btn').click();
    await expect(page.locator("#calcChip")).toHaveClass(/show/);

    await page.locator("#calcChipClear").click();
    await expect(page.locator("#calcChip")).not.toHaveClass(/show/);
    await expect(page.locator("#v_carPrice")).toHaveText("₹15.00 L");
  });

  test("FAQ details toggle open state", async ({ page }) => {
    await revealAll(page);
    const first = page.locator(".faq").first();
    const second = page.locator(".faq").nth(1);
    await expect(first).toHaveAttribute("open", "");

    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
  });

  test("footer contains contact & company links", async ({ page }) => {
    const footer = page.locator("#footer");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/NovusLease/);
    expect(await footer.locator("a").count()).toBeGreaterThan(3);
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
    await expect(page.locator(".mobile-links")).toHaveCSS("display", "block");
    await expect(menu.locator(".mobile-links a")).toHaveCount(6);
    await expect(menu).toContainText("Login / Signup");
    await expect(menu).toContainText("Book a car");

    await menu.locator(".mobile-links a", { hasText: "Fleet" }).click();
    await expect(menu).not.toHaveClass(/open/);
    await expect(burger).toHaveAttribute("aria-expanded", "false");
  });
});