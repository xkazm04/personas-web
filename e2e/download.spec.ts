import { test, expect } from "@playwright/test";

test.describe("Download Page", () => {
  test("download page renders with platform options", async ({ page }) => {
    await page.goto("/download");
    await expect(page.locator("h1")).toBeVisible();
    // Should mention Windows, macOS, or Linux
    const main = page.locator("main");
    await expect(main).toContainText(/Windows|macOS|Linux/);
  });

  test("download page has system requirements", async ({ page }) => {
    await page.goto("/download");
    const main = page.locator("main");
    await expect(main).toContainText(/requirements|system|compatible/i);
  });

  test("footer has download link", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.locator("a[href='/download']")).toBeVisible();
  });
});
