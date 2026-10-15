import { test, expect, type Page } from "@playwright/test";

// D2 "One crew on the stage": five agents on the Personas stage are the five
// synced personas (src/lib/demoCrew.ts), Board and Night shift share one
// world (fleet-monitor/world/fleetWorld.ts), and commands cross between the
// stage and the synced pages through the demo's command plane. Demo mode is
// in-memory, so each test enters through /demo and switches viewport in the
// same page (no reload) to keep the session.

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1600, height: 960 };
// mockCommandPlane completes a command at 2 s; the Board lands one at 1.2 s.
const SETTLE = { timeout: 8_000 };

async function enterDemo(page: Page, viewport: { width: number; height: number }) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("personas-cookie-consent", "essential");
    } catch {}
  });
  await page.setViewportSize(viewport);
  await page.goto("/demo");
  await page.waitForURL(/dashboard\/personas/);
}

/** Open an agent's console on the Board and read whether it is paused (its control offers Resume). */
async function boardShowsPaused(page: Page, agentId: string) {
  await page.locator(`[data-tile="${agentId}"]`).click();
  await expect(page.locator("[data-agent-title]")).toBeVisible();
  await expect(page.locator('[data-ctl="resume"]')).toBeVisible(SETTLE);
  await expect(page.locator('[data-ctl="pause"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-agent-title]")).toHaveCount(0);
}

test.describe("one crew on the stage (demo)", () => {
  test("a pause on the phone holds on the Board, through Night shift and back", async ({ page }) => {
    await enterDemo(page, PHONE);
    const row = page.locator("li[data-persona-row]").filter({ hasText: "PR Review Agent" });
    await expect(row).toBeVisible();
    await page.getByRole("button", { name: "Pause PR Review Agent" }).click();
    await expect(row.locator('[data-persona-state="paused"]')).toBeVisible(SETTLE);

    // Same session, desktop width: the stage. PR Review Agent is fleet agent p004.
    await page.setViewportSize(DESKTOP);
    await expect(page.locator('[data-tile="p004"]')).toBeVisible();
    await expect(page.locator('[data-tile="p004"]')).toHaveAttribute("aria-label", /PR Review Agent/);
    await boardShowsPaused(page, "p004");

    await page.getByRole("tab", { name: "Night shift" }).click();
    const window = page.locator("#ns-w-p004");
    await expect(window).toBeVisible();
    await window.click();
    await expect(page.locator('[data-ctl="resume"]')).toBeVisible(SETTLE);
    await page.keyboard.press("Escape");

    await page.getByRole("tab", { name: "Board" }).click();
    await expect(page.locator('[data-tile="p004"]')).toBeVisible();
    await boardShowsPaused(page, "p004");
  });

  test("Run on the Board shows that run once in Executions, linked from the activity row", async ({ page }) => {
    await enterDemo(page, DESKTOP);
    // Daily Standup Digest is fleet agent p085, resting with a review: Run is offered.
    await page.locator('[data-tile="p085"]').click();
    await page.locator('[data-ctl="run"]').click();
    await page.keyboard.press("Escape");

    await page.keyboard.press("e");
    const log = page.getByRole("region", { name: "Activity log" });
    await page.getByRole("radio", { name: /Your decisions/ }).click();
    const link = log.locator('[data-synced-link="executions"]');
    await expect(link).toHaveCount(1, SETTLE);
    // The plane writes the run 2 s after the Board lands it; give it that before leaving.
    await page.waitForTimeout(2_500);
    await link.click();

    await page.waitForURL(/dashboard\/executions/);
    const runs = page.locator('[role="row"][data-row-id^="exec-"]');
    await expect(runs).toHaveCount(1, SETTLE);
    await expect(runs.first()).toContainText("Daily Standup Digest");

    // A stage-only agent's activity rows carry no synced-page link.
    await page.goBack();
    await page.waitForURL(/dashboard\/personas/);
    await page.locator('[data-tile="p001"]').click();
    await page.locator('[data-ctl="pause"]').click();
    await page.keyboard.press("Escape");
    await page.keyboard.press("e");
    await page.getByRole("radio", { name: /Your decisions/ }).click();
    await expect(log.locator("li").filter({ hasText: "IR01" }).first()).toBeVisible(SETTLE);
    await expect(log.locator("li").filter({ hasText: "IR01" }).locator("[data-synced-link]")).toHaveCount(0);
  });
});
