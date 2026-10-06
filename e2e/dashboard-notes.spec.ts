import { test, expect } from "@playwright/test";

/**
 * /dashboard/notes at desktop width, in demo: the same zones as on a phone,
 * laid out as a board (zone columns side by side), reached from the rail; a
 * card opens its note in a modal. The phone composition has its own spec
 * under e2e/mobile/.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
    } catch {
      /* storage unavailable */
    }
  });
});

test("desktop Notes: the rail opens a board of project zones, and a card opens its note", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demo");
  await page.waitForURL("**/dashboard/personas");

  const link = page.locator('a[href="/dashboard/notes"]').first();
  await expect(link).toBeVisible();
  await link.click();
  await page.waitForURL("**/dashboard/notes");
  await expect(page.getByRole("heading", { level: 1, name: "Notes" })).toBeVisible();

  const zones = page.locator("[data-note-zone]");
  await expect(zones.first()).toBeVisible();
  expect(await zones.count()).toBeGreaterThanOrEqual(3);
  // A board, not a single column: the first two zones sit side by side.
  const [a, b] = [await zones.nth(0).boundingBox(), await zones.nth(1).boundingBox()];
  expect(a && b && Math.abs(a.y - b.y) < 4 && b.x > a.x).toBe(true);

  await page.locator("[data-note-card]").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-note-detail]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
