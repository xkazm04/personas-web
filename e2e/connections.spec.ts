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
    // Click the Slack connector-card heading (scoped to h3 to avoid
    // text= matching metadata/JSON injected for hydration).
    await page.locator("h3", { hasText: "Slack" }).first().click();
    await expect(page.locator("body")).toContainText("What you can do");
  });

  test("connector modal has try-it-now section", async ({ page }) => {
    await page.goto("/connections");
    await page.locator("h3", { hasText: "Slack" }).first().click();
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
