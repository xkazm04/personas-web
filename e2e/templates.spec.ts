import { test, expect } from "@playwright/test";

// The /templates page is a category-tile hub: the landing view shows one tile
// per category, and template cards (plus search and the complexity filter)
// only render after a category is selected.
test.describe("Templates", () => {
  test("templates hub renders with category tiles", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.locator("h1")).toContainText("Agent Templates");
    await expect(page.locator("h2", { hasText: "Browse templates by category" })).toBeVisible();
    // One tile button per category, each carrying a template count badge
    const tiles = page.locator("button:has(h3)");
    await expect(tiles.first()).toBeVisible();
    expect(await tiles.count()).toBeGreaterThanOrEqual(5);
  });

  test("selecting a category shows its template cards", async ({ page }) => {
    await page.goto("/templates");
    await page.getByRole("button", { name: /Communication/ }).click();
    await expect(page.locator("main")).toContainText(/Showing \d+ of \d+ templates/);
    const cards = page.locator("a[href^='/templates/']");
    await expect(cards.first()).toBeVisible();
    // Back to the hub via "Change category"
    await page.getByRole("button", { name: "Change category" }).click();
    await expect(page.locator("h2", { hasText: "Browse templates by category" })).toBeVisible();
  });

  test("complexity toggle filters within a category", async ({ page }) => {
    await page.goto("/templates");
    await page.getByRole("button", { name: /Communication/ }).click();
    const group = page.locator("[role='group'][aria-label='Filter by complexity']");
    const professional = group.getByRole("button", { name: "Professional" });
    await professional.click();
    await expect(professional).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("main")).toContainText(/Showing \d+ of \d+ templates/);
  });

  test("search filters templates within a category", async ({ page }) => {
    await page.goto("/templates");
    await page.getByRole("button", { name: /Communication/ }).click();
    const search = page.locator("input[placeholder*='Search templates']");
    await search.fill("gmail");
    await expect(page.locator("main")).toContainText(/Showing \d+ of \d+ templates/);
    await expect(page.locator("a[href^='/templates/']").first()).toBeVisible();
  });

  test("clicking a template card navigates to detail page", async ({ page }) => {
    await page.goto("/templates");
    await page.getByRole("button", { name: /Communication/ }).click();
    const card = page.locator("a[href='/templates/gmail-inbox-triage']").first();
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL("/templates/gmail-inbox-triage");
  });
});
