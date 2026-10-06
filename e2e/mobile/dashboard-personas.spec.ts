import { test, expect, type Page } from "@playwright/test";

/**
 * /dashboard/personas on a phone, in demo (PHASE2-SPEC.md 7, item 4; slice
 * E2E-1, then wave 2: row states, Run, Cancel, Activity): the phone layout of
 * the view is agent management. The demo's simulated desktop answers
 * commands on realistic timings (mockCommandPlane: claim at 1.2 s, done at
 * 2.0 s; a run's execution is queued at 2 s, running at 3 s, completed at
 * 10 s); `?desktop=offline|never` turns it off or away. Demo mode is
 * in-memory, so every test enters through /demo, which forwards its query to
 * the dashboard, and starts from the unchanged fixtures.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
    } catch {
      /* storage unavailable */
    }
  });
});

async function openDemo(page: Page, query = "") {
  await page.goto(`/demo${query}`);
  await page.waitForURL(/\/dashboard\/personas/);
  await expect(page.getByRole("heading", { name: "Your agents" })).toBeVisible();
  await expect(page.locator("li[data-persona-row]").first()).toBeVisible();
  // Row states settle once the runs have loaded (until then only Paused is claimed).
  await expect(page.locator('[data-persona-state="loading"]')).toHaveCount(0);
}

const DOWNLOAD = "Send the download to my computer";

/** A persona row by name, its state line, and its latest command's chip. */
function rowOf(page: Page, name: string) {
  const row = page.locator("li[data-persona-row]").filter({ hasText: name });
  return { row, state: row.locator("[data-persona-state]"), chip: row.getByRole("status") };
}

