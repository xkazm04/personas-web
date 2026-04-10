import { test, expect } from "@playwright/test";

test.describe("Playground Page", () => {
  test("playground page renders with heading", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("h1")).toContainText("action");
  });

  test("shows 6 example prompt cards", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("main")).toContainText("Triage my inbox");
    await expect(page.locator("main")).toContainText("Review this PR");
    await expect(page.locator("main")).toContainText("Summarize Slack");
    await expect(page.locator("main")).toContainText("Optimize my schedule");
    await expect(page.locator("main")).toContainText("Draft release notes");
    await expect(page.locator("main")).toContainText("Research competitors");
  });

  test("clicking a prompt starts terminal simulation", async ({ page }) => {
    await page.goto("/playground");
    const promptCard = page.locator("button", { hasText: "Triage my inbox" });
    await promptCard.click();
    // Terminal should show execution output after a short delay
    await expect(page.locator("main")).toContainText("Parsing", { timeout: 5000 });
  });

  test("terminal shows completion after simulation", async ({ page }) => {
    await page.goto("/playground");
    const promptCard = page.locator("button", { hasText: "Triage my inbox" });
    await promptCard.click();
    // Wait for completion (simulation takes ~4-5 seconds)
    await expect(page.locator("main")).toContainText("Complete", { timeout: 15000 });
  });

  test("has download CTA at bottom", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("main")).toContainText("Ready to build your own");
    await expect(page.locator("a[href*='download']")).toBeVisible();
  });

  test("has link to templates", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("a[href='/templates']")).toBeVisible();
  });
});
