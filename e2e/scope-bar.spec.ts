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
 *
 * L3 re-baseline: Executions, the leaderboard and Mission Control now read the
 * demo world (the Board's 99-agent fleet, a 14-day log of ~25k runs; the table
 * pages at 200), so the run counts are read off the scoped list's totals line
 * (`[data-scope-runs]`) and compared, not pinned; the leaderboard ranks 99.
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
/** The scoped list's run count, as the executions view states it (demo). */
async function scopedRuns(page: Page): Promise<number> {
  const runs = page.locator("[data-scope-runs]");
  await expect(runs).toBeVisible();
  return Number(await runs.getAttribute("data-scope-runs"));
}

test.describe("Scope bar", () => {
  test("persona + window narrow the four surfaces, and the default restores them", async ({ page }) => {
    await enterDemo(page);

    // Before: the default scope (All personas, 7 days).
    await goClient(page, "/dashboard/home");
    await expect(page.getByText("Readings cover the last 7 days")).toBeVisible();
    await expect(homeOutcomes(page)).toContainText("Runs");

    await goClient(page, "/dashboard/executions");
    const weekRuns = await scopedRuns(page);
    expect(weekRuns).toBeGreaterThan(1_000);
    await expect(executionRows(page)).toHaveCount(200); // the first page of the scoped log
    await goClient(page, "/dashboard/reviews");
    await expect(reviewRows(page)).toHaveCount(6);
    await goClient(page, "/dashboard/leaderboard");
    await expect(leaderboardRows(page)).toHaveCount(99);

    // After: Incident Responder, last 24 hours.
    await choose(page, "Incident Responder", "24h");
    await expect(leaderboardRows(page)).toHaveCount(1);
    await goClient(page, "/dashboard/executions");
    const dayRuns = await scopedRuns(page);
    expect(dayRuns).toBeGreaterThan(0);
    expect(dayRuns).toBeLessThan(weekRuns);
    await expect(executionRows(page)).toHaveCount(dayRuns);
    for (const row of await executionRows(page).all()) await expect(row).toContainText("Incident Responder");
    await goClient(page, "/dashboard/reviews");
    await expect(reviewRows(page)).toHaveCount(1);
    await goClient(page, "/dashboard/home");
    await expect(page.getByText("Readings cover the last 24 hours")).toBeVisible();

    // Back to All personas + 7 days: the exact prior counts.
    await goClient(page, "/dashboard/executions");
    await choose(page, "All personas", "7d");
    expect(await scopedRuns(page)).toBe(weekRuns);
    await goClient(page, "/dashboard/reviews");
    await expect(reviewRows(page)).toHaveCount(6);
    await goClient(page, "/dashboard/leaderboard");
    await expect(leaderboardRows(page)).toHaveCount(99);
    await goClient(page, "/dashboard/home");
    await expect(page.getByText("Readings cover the last 7 days")).toBeVisible();
  });

  test("a scope that matches nothing says so, apart from 'not served'", async ({ page }) => {
    await enterDemo(page);
    // Every synced agent ran today (the demo world's log), so the empty slice is
    // SLA's breach log: PR Review Agent never breached. Its objective stays listed.
    await goClient(page, "/dashboard/sla");
    await choose(page, "PR Review Agent", "24h");
    await expect(page.getByText("Nothing in this window")).toBeVisible();
    await expect(page.locator("[data-scope-empty]")).toHaveCount(0); // the objective is in scope
    await choose(page, "All personas", "24h");
    await expect(page.getByText("Nothing in this window")).toHaveCount(0);
  });

  test("a reload keeps the selection", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/executions");
    await choose(page, "Incident Responder", "24h");
    expect(await scopedRuns(page)).toBeGreaterThan(0);

    await page.reload();
    await enterDemo(page);
    await goClient(page, "/dashboard/executions");
    await expect(page.getByRole("button", { name: "Persona filter" })).toContainText("Incident Responder");
    await expect(page.getByRole("button", { name: "24h", exact: true })).toHaveAttribute("aria-pressed", "true");
    for (const row of (await executionRows(page).all()).slice(0, 20)) await expect(row).toContainText("Incident Responder");
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
