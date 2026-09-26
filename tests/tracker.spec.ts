import { expect, test, type Page } from "@playwright/test";

const LOOKUP_PATH = "/api/bookings/lookup";
const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PICKED_UP",
  "RETURNED",
  "COMPLETED",
  "CANCELLED",
];

async function loginAsAdmin(page: Page) {
  await page.goto("/login?next=/admin/dashboard");
  await page.locator("#email").fill("admin@novuslease.in");
  await page.locator("#password").fill("Nova@admin1");
  await page.locator(".auth-submit").click();
  await expect(page).toHaveURL((url) => url.pathname === "/admin/dashboard");
  await expect(page.locator(".adm-top h1")).toHaveText("Dashboard");
}

async function lookupInUi(page: Page, reference: string) {
  await page.goto("/track");
  await page.getByLabel("Booking reference").fill(reference);
  await page.getByRole("button", { name: "Track booking" }).click();
}

test.describe("booking tracker", () => {
  test("normalizes a whitespace-padded lowercase legacy reference", async ({
    request,
  }) => {
    const response = await request.get(
      `${LOOKUP_PATH}?ref=${encodeURIComponent("  b1042  ")}`,
    );

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.booking.ref).toBe("B1042");
  });

  test("rejects malformed references and distinguishes an unknown reference", async ({
    request,
  }) => {
    for (const reference of ["B12", "B12345678", "not-a-reference", "ZZZZ9Z"]) {
      const response = await request.get(
        `${LOOKUP_PATH}?ref=${encodeURIComponent(reference)}`,
      );
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.ok).toBe(false);
      expect(typeof body.error).toBe("string");
    }

    const response = await request.get(`${LOOKUP_PATH}?ref=BZZZZ9`);
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toContain("No booking found");
  });

  test("renders confirmed milestones and separate next actions", async ({
    page,
    request,
  }) => {
    const response = await request.get(`${LOOKUP_PATH}?ref=B1042`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.booking.journey.terminal).toBe(false);
    expect(body.booking.journey.milestones).toHaveLength(5);
    expect(body.booking.journey.nextActions.length).toBeGreaterThan(0);
    expect(body.booking.journey.milestones.some((milestone: { state: string }) => milestone.state === "current")).toBe(true);
    expect(body.booking.journey.milestones.some((milestone: { state: string }) => milestone.state === "upcoming")).toBe(true);

    await lookupInUi(page, "  b1042  ");
    const result = page.getByTestId("track-result");
    const timeline = page.getByTestId("track-timeline");
    const actions = page.getByTestId("track-next");

    await expect(result).toBeVisible();
    await expect(page.getByRole("region", { name: /Locked in & confirmed/ })).toBeVisible();
    await expect(timeline.locator('[role="listitem"]')).toHaveCount(5);
    await expect(timeline.locator('[data-state="completed"]')).toHaveCount(2);
    await expect(timeline.locator('[data-state="current"]')).toHaveCount(1);
    await expect(actions).toBeVisible();
    await expect(actions.locator("li")).toHaveCount(
      body.booking.journey.nextActions.length,
    );
    await expect(timeline).not.toContainText(body.booking.journey.nextActions[0]);
  });

  test("keeps completed and cancelled journeys terminal", async ({ page, request }) => {
    for (const [reference, label] of [
      ["B1038", "Completed"],
      ["B1037", "Cancelled"],
    ]) {
      const response = await request.get(`${LOOKUP_PATH}?ref=${reference}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.booking.statusLabel).toBe(label);
      expect(body.booking.journey.terminal).toBe(true);
      expect(body.booking.journey.nextActions).toEqual([]);
      expect(
        body.booking.journey.milestones.some(
          (milestone: { state: string }) => milestone.state === "upcoming",
        ),
      ).toBe(false);

      await lookupInUi(page, reference);
      await expect(page.getByTestId("track-result")).toContainText(label);
      await expect(page.getByTestId("track-next")).toHaveCount(0);
      await expect(page.getByTestId("track-timeline")).not.toContainText("Up next");
    }
  });

  test("returns private no-store data without customer or base amount fields", async ({
    request,
  }) => {
    const response = await request.get(`${LOOKUP_PATH}?ref=B1042`);
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("private");
    expect(response.headers()["cache-control"]).toContain("no-store");

    const body = await response.json();
    expect(body.booking).not.toHaveProperty("customerName");
    expect(body.booking).not.toHaveProperty("baseAmount");
    expect(body.booking.discountAmount).toBeDefined();
    expect(body.booking.totalAmount).toBeGreaterThan(0);
  });

  test("separates HTTP server failures from connection failures", async ({ page }) => {
    await page.goto("/track");
    await page.route("**/api/bookings/lookup*", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Booking lookup is temporarily unavailable. Please try again shortly.",
        }),
      }),
    );

    await page.getByLabel("Booking reference").fill("B1042");
    await page.getByRole("button", { name: "Track booking" }).click();
    const lookupError = page.locator(".track-err");
    await expect(lookupError).toContainText("temporarily unavailable");
    await expect(lookupError).not.toContainText("offline");

    await page.unroute("**/api/bookings/lookup*");
    await page.route("**/api/bookings/lookup*", (route) => route.abort("failed"));
    await page.getByRole("button", { name: "Track booking" }).click();
    await expect(lookupError).toContainText("offline");
  });

  test("creates, tracks, and deletes a secure six-character booking", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const api = page.context().request;

    await page.goto("/admin/bookings");
    await page.getByRole("button", { name: /New booking/ }).click();
    const statusOptions = page.locator("#bk-status option");
    await expect(statusOptions).toHaveCount(6);
    expect(
      await statusOptions.evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      ),
    ).toEqual(STATUSES);
    await page.getByRole("button", { name: "Close" }).click();

    const metaResponse = await api.get("/api/admin/meta");
    expect(metaResponse.status()).toBe(200);
    const meta = await metaResponse.json();
    const customer = meta.customers[0];
    const car = meta.cars[0];
    let createdId = "";
    let createdRef = "";

    try {
      const createResponse = await api.post("/api/admin/bookings", {
        data: {
          userId: customer.id,
          carId: car.id,
          bookingType: "MONTHLY",
          status: "PICKED_UP",
          startDate: "2030-01-01",
          endDate: "2030-01-03",
          amount: 12345,
        },
      });
      const createBody = await createResponse.json();
      createdId = createBody.booking?.id ?? "";
      createdRef = createBody.booking?.bookingRef ?? "";

      expect(createResponse.status()).toBe(201);
      expect(createBody.ok).toBe(true);
      expect(createdRef).toMatch(/^B[A-Z0-9]{5}$/);

      const lookupResponse = await api.get(
        `${LOOKUP_PATH}?ref=${encodeURIComponent(`  ${createdRef.toLowerCase()}  `)}`,
      );
      expect(lookupResponse.status()).toBe(200);
      const lookupBody = await lookupResponse.json();
      expect(lookupBody.booking.ref).toBe(createdRef);
      expect(lookupBody.booking.status).toBe("PICKED_UP");
      expect(lookupBody.booking.journey.nextActions.length).toBeGreaterThan(0);

      const returnedResponse = await api.put(`/api/admin/bookings/${createdId}`, {
        data: { status: "RETURNED" },
      });
      expect(returnedResponse.status()).toBe(200);
      const returnedBody = await returnedResponse.json();
      expect(returnedBody.ok).toBe(true);

      const returnedLookup = await api.get(
        `${LOOKUP_PATH}?ref=${encodeURIComponent(createdRef)}`,
      );
      expect(returnedLookup.status()).toBe(200);
      const returnedData = await returnedLookup.json();
      expect(returnedData.booking.status).toBe("RETURNED");
      expect(returnedData.booking.journey.terminal).toBe(false);
      expect(returnedData.booking.journey.nextActions.length).toBeGreaterThan(0);
      expect(returnedData.booking.journey.milestones.at(-1).state).toBe("current");

      await lookupInUi(page, ` ${createdRef.toLowerCase()} `);
      await expect(page.getByTestId("track-result")).toContainText(createdRef);
      await expect(page.getByTestId("track-result")).toContainText("Returned");
      await expect(page.getByTestId("track-next")).toBeVisible();
    } finally {
      if (createdId) {
        const deleteResponse = await api.delete(`/api/admin/bookings/${createdId}`);
        expect(deleteResponse.status()).toBe(200);
        const gone = await api.get(
          `${LOOKUP_PATH}?ref=${encodeURIComponent(createdRef)}`,
        );
        expect(gone.status()).toBe(404);
      }
    }
  });
});
