import { test, expect } from "@playwright/test";

test.describe("Roadmap Page", () => {
  test("roadmap page renders with heading", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.locator("main")).toContainText("Roadmap");
  });

  test("shows progress bar with phase count", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.locator("main")).toContainText("phases");
  });

  test("shows current focus callout", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.locator("main")).toContainText("cloud");
  });

  test("displays roadmap area cards", async ({ page }) => {
    await page.goto("/roadmap");
    // The rebuilt roadmap renders area cards (AreaCardShell h3 = area.title);
    // the old "In Progress" status badge no longer exists.
    await expect(page.locator("main")).toContainText("Core Platform");
  });
});
