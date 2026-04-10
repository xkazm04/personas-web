import { test, expect } from "@playwright/test";

test.describe("Legal Page", () => {
  test("legal page renders with privacy tab active by default", async ({ page }) => {
    await page.goto("/legal");
    await expect(page.locator("main")).toContainText("Privacy Policy");
    await expect(page.locator("main")).toContainText("Your Privacy Matters");
  });

  test("clicking Terms tab switches content", async ({ page }) => {
    await page.goto("/legal");
    const termsTab = page.locator("button", { hasText: "Terms of Service" });
    await termsTab.click();
    await expect(page.locator("main")).toContainText("Terms of Service");
    await expect(page).toHaveURL(/.*#terms/);
  });

  test("clicking Cookie tab switches content", async ({ page }) => {
    await page.goto("/legal");
    const cookieTab = page.locator("button", { hasText: "Cookie Policy" });
    await cookieTab.click();
    await expect(page.locator("main")).toContainText("Cookie");
    await expect(page).toHaveURL(/.*#cookies/);
  });

  test("direct hash navigation works", async ({ page }) => {
    await page.goto("/legal#terms");
    await expect(page.locator("main")).toContainText("Terms of Service");
  });

  test("privacy section mentions encryption", async ({ page }) => {
    await page.goto("/legal#privacy");
    await expect(page.locator("main")).toContainText("AES-256");
  });

  test("terms section mentions user ownership", async ({ page }) => {
    await page.goto("/legal#terms");
    await expect(page.locator("main")).toContainText("yours");
  });
});
