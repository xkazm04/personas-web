import { test, expect, type Page } from "@playwright/test";

// The Personas Board as a remote control for the demo PC: the machine card,
// find, the command palette sending a command, triage, the list layout and
// the activity log's command audit. Demo mode is in-memory, so each test
// re-enters it through /demo.

async function openBoard(page: Page, query = "") {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("personas-cookie-consent", "essential");
    } catch {}
  });
  await page.setViewportSize({ width: 1600, height: 960 });
  await page.goto(`/demo${query}`);
  await page.waitForURL(/dashboard\/personas/);
  await expect(page.locator("[data-tile]").first()).toBeVisible();
}

test.describe("Personas Board: remote control of the demo PC", () => {
  test("names the machine, its heartbeat and its run slots", async ({ page }) => {
    await openBoard(page);
    const host = page.getByRole("region", { name: "The computer your agents run on" });
    await expect(host).toContainText("Studio PC");
    await expect(host).toContainText("Online");
    await expect(host).toContainText(/\d+ of \d+/);
    await expect(page).toHaveTitle(/^\(\d+\) /);
  });

  test("offline: the card says so and every control is off", async ({ page }) => {
    await openBoard(page, "?desktop=offline");
    await expect(page.locator("[data-host-status='offline']")).toContainText("Offline");
    await expect(page.getByRole("status").filter({ hasText: "is offline, last seen" })).toBeVisible();
    await expect(page.locator("[data-ctl='pause-all']")).toBeDisabled();
  });

  test("/ finds an agent and Enter opens its console", async ({ page }) => {
    await openBoard(page);
    await page.keyboard.press("/");
    await page.keyboard.type("invoice reconciler");
    await expect(page.locator("#find-status")).toHaveText("1 match");
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-agent-title]")).toContainText("IR01");
    await expect(page.getByRole("tab", { name: "Live log" })).toBeVisible();
  });

  test("the palette pauses an agent through the command plane", async ({ page }) => {
    await openBoard(page);
    await page.keyboard.press("Control+k");
    await page.keyboard.type("pause ir01");
    await expect(page.getByRole("option", { name: /Pause IR01/ })).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").filter({ hasText: "IR01: pausing" })).toBeVisible();
    await page.keyboard.press("e");
    await page.getByRole("radio", { name: /Commands/ }).click();
    const log = page.getByRole("region", { name: "Activity log" });
    await expect(log).toContainText("Pausing");
    await expect(log).toContainText("Done", { timeout: 5_000 });
  });

  test("triage walks the decisions one at a time", async ({ page }) => {
    await openBoard(page);
    await page.keyboard.press("t");
    const triage = page.getByRole("dialog", { name: /Triage/ });
    await expect(triage).toContainText(/1 of \d+/);
    await page.keyboard.press("s");
    await expect(triage).toContainText(/2 of \d+/);
    await expect(triage).toContainText("1 skipped");
    await page.keyboard.press("Escape");
    await expect(triage).toBeHidden();
  });

  test("the list layout sorts and selects for bulk actions", async ({ page }) => {
    await openBoard(page);
    await page.keyboard.press("l");
    const table = page.getByRole("table", { name: "All agents as a table" });
    await expect(table).toBeVisible();
    await table.getByRole("button", { name: "Cost today" }).click();
    await table.locator("tbody tr").nth(0).locator("input[type=checkbox]").click();
    await table.locator("tbody tr").nth(3).locator("input[type=checkbox]").click({ modifiers: ["Shift"] });
    const bar = page.getByRole("toolbar", { name: "Actions for the selected agents" });
    await expect(bar).toContainText("4 selected");
  });
});
