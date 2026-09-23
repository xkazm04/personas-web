import { test, expect, type Locator, type Page } from "@playwright/test";
import { en } from "../src/i18n/en";

/**
 * The home page's orchestration hub auto-cycles through its triggers, but the
 * visitor owns playback (src/components/sections/orchestration-hub/playback.ts):
 * Pause is a stop only Play lifts, Next steps by one (and stops), Play resumes
 * the cycle. The reducer is unit-tested; this drives the rendered controls
 * (PlaybackControls.tsx) and reads the "n / N" position indicator.
 */

// AUTO_CYCLE_MS in orchestration-hub/data.ts is 9.6s. Waits below are bounded
// by it plus slack for a dev-server render.
const CYCLE_MS = 9_600;
const ADVANCE_TIMEOUT = CYCLE_MS + 6_000;

async function openHub(page: Page) {
  await page.goto("/");
  // The hub is lazy and viewport-gated: scroll its always-present wrapper in,
  // then wait for the mounted section.
  await page.locator('[data-scroll-anchor="pipelines"]').scrollIntoViewIfNeeded();
  const hub = page.locator("#orchestration-hub");
  await expect(hub).toBeVisible();
  const indicator = hub.getByText(/^\d+ \/ \d+$/);
  // Keep the pointer and focus off the ring: hovering or focusing it is a
  // (transient) hold, which would mask what the controls do.
  await page.mouse.move(0, 0);
  await hub.getByRole("button", { name: en.tour.pause }).scrollIntoViewIfNeeded();
  return { hub, indicator };
}

async function position(indicator: Locator): Promise<{ n: number; count: number }> {
  const text = (await indicator.textContent()) ?? "";
  const [n, count] = text.split("/").map((s) => Number(s.trim()));
  return { n, count };
}

const after = (n: number, count: number) => (n % count) + 1;

test.describe("Orchestration hub playback", () => {
  // A saved consent keeps the cookie banner from covering the controls.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("personas-cookie-consent", "essential"));
  });

  test("auto-cycles, Pause stops it, Next steps by one, Play resumes", async ({ page }) => {
    test.setTimeout(120_000);
    const { hub, indicator } = await openHub(page);
    const pause = hub.getByRole("button", { name: en.tour.pause });
    const play = hub.getByRole("button", { name: en.tour.play });

    // 1. It is playing: the indicator advances on its own.
    await expect(pause).toBeVisible();
    const start = await position(indicator);
    expect(start.count).toBeGreaterThan(1);
    await expect(indicator).toHaveText(`${after(start.n, start.count)} / ${start.count}`, { timeout: ADVANCE_TIMEOUT });

    // 2. Pause: the toggle flips to Play and the indicator holds for longer
    //    than a full cycle.
    await pause.click();
    await expect(play).toBeVisible();
    const paused = await position(indicator);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(CYCLE_MS + 1_500); // bounded: > one full auto-cycle interval must pass with no advance
    await expect(indicator).toHaveText(`${paused.n} / ${paused.count}`);
    await expect(play).toBeVisible();

    // 3. Next advances by exactly one and stays stopped.
    await hub.getByRole("button", { name: en.orchestrationHub.nextTrigger }).click();
    const stepped = after(paused.n, paused.count);
    await expect(indicator).toHaveText(`${stepped} / ${paused.count}`);
    await expect(play).toBeVisible();

    // 4. Play resumes the auto-cycle from there.
    await play.click();
    await expect(pause).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(indicator).toHaveText(`${after(stepped, paused.count)} / ${paused.count}`, { timeout: ADVANCE_TIMEOUT });
  });
});
