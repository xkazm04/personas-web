import { test, expect } from "@playwright/test";

test.describe("Use Cases", () => {
  test("use cases hub renders with cards", async ({ page }) => {
    await page.goto("/use-cases");
    await expect(page.locator("h1")).toBeVisible();
    // Should list use case categories
    const links = page.locator("a[href^='/use-cases/']");
    await expect(links.first()).toBeVisible();
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("use case detail page renders", async ({ page }) => {
    await page.goto("/use-cases/development");
    await expect(page.locator("h1")).toBeVisible();
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("navbar has Use Cases link", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("nav a[href='/use-cases']").first();
    await expect(link).toBeVisible();
  });
});
