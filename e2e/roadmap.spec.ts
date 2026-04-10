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

  test("displays roadmap items with status badges", async ({ page }) => {
    await page.goto("/roadmap");
    // Should show status labels
    await expect(page.locator("main")).toContainText("In Progress");
  });
});
