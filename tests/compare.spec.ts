import { test, expect, type Page } from "@playwright/test";

async function openCompareDialog(page: Page) {
  await page.evaluate(() => window.localStorage.removeItem("nl_compare"));
  await page.goto("/fleet");
  await page.locator(".model").first().locator(".icobtn.cmp").click();
  await expect(page.locator("#cmptray")).toBeVisible();
  const trigger = page.locator('[data-testid="header-compare"]');
  await trigger.click();
  const backdrop = page.locator("#cmpBack");
  const dialog = page.locator(".cmp-modal");
  await expect(dialog).toBeVisible();
  return { backdrop, dialog, trigger };
}

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

  test("covers the viewport with a centered compare panel", async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    if (!viewport) return;
    const { backdrop, dialog } = await openCompareDialog(page);
    const backdropBox = await backdrop.boundingBox();
    const dialogBox = await dialog.boundingBox();
    expect(backdropBox).not.toBeNull();
    expect(dialogBox).not.toBeNull();
    if (!backdropBox || !dialogBox) return;

    expect(Math.abs(backdropBox.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(backdropBox.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(backdropBox.width - viewport.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(backdropBox.height - viewport.height)).toBeLessThanOrEqual(1);
    expect(dialogBox.x).toBeGreaterThanOrEqual(0);
    expect(dialogBox.y).toBeGreaterThanOrEqual(0);
    expect(dialogBox.x + dialogBox.width).toBeLessThanOrEqual(viewport.width);
    expect(dialogBox.y + dialogBox.height).toBeLessThanOrEqual(viewport.height);
    expect(Math.abs(dialogBox.x + dialogBox.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(2);
    expect(Math.abs(dialogBox.y + dialogBox.height / 2 - viewport.height / 2)).toBeLessThanOrEqual(2);

    const styles = await backdrop.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        position: computed.position,
        display: computed.display,
        zIndex: computed.zIndex,
        backgroundColor: computed.backgroundColor,
      };
    });
    const panelStyles = await dialog.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        backgroundColor: computed.backgroundColor,
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
      };
    });
    expect(styles.position).toBe("fixed");
    expect(styles.display).toBe("flex");
    expect(Number(styles.zIndex)).toBeGreaterThan(99);
    expect(styles.backgroundColor).not.toBe("transparent");
    expect(panelStyles.backgroundColor).not.toBe("transparent");
    expect(panelStyles.borderRadius).not.toBe("0px");
    expect(panelStyles.boxShadow).not.toBe("none");
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test("keeps the compare panel contained on mobile", async ({ page }) => {
    const viewport = { width: 390, height: 844 };
    await page.setViewportSize(viewport);
    const { dialog } = await openCompareDialog(page);
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();
    if (!dialogBox) return;

    expect(dialogBox.x).toBeGreaterThanOrEqual(0);
    expect(dialogBox.y).toBeGreaterThanOrEqual(0);
    expect(dialogBox.x + dialogBox.width).toBeLessThanOrEqual(viewport.width);
    expect(dialogBox.y + dialogBox.height).toBeLessThanOrEqual(viewport.height);
    expect(dialogBox.width).toBeLessThanOrEqual(viewport.width);
    expect(dialogBox.height).toBeLessThanOrEqual(viewport.height);

    const overflowStyles = await dialog.evaluate((element) => {
      const wrap = element.querySelector<HTMLElement>(".cmp-tbl-wrap");
      return {
        overflow: getComputedStyle(element).overflow,
        tableOverflowX: wrap ? getComputedStyle(wrap).overflowX : "",
      };
    });
    expect(overflowStyles.overflow).toBe("hidden");
    expect(overflowStyles.tableOverflowX).toBe("auto");
  });

  test("closes the compare dialog with Escape and the backdrop", async ({ page }) => {
    const first = await openCompareDialog(page);
    await page.keyboard.press("Escape");
    await expect(first.dialog).toHaveCount(0);
    await expect(first.backdrop).toHaveCount(0);

    const second = await openCompareDialog(page);
    await second.backdrop.click({ position: { x: 1, y: 1 } });
    await expect(second.dialog).toHaveCount(0);
    await expect(second.backdrop).toHaveCount(0);
  });

  test("enters, traps and restores focus around the compare dialog", async ({ page }) => {
    const { dialog, trigger } = await openCompareDialog(page);
    const close = dialog.locator("#cmpX");
    const controls = dialog.locator("a[href],button");
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(controls.last()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("locks body scrolling while the compare dialog is open", async ({ page }) => {
    const previousOverflow = await page.evaluate(() => document.body.style.overflow);
    const { dialog } = await openCompareDialog(page);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toContain("hidden");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
  });
});