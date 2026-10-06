import { test, expect, type Page } from "@playwright/test";

/**
 * /dashboard/personas on a phone, in demo (PHASE2-SPEC.md 7, item 4; slice
 * E2E-1): the phone layout of the view is agent management. The demo's
 * simulated desktop answers commands on realistic timings (mockCommandPlane:
 * claim at 1.2 s, done at 2.0 s); `?desktop=offline|never` turns it off or
 * away. Demo mode is in-memory, so every test enters through /demo, which
 * forwards its query to the dashboard.
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
}

const DOWNLOAD = "Send the download to my computer";

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
    const row = page.locator("li[data-persona-row]").filter({ hasText: name });
    const chip = row.getByRole("status");
    const state = row.locator("[data-persona-state]");
    await expect(state).toHaveText("Active");

    const t0 = Date.now();
    await pause.click();
    await expect(chip).toHaveText("Sending...");
    await expect(chip).toHaveText("Working...");
    await expect(chip).toHaveText("Done", { timeout: 3_000 });
    const elapsed = Date.now() - t0;
    test.info().annotations.push({ type: "pause-round-trip", description: `${elapsed} ms click -> Done` });
    expect(elapsed).toBeLessThan(3_000);
    await expect(state).toHaveText("Paused");

    const resume = row.getByRole("button", { name: `Resume ${name}` });
    await expect(resume).toBeEnabled();
    await resume.click();
    await expect(chip).toHaveText("Sending...");
    await expect(chip).toHaveText("Working...");
    await expect(chip).toHaveText("Done", { timeout: 3_000 });
    await expect(state).toHaveText("Active");
    await expect(row.getByRole("button", { name: `Pause ${name}` })).toBeEnabled();
  });

  test("?desktop=offline: actions disabled, the open-Personas banner, no download CTA", async ({ page }) => {
    await openDemo(page, "?desktop=offline");
    await expect(page.getByRole("heading", { name: /^Personas isn't running on / })).toBeVisible();
    await expect(page.getByText(/^Last seen .+\. Open it to manage your agents from here\.$/)).toBeVisible();
    const actions = page.locator("li[data-persona-row] button");
    expect(await actions.count()).toBeGreaterThan(0);
    for (const button of await actions.all()) await expect(button).toBeDisabled();
    await expect(page.getByRole("button", { name: DOWNLOAD })).toHaveCount(0);
  });

  test("?desktop=never: the download CTA shows, and no action is offered", async ({ page }) => {
    await openDemo(page, "?desktop=never");
    await expect(page.getByRole("heading", { name: "Connect your computer" })).toBeVisible();
    await expect(page.getByRole("button", { name: DOWNLOAD })).toBeVisible();
    await expect(page.locator("li[data-persona-row] button")).toHaveCount(0);
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
