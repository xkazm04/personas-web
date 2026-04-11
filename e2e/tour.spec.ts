import { test, expect } from "@playwright/test";

test.describe("Product Tour", () => {
  test("tour page renders with steps", async ({ page }) => {
    await page.goto("/tour");
    await expect(page.locator("h1")).toBeVisible();
    // Tour should have step content
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("tour has navigation between steps", async ({ page }) => {
    await page.goto("/tour");
    // Should have some interactive element to progress through the tour
    const buttons = page.locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("navbar has Tour link", async ({ page }) => {
    await page.goto("/");
    const tourLink = page.locator("nav a[href='/tour']").first();
    await expect(tourLink).toBeVisible();
  });
});
