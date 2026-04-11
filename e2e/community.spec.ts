import { test, expect } from "@playwright/test";

test.describe("Community", () => {
  test("community page renders with Discord CTA", async ({ page }) => {
    await page.goto("/community");
    await expect(page.locator("h1")).toBeVisible();
    // Should have Discord join link
    const main = page.locator("main");
    await expect(main).toContainText(/Discord|community/i);
  });

  test("community page has contribution resources", async ({ page }) => {
    await page.goto("/community");
    const main = page.locator("main");
    // Should mention GitHub or contributing
    await expect(main).toContainText(/GitHub|contribute|template|guide/i);
  });
});
