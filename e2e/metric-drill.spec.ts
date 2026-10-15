import { test, expect, type Page } from "@playwright/test";

/**
 * Metric drill-down (tiger L3 / P23): a run count or a spend figure opens the
 * executions behind it. "Show these runs" sets the scope bar to the figure's
 * persona and exactly the days it sums (a custom range), then Executions
 * states the scoped list's runs and spend, which equal the figure. Demo mode
 * is in-memory, so the session is entered via /demo and every later move is
 * client-side. The same equalities are pinned without a browser in
 * `src/lib/mockFleetConsistency.test.ts` ("a metric drills to exactly the
 * executions behind it").
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

/** "$1,234.56" / "1234" -> number. */
const num = (text: string | null) => Number((text ?? "").replace(/[^0-9.]/g, ""));

/** The executions view's statement of what its scoped list adds up to. */
async function scopedTotals(page: Page) {
  const runs = page.locator("[data-scope-runs]");
  const spend = page.locator("[data-scope-spend]");
  await expect(runs).toBeVisible();
  return {
    runs: Number(await runs.getAttribute("data-scope-runs")),
    spend: await spend.getAttribute("data-scope-spend"),
  };
}

test.describe("Metric drill-down", () => {
  test("Observability's run and spend tiles open exactly the runs behind them", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/observability");

    const runsTile = page.locator('[data-metric-value="Executions"]');
    const costTile = page.locator('[data-metric-value="Total Cost"]');
    await expect(runsTile).toBeVisible();
    const runs = num(await runsTile.textContent());
    const cost = num(await costTile.textContent()).toFixed(2);
    expect(runs).toBeGreaterThan(10_000); // the demo fleet's 14 days

    await page.locator('a[data-drill="all"]').first().click();
    await page.waitForURL("**/dashboard/executions");
    await expect(page.getByRole("button", { name: "Persona filter" })).toContainText("All personas");
    await expect(page.getByText("Custom", { exact: true })).toBeVisible();
    const totals = await scopedTotals(page);
    expect(totals.runs).toBe(runs);
    expect(totals.spend).toBe(cost);

    // Back returns to the figure.
    await page.goBack();
    await page.waitForURL("**/dashboard/observability");
    await expect(runsTile).toBeVisible();
  });

  test("a synced agent's spend row opens that agent's runs over the window", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/observability");

    const drill = page.locator('a[data-drill="p-0002-mock"]'); // Incident Responder
    await expect(drill).toHaveCount(1);
    const row = drill.locator("xpath=..");
    await expect(row).toContainText("Incident Responder");
    const spend = num(await row.locator(".tabular-nums").first().textContent()).toFixed(2);

    await drill.click();
    await page.waitForURL("**/dashboard/executions");
    await expect(page.getByRole("button", { name: "Persona filter" })).toContainText("Incident Responder");
    const totals = await scopedTotals(page);
    expect(totals.spend).toBe(spend);
    expect(totals.runs).toBeGreaterThan(0);
    for (const r of (await page.locator("[data-tour-diagram='dashboard-executions'] [data-row-id]").all()).slice(0, 20)) {
      await expect(r).toContainText("Incident Responder");
    }

    // A stage-only agent (no synced persona) offers no drill: the scope bar cannot hold it.
    await goClient(page, "/dashboard/observability");
    await expect(page.locator('a[data-drill^="fleet-"]')).toHaveCount(0);
  });

  test("Mission Control's run total opens the runs of the days it reads", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/home");
    const outcomes = page.locator("[data-mission-dim='outcomes']");
    await expect(outcomes).toContainText("Runs");
    const runs = Number(/Runs (\d+)/.exec((await outcomes.textContent()) ?? "")?.[1]);
    expect(runs).toBeGreaterThan(0);

    await goClient(page, "/dashboard/home?dim=outcomes");
    await page.locator('a[data-drill="all"]').first().click();
    await page.waitForURL("**/dashboard/executions");
    expect((await scopedTotals(page)).runs).toBe(runs);
  });
});
