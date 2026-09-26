import { test, expect, type Page } from "@playwright/test";

const PANEL_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/bookings",
  "/admin/fleet",
  "/admin/customers",
  "/admin/offers",
  "/admin/settings",
];

async function expectLoginDestination(page: Page, next: string) {
  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe("/login");
  const url = new URL(page.url());
  expect(url.searchParams.get("next")).toBe(next);
}

async function loginAsAdmin(page: Page) {
  await page.goto("/login?next=/admin/dashboard");
  await page.locator("#email").fill("admin@novuslease.in");
  await page.locator("#password").fill("Nova@admin1");
  await page.locator(".auth-submit").click();
  await expect(page).toHaveURL((url) => url.pathname === "/admin/dashboard");
  await expect(page.locator(".adm-top h1")).toHaveText("Dashboard");
}

test.describe("NovusLease+ admin console", () => {
  for (const route of PANEL_ROUTES) {
    test(`${route} redirects to the unified login when signed out`, async ({
      page,
    }) => {
      await page.goto(route);
      await expectLoginDestination(page, route);
      await expect(page.locator(".auth-card")).toBeVisible();
    });
  }

  test("admin login compatibility URL redirects to the unified form", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await expectLoginDestination(page, "/admin/dashboard");
    await expect(page.locator(".auth-head h2")).toHaveText("Welcome back");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('[data-testid="demo-accounts"]')).toContainText(
      "Nova@admin1",
    );
  });

  test("unified login rejects wrong credentials", async ({ page }) => {
    await page.goto("/login?next=/admin/dashboard");
    await page.locator("#email").fill("admin@novuslease.in");
    await page.locator("#password").fill("wrongpass9");
    await page.locator(".auth-submit").click();
    await expect(page.locator(".f-error-block")).toContainText(
      "Invalid email or password",
    );
  });

  test("operations account is blocked from the admin console", async ({
    page,
  }) => {
    await page.goto("/login?next=/admin/dashboard");
    await page.locator("#email").fill("operations@novuslease.in");
    await page.locator("#password").fill("Nova@ops2024");
    await page.locator(".auth-submit").click();
    await expect(page.locator(".f-error-block")).toContainText(
      "Admin access required",
    );
    await expectLoginDestination(page, "/admin/dashboard");
  });

  test("admin can use the shared form and navigate to every view", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const views: [string, string][] = [
      ["dashboard", "Dashboard"],
      ["bookings", "Bookings"],
      ["fleet", "Fleet"],
      ["customers", "Customers"],
      ["offers", "Offers & Codes"],
      ["settings", "Settings"],
    ];
    for (const [view, title] of views) {
      await page.locator(`.sb-nav a[href="/admin/${view}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/admin/${view}$`));
      await expect(page.locator(".adm-top h1")).toHaveText(title);
    }
  });

  test("dashboard shows stats, bookings and fleet panels", async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.locator(".stat-grid")).toBeVisible();
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-bookings"]')).toBeVisible();
    await expect(page.locator('[data-testid="fleet-status"]')).toBeVisible();
  });

  test("bookings and fleet lists render seeded rows", async ({ page }) => {
    await loginAsAdmin(page);

    await page.locator('.sb-nav a[href="/admin/bookings"]').click();
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="bookings-table"] tbody tr').first(),
    ).toContainText("B1");

    await page.locator('.sb-nav a[href="/admin/fleet"]').click();
    await expect(page.locator('[data-testid="fleet-table"] tbody tr').first()).toContainText(
      "Swift",
    );
  });

  test("admin signs out and returns to the unified login page", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.locator('button[aria-label="Sign out"]').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator(".auth-card")).toBeVisible();
  });
});
