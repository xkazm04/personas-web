import { test, expect } from "@playwright/test";

test.describe("Cookie Consent", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure banner shows
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("personas-cookie-consent"));
  });

  test("cookie banner appears on first visit", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=essential cookies")).toBeVisible({ timeout: 5000 });
  });

  test("Accept All hides banner and saves preference", async ({ page }) => {
    await page.goto("/");
    const acceptBtn = page.locator("button", { hasText: "Accept All" });
    await expect(acceptBtn).toBeVisible({ timeout: 5000 });
    await acceptBtn.click();
    // Banner should disappear
    await expect(page.locator("text=essential cookies")).not.toBeVisible();
    // localStorage should be set
    const value = await page.evaluate(() => localStorage.getItem("personas-cookie-consent"));
    expect(value).toBe("all");
  });

  test("Essential Only hides banner and saves preference", async ({ page }) => {
    await page.goto("/");
    const essentialBtn = page.locator("button", { hasText: "Essential Only" });
    await expect(essentialBtn).toBeVisible({ timeout: 5000 });
    await essentialBtn.click();
    await expect(page.locator("text=essential cookies")).not.toBeVisible();
    const value = await page.evaluate(() => localStorage.getItem("personas-cookie-consent"));
    expect(value).toBe("essential");
  });

  test("banner does not show when preference already saved", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("personas-cookie-consent", "all"));
    await page.goto("/");
    // Wait a moment for potential banner appearance
    await page.waitForTimeout(1000);
    await expect(page.locator("text=essential cookies")).not.toBeVisible();
  });

  test("banner links to legal cookies page", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("a[href='/legal#cookies']");
    await expect(link).toBeVisible({ timeout: 5000 });
  });
});
