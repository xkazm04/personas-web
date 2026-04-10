import { test, expect } from "@playwright/test";

test.describe("Templates", () => {
  test("templates page renders with category tabs and cards", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.locator("h1")).toBeVisible();
    // Category tabs exist
    await expect(page.locator("button", { hasText: "All" }).first()).toBeVisible();
    // Template cards are rendered (links to detail pages)
    const cards = page.locator("a[href^='/templates/']");
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test("category tab filters templates", async ({ page }) => {
    await page.goto("/templates");
    const financeTab = page.locator("button", { hasText: "Finance" });
    await financeTab.click();
    // Should show only finance templates
    await expect(page.locator("main")).toContainText("Finance");
  });

  test("complexity toggle filters templates", async ({ page }) => {
    await page.goto("/templates");
    const proBtn = page.locator("button", { hasText: "Professional" });
    await proBtn.click();
    // Should show "Showing X of Y" text
    await expect(page.locator("main")).toContainText("Showing");
  });

  test("search filters templates", async ({ page }) => {
    await page.goto("/templates");
    const search = page.locator("input[type='text']").first();
    await search.fill("Slack");
    await expect(page.locator("main")).toContainText("Slack");
  });

  test("clicking a template card navigates to detail page", async ({ page }) => {
    await page.goto("/templates");
    const card = page.locator("a[href='/templates/gmail-inbox-triage']").first();
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL("/templates/gmail-inbox-triage");
  });

  test("template detail page renders content", async ({ page }) => {
    await page.goto("/templates/gmail-inbox-triage");
    // Title visible
    await expect(page.locator("h1")).toBeVisible();
    // Design highlights section
    await expect(page.locator("main")).toContainText("Design Highlights");
    // Config section with copy button
    await expect(page.locator("button", { hasText: "Copy" }).first()).toBeVisible();
    // Download CTA
    await expect(page.locator("a[href*='personas://']")).toBeVisible();
  });

  test("template detail has back link", async ({ page }) => {
    await page.goto("/templates/gmail-inbox-triage");
    const back = page.locator("a", { hasText: "Back to Templates" });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL("/templates");
  });

  test("template detail shows related templates", async ({ page }) => {
    await page.goto("/templates/gmail-inbox-triage");
    await expect(page.locator("main")).toContainText("More");
    // Related template cards exist
    const related = page.locator("a[href^='/templates/']");
    expect(await related.count()).toBeGreaterThanOrEqual(2);
  });
});
