import { test, expect } from "@playwright/test";

test.describe("Compare Page", () => {
  test("compare page renders with competitor table", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.locator("h1, h2").first()).toContainText(/compare/i);
    // Should show competitor names
    const main = page.locator("main");
    await expect(main).toContainText("Personas");
    await expect(main).toContainText(/CrewAI|LangChain|n8n|AutoGen/);
  });

  test("compare page has verdict section", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByText(/why.*choose/i)).toBeVisible();
  });

  test("compare page has download CTA", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByText(/Download Free/i).first()).toBeVisible();
  });

  test("navbar has Compare link", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("nav a[href='/compare']").first();
    await expect(link).toBeVisible();
  });
});
