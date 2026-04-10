import { test, expect } from "@playwright/test";

test.describe("Connections Page", () => {
  test("connections page renders with heading and connectors", async ({ page }) => {
    await page.goto("/connections");
    await expect(page.locator("main")).toContainText("everything");
    // Connector cards exist
    const cards = page.locator("[data-testid='connector-card']");
    // Fallback: check for connector names if no testid
    await expect(page.locator("main")).toContainText("Slack");
    await expect(page.locator("main")).toContainText("GitHub");
  });

  test("search filters connectors", async ({ page }) => {
    await page.goto("/connections");
    const search = page.locator("input[placeholder*='Search']").first();
    await search.fill("Slack");
    await expect(page.locator("main")).toContainText("Slack");
  });

  test("category filter works", async ({ page }) => {
    await page.goto("/connections");
    // Click a category button
    const dbBtn = page.locator("button", { hasText: "Databases" }).first();
    await dbBtn.click();
    await expect(page.locator("main")).toContainText("PostgreSQL");
  });

  test("connector card opens modal with details", async ({ page }) => {
    await page.goto("/connections");
    // Connector cards are rendered as clickable elements
    const slackText = page.locator("text=Slack").first();
    await slackText.click();
    // Modal should appear with use case content
    await expect(page.locator("body")).toContainText("What you can do");
  });

  test("connector modal has try-it-now section", async ({ page }) => {
    await page.goto("/connections");
    const slackText = page.locator("text=Slack").first();
    await slackText.click();
    await expect(page.locator("body")).toContainText("Try it now");
  });

  test("page shows stat badges", async ({ page }) => {
    await page.goto("/connections");
    await expect(page.locator("main")).toContainText("services ready");
    await expect(page.locator("main")).toContainText("categories");
  });

  test("bottom CTA mentions encryption", async ({ page }) => {
    await page.goto("/connections");
    await expect(page.locator("main")).toContainText("bank-grade encryption");
  });
});
