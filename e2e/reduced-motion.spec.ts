import { test, expect, type Page } from "@playwright/test";

/**
 * Reduced motion on /how's event-bus SwarmView: the diagram's loops are SMIL
 * (`<animate repeatCount="indefinite">`), which neither framer nor the CSS
 * reduced-motion reset reaches. `useSvgTimelineGate` (src/hooks/useLoopGate.ts)
 * pauses the SVG's own timeline when the loop gate says no, and SwarmView
 * flattens the animated values to a visible rest pose, so a visitor who asked
 * for less motion gets a still diagram - not a blank one.
 */

const SWARM_SVG = '#event-bus [role="tabpanel"] svg[viewBox="0 0 100 100"]';

async function openSwarm(page: Page) {
  await page.goto("/how");
  // The showcase is lazy: bring its stage into view so it mounts and so the
  // in-view decider does not veto on its own (which would pause regardless).
  // Retried: under reduced motion the page's first `section#event-bus` is
  // replaced once during load, and a scroll aimed at the detached node throws.
  await expect(async () => {
    await page.locator("section#event-bus").first().scrollIntoViewIfNeeded({ timeout: 2_000 });
    await page.locator(SWARM_SVG).scrollIntoViewIfNeeded({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  const svg = page.locator(SWARM_SVG);
  await expect(svg).toBeInViewport();
  return svg;
}

/**
 * Whether the swarm's SVG timeline is paused, read with the SVG in view. The
 * page keeps settling while lazy stages above it load, which can push the SVG
 * out of view - and out-of-view is a veto of its own - so every read first
 * brings it back.
 */
async function pausedInView(page: Page): Promise<boolean | null> {
  const svg = page.locator(SWARM_SVG);
  try {
    await svg.scrollIntoViewIfNeeded({ timeout: 2_000 });
    return await svg.evaluate((el) => (el as SVGSVGElement).animationsPaused());
  } catch {
    return null; // replaced mid-read; the poll asks again
  }
}

test.describe("Reduced motion: event-bus swarm", () => {
  test.describe("with prefers-reduced-motion: reduce", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("the swarm renders a still, visible diagram", async ({ page }) => {
      const svg = await openSwarm(page);

      // The SVG timeline is paused while in view ...
      await expect.poll(() => pausedInView(page)).toBe(true);
      await expect(svg).toBeInViewport();
      // ... and actually holds still: document time does not move.
      const t0 = await svg.evaluate((el) => (el as SVGSVGElement).getCurrentTime());
      await page.waitForTimeout(1_000); // bounded: a running timeline would advance ~1s here
      const t1 = await svg.evaluate((el) => (el as SVGSVGElement).getCurrentTime());
      expect(t1).toBe(t0);

      // Every tool node sits at its visible rest pose, not faded out.
      const opacities = await svg.evaluate((el) =>
        Array.from(el.querySelectorAll(":scope > g")).map((g) => Number(getComputedStyle(g).opacity)),
      );
      expect(opacities.length).toBeGreaterThan(0);
      for (const o of opacities) expect(o).toBeGreaterThan(0.5);
    });
  });

  // Control: without the preference the same diagram animates while in view,
  // so the assertions above are about reduced motion, not a timeline that
  // never started.
  test.describe("without a motion preference", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("the swarm's timeline runs while in view", async ({ page }) => {
      const svg = await openSwarm(page);
      await expect.poll(() => pausedInView(page)).toBe(false);
      const t0 = await svg.evaluate((el) => (el as SVGSVGElement).getCurrentTime());
      await expect
        .poll(() => svg.evaluate((el) => (el as SVGSVGElement).getCurrentTime()), { timeout: 5_000 })
        .toBeGreaterThan(t0);
    });
  });
});
