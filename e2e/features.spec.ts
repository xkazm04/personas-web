import { test, expect } from "@playwright/test";

test.describe("Feature Deep-Dive Pages", () => {
  test("orchestration page renders with hero and benefits", async ({ page }) => {
    await page.goto("/features/orchestration");
    await expect(page.locator("h1")).toContainText("together");
    // Benefits section
    await expect(page.locator("main")).toContainText("Visual Pipeline Builder");
    await expect(page.locator("main")).toContainText("Automatic Data Flow");
    // Use cases
    await expect(page.locator("main")).toContainText("DevOps Pipeline");
  });

  test("security page renders", async ({ page }) => {
    await page.goto("/features/security");
    await expect(page.locator("h1")).toContainText("yours");
    await expect(page.locator("main")).toContainText("Bank-Grade Encryption");
    await expect(page.locator("main")).toContainText("Zero Cloud Storage");
  });

  test("multi-provider page renders", async ({ page }) => {
    await page.goto("/features/multi-provider");
    await expect(page.locator("h1")).toContainText("one AI");
    await expect(page.locator("main")).toContainText("Freedom of Choice");
    await expect(page.locator("main")).toContainText("Automatic Failover");
  });

  test("genome page renders", async ({ page }) => {
    await page.goto("/features/genome");
    await expect(page.locator("h1")).toContainText("smarter");
    await expect(page.locator("main")).toContainText("Automatic Optimization");
    await expect(page.locator("main")).toContainText("Measurable Improvement");
  });

  test("feature page has FAQ accordion", async ({ page }) => {
    await page.goto("/features/orchestration");
    // FAQ questions visible
    await expect(page.locator("main")).toContainText("How many agents can I connect?");
    // Click to expand
    const faqBtn = page.locator("button", { hasText: "How many agents can I connect?" });
    await faqBtn.click();
    // Answer should be visible
    await expect(page.locator("main")).toContainText("no limit");
  });

  test("feature page has download CTA", async ({ page }) => {
    await page.goto("/features/orchestration");
    await expect(page.locator("main")).toContainText("Build your first pipeline");
  });

  test("feature page has back link to features", async ({ page }) => {
    await page.goto("/features/orchestration");
    const back = page.locator("a", { hasText: "Back to Features" });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL("/features");
  });

  test("landing page capability cards link to deep-dive pages", async ({ page }) => {
    await page.goto("/");
    // VisionGrid should have "Learn more" links
    const learnMore = page.locator("a[href='/features/orchestration']");
    await expect(learnMore.first()).toBeVisible();
  });
});
