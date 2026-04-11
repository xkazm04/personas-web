import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test("renders all four tier cards", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1")).toContainText("pricing");

    // Four tier names visible
    await expect(page.getByText("Local")).toBeVisible();
    await expect(page.getByText("Starter")).toBeVisible();
    await expect(page.getByText("Team")).toBeVisible();
    await expect(page.getByText("Builder")).toBeVisible();
  });

  test("shows pricing for each tier", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("$9")).toBeVisible();
    await expect(page.getByText("$29")).toBeVisible();
    await expect(page.getByText("Custom")).toBeVisible();
  });

  test("Team tier is highlighted as most popular", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("feature comparison matrix renders and is collapsible", async ({ page }) => {
    await page.goto("/pricing");

    // Matrix heading
    await expect(page.getByText("every feature")).toBeVisible();

    // Feature rows visible by default
    await expect(page.getByText("Unlimited local agents")).toBeVisible();

    // Collapse button
    const collapseBtn = page.getByText("Collapse feature list");
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();

    // Feature rows hidden after collapse
    await expect(page.getByText("Unlimited local agents")).not.toBeVisible();

    // Expand again
    await page.getByText("Expand feature list").click();
    await expect(page.getByText("Unlimited local agents")).toBeVisible();
  });

  test("FAQ accordion expands and collapses", async ({ page }) => {
    await page.goto("/pricing");

    const faqQuestion = page.getByText("Is the desktop app really free?");
    await expect(faqQuestion).toBeVisible();

    // Click to expand
    await faqQuestion.click();
    await expect(page.getByText("free forever with unlimited local agents")).toBeVisible();

    // Click to collapse
    await faqQuestion.click();
    await expect(page.getByText("free forever with unlimited local agents")).not.toBeVisible();
  });

  test("enterprise CTA section renders", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Need a custom plan?")).toBeVisible();
    await expect(page.getByText("Contact Sales")).toBeVisible();
  });

  test("navbar has Pricing link", async ({ page }) => {
    await page.goto("/");
    const pricingLink = page.locator("nav a[href='/pricing']").first();
    await expect(pricingLink).toBeVisible();
  });
});
