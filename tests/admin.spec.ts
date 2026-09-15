import { test, expect } from "@playwright/test";

const PANEL_ROUTES = [
  "/admin",
  "/admin/dashboard",
  "/admin/bookings",
  "/admin/fleet",
  "/admin/customers",
  "/admin/offers",
  "/admin/settings",
];

test.describe("NovusLease+ admin console", () => {
  for (const route of PANEL_ROUTES) {
    test(`${route} redirects to admin login when signed out`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin\/login$/);
      await expect(page.locator('[data-testid="admin-login"]')).toBeVisible();
    });
  }

  test("admin login page renders the design card with hint", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator('[data-testid="admin-login"]')).toBeVisible();
    await expect(page.locator(".login-card h2")).toHaveText("Welcome back");
    await expect(page.locator("#adm-email")).toBeVisible();
    await expect(page.locator("#adm-password")).toBeVisible();
    await expect(page.locator(".login-hint")).toContainText("Nova@admin1");
  });

  test("admin login rejects wrong credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#adm-email").fill("admin@novuslease.in");
    await page.locator("#adm-password").fill("wrongpass9");
    await page.locator(".login-btn").click();
    await expect(page.locator('[data-testid="admin-login-error"]')).toContainText(
      "Invalid email or password"
    );
  });

  test("operations account is blocked from the admin console", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.locator("#adm-email").fill("operations@novuslease.in");
    await page.locator("#adm-password").fill("Nova@ops2024");
    await page.locator(".login-btn").click();
    await expect(page.locator('[data-testid="admin-login-error"]')).toContainText(
      "Admin access required"
    );
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("admin can navigate to every view and back to dashboard", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.locator("#adm-email").fill("admin@novuslease.in");
    await page.locator("#adm-password").fill("Nova@admin1");
    await page.locator(".login-btn").click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

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
    await page.goto("/admin/login");
    await page.locator("#adm-email").fill("admin@novuslease.in");
    await page.locator("#adm-password").fill("Nova@admin1");
    await page.locator(".login-btn").click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await expect(page.locator(".stat-grid")).toBeVisible();
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-bookings"]')).toBeVisible();
    await expect(page.locator('[data-testid="fleet-status"]')).toBeVisible();
  });

  test("bookings and fleet lists render seeded rows", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#adm-email").fill("admin@novuslease.in");
    await page.locator("#adm-password").fill("Nova@admin1");
    await page.locator(".login-btn").click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await page.locator('.sb-nav a[href="/admin/bookings"]').click();
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="bookings-table"] tbody tr').first()
    ).toContainText("B1");

    await page.locator('.sb-nav a[href="/admin/fleet"]').click();
    await expect(page.locator('[data-testid="fleet-table"] tbody tr').first()).toContainText(
      "Swift"
    );
  });

  test("admin signs out and returns to the login page", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("#adm-email").fill("admin@novuslease.in");
    await page.locator("#adm-password").fill("Nova@admin1");
    await page.locator(".login-btn").click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await page.locator('button[aria-label="Sign out"]').click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.locator('[data-testid="admin-login"]')).toBeVisible();
  });
});