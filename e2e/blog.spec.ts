import { test, expect } from "@playwright/test";

test.describe("Blog", () => {
  test("blog hub renders with post cards", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toBeVisible();
    // At least one blog post card should be visible
    const postLinks = page.locator("a[href^='/blog/']");
    await expect(postLinks.first()).toBeVisible();
    const count = await postLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("blog post page renders content", async ({ page }) => {
    await page.goto("/blog/introducing-personas");
    await expect(page.locator("h1")).toContainText("Introducing Personas");
    // Post should have content
    await expect(page.locator("article")).toBeVisible();
  });

  test("blog has category filters", async ({ page }) => {
    await page.goto("/blog");
    // Category filter buttons or tabs
    await expect(page.getByText("Announcements")).toBeVisible();
  });
});
