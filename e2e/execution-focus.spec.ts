import { test, expect, type Page } from "@playwright/test";

/**
 * Exact-row links (tiger D1): a knowledge evidence chip opens the run it names
 * on /dashboard/executions (`?focus=<id>`), Back returns to the source, and an
 * id the demo does not hold opens nothing. Demo mode is in-memory, so the
 * session is entered via /demo and every later move is client-side.
 */

/** Client-side move, as the dashboard's own links do (Next syncs pushState). */
async function goClient(page: Page, href: string) {
  await page.evaluate((to) => window.history.pushState(null, "", to), href);
  await page.waitForURL(`**${href}`);
}

async function enterDemo(page: Page) {
  await page.addInitScript(() => localStorage.setItem("personas-cookie-consent", "essential"));
  await page.goto("/demo");
  await page.waitForURL("**/dashboard/personas");
}

test.describe("Execution focus links", () => {
  test("a pattern's evidence chip opens that exact run; Back returns to Knowledge", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/knowledge");

    // kp_2 (PR Review Agent's oversized-diff failure) cites e-0004-mock.
    await page.getByRole("button", { name: /large_diff_context_overflow/ }).first().click();
    const chip = page.locator("a[href='/dashboard/executions?focus=e-0004-mock']").first();
    await expect(chip).toBeVisible();
    await expect(chip).toContainText("e-0004-m");
    await chip.click();

    await page.waitForURL("**/dashboard/executions?focus=e-0004-mock");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("PR Review Agent");
    await expect(dialog).toContainText("Context window exceeded");

    await page.goBack();
    await page.waitForURL("**/dashboard/knowledge");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(chip).toBeVisible();
  });

  test("the run opens even when the status filter would hide its row", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/executions");
    // Filter to completed runs; e-0004-mock failed.
    await page.getByRole("button", { name: /^Completed/ }).first().click();
    await goClient(page, "/dashboard/executions?focus=e-0004-mock");
    await expect(page.getByRole("dialog")).toContainText("Context window exceeded");
  });

  test("?focus=nope opens the table with no modal", async ({ page }) => {
    await enterDemo(page);
    await goClient(page, "/dashboard/executions?focus=nope");
    await expect(page.locator("[data-tour-diagram='dashboard-executions']")).toBeVisible();
    await expect(page.getByText("PR Review Agent").first()).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
