import { test, expect } from "@playwright/test";

// Smoke coverage for the demo dashboard — the flagship product-preview
// surface. Demo mode is in-memory (never persisted), so every hard
// navigation must re-enter it: /demo auto-enters, dashboard/mobile
// sign-in prompts offer an explicit "Try Demo".
test.describe("Dashboard demo", () => {
  test("/demo enters demo mode and lands on dashboard home with a demo badge", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForURL("**/dashboard/home");
    await expect(page.locator("main#main-content")).toBeVisible();
    // The demo session is labeled in the dashboard navbar
    await expect(page.getByText("Demo", { exact: true }).first()).toBeVisible();
  });

  test("demo dashboard home renders dashboard navigation on mock data", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForURL("**/dashboard/home");
    // Sidebar/dashboard links render once the mock stores hydrate
    await expect(page.locator("a[href^='/dashboard/']").first()).toBeVisible();
  });

  test("mobile dashboard is reachable via Try Demo on its sign-in prompt", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/m/overview");
    // A hard navigation resets the in-memory session, so the auth guard
    // shows the sign-in prompt with its always-available demo entry.
    const tryDemo = page.getByRole("button", { name: "Try Demo" });
    await expect(tryDemo).toBeVisible();
    await tryDemo.click();
    // Overview renders with the mobile tab bar once demo mode is active
    await expect(page.locator("a[href='/m/reviews']").first()).toBeVisible();
    await expect(tryDemo).not.toBeVisible();
  });
});
