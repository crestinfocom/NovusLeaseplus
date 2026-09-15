import { test, expect } from "@playwright/test";

test.describe("NovusLease+ account auth pages", () => {
  test("login page renders and stays on a single screen", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator(".auth-head h2")).toHaveText("Welcome back");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    const scrollable = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );
    expect(scrollable).toBeLessThanOrEqual(1);
  });

  test("login rejects invalid input with inline errors", async ({ page }) => {
    await page.goto("/login");
    await page.locator(".auth-submit").click();
    await expect(page.locator(".f-error").first()).toContainText("valid email");
    await expect(page.locator(".f-error").last()).toContainText(
      "at least 6 characters"
    );
  });

  test("login accepts valid credentials and shows success", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("aarav@example.com");
    await page.locator("#password").fill("secret123");
    await page.locator(".auth-submit").click();
    await expect(page.locator(".auth-success")).toBeVisible();
    await expect(page.locator(".auth-success h3")).toContainText("signed in");
  });

  test("login footer links to signup", async ({ page }) => {
    await page.goto("/login");
    await page.locator(".auth-foot a[href='/signup']").click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.locator(".auth-head h2")).toContainText("Create your account");
  });

  test("signup page offers corporate, individual, personal & commercial driver", async ({
    page,
  }) => {
    await page.goto("/signup");
    await expect(page.locator(".auth-head h2")).toHaveText("Create your account");
    for (const id of [
      "type-individual",
      "type-corporate",
      "type-personal-driver",
      "type-commercial-driver",
    ]) {
      await expect(page.locator(`[data-testid="${id}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-testid="type-individual"]')).toHaveClass(/active/);
  });

  test("signup switches fields per account type", async ({ page }) => {
    await page.goto("/signup");
    const grid = page.locator(".f-grid");

    await expect(grid.locator("#fullName")).toBeVisible();
    await expect(grid.locator("#password")).toBeVisible();
    await expect(page.locator("#companyName")).toHaveCount(0);

    await page.locator('[data-testid="type-corporate"]').click();
    await expect(page.locator('[data-testid="type-corporate"]')).toHaveClass(/active/);
    await expect(grid.locator("#companyName")).toBeVisible();
    await expect(grid.locator("#contactName")).toBeVisible();
    await expect(grid.locator("#workEmail")).toBeVisible();
    await expect(grid.locator("#gstin")).toBeVisible();
    await expect(page.locator("#fullName")).toHaveCount(0);

    await page.locator('[data-testid="type-personal-driver"]').click();
    await expect(grid.locator("#licenceNumber")).toBeVisible();
    await expect(grid.locator("#licenceExpiry")).toBeVisible();
    await expect(page.locator("#gstin")).toHaveCount(0);

    await page.locator('[data-testid="type-commercial-driver"]').click();
    await expect(grid.locator("#licenceClass")).toBeVisible();
    await expect(grid.locator("#experience")).toBeVisible();
    await expect(grid.locator("#city")).toBeVisible();
  });

  test("signup validates required fields for commercial driver", async ({ page }) => {
    await page.goto("/signup");
    await page.locator('[data-testid="type-commercial-driver"]').click();
    await page.locator(".auth-submit").click();
    const count = await page.locator(".f-error").count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("signup flow completes for each account type", async ({ page }) => {
    await page.goto("/signup");

    await page.locator(".auth-submit").click();
    await page.locator("#fullName").fill("Aarav Sharma");
    await page.locator("#email").fill("aarav@example.com");
    await page.locator("#phone").fill("9876543210");
    await page.locator("#password").fill("secret123");
    await page.locator(".auth-submit").click();
    await expect(page.locator(".auth-success")).toBeVisible();
    await expect(page.locator(".auth-success")).toContainText(/individual/i);

    await page.goto("/signup");
    await page.locator('[data-testid="type-corporate"]').click();
    await page.locator("#companyName").fill("Acme Logistics Pvt. Ltd.");
    await page.locator("#contactName").fill("Priya Nair");
    await page.locator("#workEmail").fill("priya@acme.in");
    await page.locator("#phone").fill("9876543210");
    await page.locator("#password").fill("secret123");
    await page.locator(".auth-submit").click();
    await expect(page.locator(".auth-success")).toBeVisible();
    await expect(page.locator(".auth-success")).toContainText(/corporate/i);

    await page.goto("/signup");
    await page.locator('[data-testid="type-personal-driver"]').click();
    await page.locator("#fullName").fill("Rohan Verma");
    await page.locator("#email").fill("rohan@example.com");
    await page.locator("#phone").fill("9876543210");
    await page.locator("#licenceNumber").fill("MH01202124");
    await page.locator(".auth-submit").click();
    await expect(page.locator(".auth-success")).toContainText(/personal driver/i);

    await page.goto("/signup");
    await page.locator('[data-testid="type-commercial-driver"]').click();
    await page.locator("#fullName").fill("Suresh Kumar");
    await page.locator("#email").fill("suresh@example.com");
    await page.locator("#phone").fill("9876543210");
    await page.locator("#licenceNumber").fill("DL04202200");
    await page.locator("#licenceClass").fill("Transport");
    await page.locator("#experience").fill("6");
    await page.locator("#city").fill("Bengaluru");
    await page.locator(".auth-submit").click();
    await expect(page.locator(".auth-success")).toContainText(/commercial driver/i);
  });

  test("signup page fits one screen (no page scroll)", async ({ page }) => {
    await page.goto("/signup");
    const metrics = await page.evaluate(() => {
      const root = document.querySelector(".auth") as HTMLElement;
      return {
        pageOverflow: document.documentElement.scrollHeight - window.innerHeight,
        authHeight: root.getBoundingClientRect().height,
        innerHeight: window.innerHeight,
      };
    });
    expect(metrics.pageOverflow).toBeLessThanOrEqual(1);
    expect(Math.abs(metrics.authHeight - metrics.innerHeight)).toBeLessThanOrEqual(2);
  });

  test("signup footer links to login", async ({ page }) => {
    await page.goto("/signup");
    await page.locator(".auth-foot a[href='/login']").click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator(".auth-head h2")).toHaveText("Welcome back");
  });

  test("homepage Login / Signup button opens the login page", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("header .nav-cta a[href='/login']");
    await expect(btn).toContainText("Login / Signup");
    await btn.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});