/** Open the persona's detail sheet and return its Activity entries. */
async function openActivity(page: Page, name: string) {
  await page.getByRole("button", { name: `Open ${name}` }).click();
  const sheet = page.getByRole("dialog", { name });
  await expect(sheet.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  return { sheet, runs: sheet.locator("li[data-activity-run]") };
}

async function closeSheet(page: Page) {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

/** Overflow -> Run... -> prompt -> Run now. */
async function runFromPhone(page: Page, name: string, prompt: string) {
  await page.getByRole("button", { name: `More actions for ${name}` }).click();
  await page.getByRole("dialog", { name }).getByRole("button", { name: "Run..." }).click();
  const sheet = page.getByRole("dialog", { name: `Run ${name}` });
  await sheet.getByLabel("What should it do?").fill(prompt);
  await sheet.getByRole("button", { name: "Run now" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test.describe("phone Personas (demo)", () => {
  test("the demo never offers the desktop download (owner, 2026-10-06)", async ({ page }) => {
    await openDemo(page);
    await expect(page.getByRole("button", { name: /^Pause / }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: DOWNLOAD })).toHaveCount(0);
  });

  test("Pause: Sending... -> Working... -> Done within 3 s, the row reads Paused, and Resume reverses it", async ({ page }) => {
    await openDemo(page);
    const pause = page.getByRole("button", { name: /^Pause / }).first();
    await expect(pause).toBeEnabled();
    const name = (await pause.getAttribute("aria-label"))!.replace(/^Pause /, "");
    const { row, chip, state } = rowOf(page, name);
    const before = await state.getAttribute("data-persona-state");
    expect(before).not.toBe("paused");

    const t0 = Date.now();
    await pause.click();
    await expect(chip).toHaveText("Sending...");
    await expect(chip).toHaveText("Working...");
    await expect(chip).toHaveText("Done", { timeout: 3_000 });
    const elapsed = Date.now() - t0;
    test.info().annotations.push({ type: "pause-round-trip", description: `${elapsed} ms click -> Done` });
    expect(elapsed).toBeLessThan(3_000);
    await expect(state).toHaveAttribute("data-persona-state", "paused");
    await expect(state).toHaveText(/^Paused/);

    const resume = row.getByRole("button", { name: `Resume ${name}` });
    await expect(resume).toBeEnabled();
    await resume.click();
    await expect(chip).toHaveText("Sending...");
    await expect(chip).toHaveText("Working...");
    await expect(chip).toHaveText("Done", { timeout: 3_000 });
    await expect(state).toHaveAttribute("data-persona-state", before!);
    await expect(row.getByRole("button", { name: `Pause ${name}` })).toBeEnabled();
  });

  test("?desktop=offline: Pause, Run and Cancel disabled, Activity still opens, the open-Personas banner, no download CTA", async ({ page }) => {
    await openDemo(page, "?desktop=offline");
    await expect(page.getByRole("heading", { name: /^Personas isn't running on / })).toBeVisible();
    await expect(page.getByText(/^Last seen .+\. Open it to manage your agents from here\.$/)).toBeVisible();
    const actions = page.locator("li[data-persona-row] [data-persona-action]");
    expect(await actions.count()).toBeGreaterThan(0);
    for (const button of await actions.all()) await expect(button).toBeDisabled();
    // The overflow holds Run... and Cancel run: disabled, neither can be reached.
    const more = page.locator('li[data-persona-row] [data-persona-action="more"]');
    expect(await more.count()).toBeGreaterThan(0);
    for (const button of await more.all()) await expect(button).toBeDisabled();
    // Reading is not acting: the detail sheet still opens.
    const { runs } = await openActivity(page, "PR Review Agent");
    await expect(runs.first()).toBeVisible();
    await closeSheet(page);
    await expect(page.getByRole("button", { name: DOWNLOAD })).toHaveCount(0);
  });

  test("?desktop=never: the download CTA shows, and no action is offered", async ({ page }) => {
    await openDemo(page, "?desktop=never");
    await expect(page.getByRole("heading", { name: "Connect your computer" })).toBeVisible();
    await expect(page.getByRole("button", { name: DOWNLOAD })).toBeVisible();
    await expect(page.locator("li[data-persona-row] [data-persona-action]")).toHaveCount(0);
  });

  test("Activity lists the persona's runs, newest first; Chat is a reserved, disabled tab", async ({ page }) => {
    await openDemo(page);
    const { sheet, runs } = await openActivity(page, "PR Review Agent");
    expect(await runs.count()).toBeGreaterThanOrEqual(3);
    const statuses = await runs.evaluateAll((els) => els.map((el) => el.getAttribute("data-run-status")));
    expect(statuses).toEqual(expect.arrayContaining(["running", "failed", "completed"]));
    await expect(runs.first()).toContainText(/Started .+ ago/);
    await expect(sheet.getByRole("tab", { name: /Chat/ })).toBeDisabled();
    await closeSheet(page);
  });

  test("Run...: the sheet sends a run, the row goes Running then Idle, and Activity gains the run", async ({ page }) => {
    const name = "Daily Standup Digest";
    await openDemo(page);
    const { state, chip } = rowOf(page, name);
    await expect(state).toHaveAttribute("data-persona-state", "idle");
    const { runs } = await openActivity(page, name);
    await expect(runs.first()).toBeVisible();
    const before = await runs.count();
    await closeSheet(page);

    await runFromPhone(page, name, "Summarize the pull requests merged yesterday");
    await expect(chip).toHaveText("Sending...");
    await expect(chip).toHaveText("Done", { timeout: 3_000 });
    await expect(state).toHaveAttribute("data-persona-state", "running", { timeout: 5_000 });
    await expect(state).toHaveText("Running");
    await expect(state).toHaveAttribute("data-persona-state", "idle", { timeout: 15_000 });

    const after = await openActivity(page, name);
    await expect(after.runs).toHaveCount(before + 1);
    await expect(after.runs.first()).toHaveAttribute("data-run-status", "completed");
    await expect(after.runs.first()).toContainText(/Took /);
    await expect(after.runs.first()).toContainText(/Cost \$/);
  });

  test("Cancel run during a run: the run ends cancelled and the row goes Idle", async ({ page }) => {
    const name = "Customer Feedback Analyzer";
    await openDemo(page);
    const { state, chip } = rowOf(page, name);
    // No run, no Cancel.
    await page.getByRole("button", { name: `More actions for ${name}` }).click();
    await expect(page.getByRole("dialog", { name }).getByRole("button", { name: "Run..." })).toBeVisible();
    await expect(page.getByRole("dialog", { name }).getByRole("button", { name: "Cancel run" })).toHaveCount(0);
    await closeSheet(page);

    await runFromPhone(page, name, "Group this week's feedback by theme");
    await expect(state).toHaveAttribute("data-persona-state", "running", { timeout: 5_000 });
    await expect(chip).toHaveText("Done");

    await page.getByRole("button", { name: `More actions for ${name}` }).click();
    await page.getByRole("dialog", { name }).getByRole("button", { name: "Cancel run" }).click();
    await expect(chip).toHaveText("Sending...");
    await expect(chip).toHaveText("Done", { timeout: 3_000 });
    await expect(state).toHaveAttribute("data-persona-state", "idle");

    const { runs } = await openActivity(page, name);
    await expect(runs.first()).toHaveAttribute("data-run-status", "cancelled");
    // The run's own timers must not revive it once cancelled (they end 10 s after the send).
    await page.waitForTimeout(8_000);
    await expect(runs.first()).toHaveAttribute("data-run-status", "cancelled");
  });

  test("no horizontal scroll at phone width", async ({ page }) => {
    const device = page.viewportSize()!.width;
    await openDemo(page);
    // Run one command so the chip is part of what is measured.
    await page.getByRole("button", { name: /^Pause / }).first().click();
    await expect(page.locator("li[data-persona-row]").getByRole("status").first()).toHaveText("Done", { timeout: 3_000 });
    const widths = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const prev = body.style.overflowX;
      body.style.overflowX = "visible";
      const unclipped = doc.scrollWidth;
      body.style.overflowX = prev;
      return { innerWidth: window.innerWidth, scrollWidth: doc.scrollWidth, unclipped };
    });
    expect(widths.innerWidth).toBeLessThanOrEqual(device);
    expect(widths.scrollWidth).toBeLessThanOrEqual(device);
    expect(widths.unclipped).toBeLessThanOrEqual(device);
  });
});
