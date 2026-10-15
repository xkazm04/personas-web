import { test, expect, type Page } from "@playwright/test";

/**
 * The scope bar filters what claims it (tiger S1). Choosing Incident Responder
 * and the last 24 hours narrows the execution rows, the review rows, the
 * leaderboard rows and Mission Control's run total; All personas + 7 days
 * restores the exact prior counts; the choice survives a reload. Demo mode is
 * in-memory, so the session is entered via /demo and every later move is
 * client-side (a reload re-enters the demo; the scope is in localStorage).
 *
 * Counts match `src/components/dashboard/scope/scopeProjections.test.ts`.
 */

async function goClient(page: Page, href: string) {
  await page.evaluate((to) => window.history.pushState(null, "", to), href);
  await page.waitForURL(`**${href}`);
}

async function enterDemo(page: Page) {
  await page.addInitScript(() => localStorage.setItem("personas-cookie-consent", "essential"));
  await page.goto("/demo");
  await page.waitForURL("**/dashboard/personas");
}

async function choose(page: Page, persona: string, window: string) {
  await page.getByRole("button", { name: "Persona filter" }).click();
  await page.getByRole("option").filter({ hasText: persona }).click();
  await page.getByRole("button", { name: window, exact: true }).click();
}

const executionRows = (page: Page) => page.locator("[data-tour-diagram='dashboard-executions'] [data-row-id]");
const reviewRows = (page: Page) => page.locator("[data-review-row]");
const leaderboardRows = (page: Page) => page.locator("[data-leaderboard-row]");
const homeOutcomes = (page: Page) => page.locator("[data-mission-dim='outcomes']");

test.describe("Scope bar", () => {
  test("persona + window narrow the four surfaces, and the default restores them", async ({ page }) => {
    await enterDemo(page);

    // Before: the default scope (All personas, 7 days).
    await goClient(page, "/dashboard/home");
    await expect(page.getByText("Readings cover the last 7 days")).toBeVisible();
    await expect(homeOutcomes(page)).toContainText("Runs 24 ·");

    await goClient(page, "/dashboard/executions");
    await expect(executionRows(page)).toHaveCount(12);
    await goClient(page, "/dashboard/reviews");
    await expect(reviewRows(page)).toHaveCount(6);
    await goClient(page, "/dashboard/leaderboard");
    await expect(leaderboardRows(page)).toHaveCount(5);

    // After: Incident Responder, last 24 hours.
    await choose(page, "Incident Responder", "24h");
    await expect(leaderboardRows(page)).toHaveCount(1);
    await goClient(page, "/dashboard/executions");
    await expect(executionRows(page)).toHaveCount(1);
    await goClient(page, "/dashboard/reviews");
    await expect(reviewRows(page)).toHaveCount(1);
    await goClient(page, "/dashboard/home");
    await expect(page.getByText("Readings cover the last 24 hours")).toBeVisible();
    await expect(homeOutcomes(page)).toContainText("Runs 2 ·");

    // Back to All personas + 7 days: the exact prior counts.
    await goClient(page, "/dashboard/executions");
    await choose(page, "All personas", "7d");
    await expect(executionRows(page)).toHaveCount(12);
    await goClient(page, "/dashboard/reviews");
    await expect(reviewRows(page)).toHaveCount(6);
    await goClient(page, "/dashboard/leaderboard");
    await expect(leaderboardRows(page)).toHaveCount(5);
    await goClient(page, "/dashboard/home");
    await expect(homeOutcomes(page)).toContainText("Runs 24 ·");
  });

  test("a scope that matches nothing says so, apart from 'not served'", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/executions");
    // Security Scanner queued no run in the last 24 hours.
    await choose(page, "Security Scanner", "24h");
    await expect(page.locator("[data-scope-empty]")).toContainText("Nothing in this window");
    await page.locator("[data-scope-empty]").getByRole("button", { name: "All personas" }).click();
    await expect(page.locator("[data-scope-empty]")).toHaveCount(0);
  });

  test("a reload keeps the selection", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/executions");
    await choose(page, "Incident Responder", "24h");
    await expect(executionRows(page)).toHaveCount(1);

    await page.reload();
    await enterDemo(page);
    await goClient(page, "/dashboard/executions");
    await expect(page.getByRole("button", { name: "Persona filter" })).toContainText("Incident Responder");
    await expect(page.getByRole("button", { name: "24h", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(executionRows(page)).toHaveCount(1);
  });

  test("Observability renders one Compare control, on the store's flag", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/observability");
    const compare = page.getByRole("button", { name: "Compare" });
    await expect(compare).toHaveCount(1);
    await compare.click();
    await expect(compare).toHaveAttribute("aria-pressed", "true");
    const stored = await page.evaluate(() => localStorage.getItem("dashboard-filter-state"));
    expect(JSON.parse(stored ?? "{}")).toMatchObject({ compareEnabled: true });
  });
});
