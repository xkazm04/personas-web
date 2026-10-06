import { test, expect, type Page } from "@playwright/test";

/**
 * Reduced motion on /how's event hub (the "Agents that talk to each other"
 * section): its relays, ring sweeps and hub pulses are framer loops driven by
 * `useLoopGate` (src/hooks/useLoopGate.ts) and a step clock that only advances
 * while the gate says yes. A visitor who asked for less motion must get a
 * still, complete diagram - not a blank one, and not a slower loop.
 *
 * The instrument is the illustration itself: two pixel snapshots of the hub
 * art taken ~1.5s apart are identical when it holds still and differ when it
 * runs. The control case (no preference) proves the comparison can tell.
 */

const HUB_ART = '#event-bus [role="tabpanel"] [role="img"]';

async function openHub(page: Page) {
  await page.goto("/how");
  // The section is lazy: bring its stage into view so it mounts and the
  // in-view half of the loop gate does not veto on its own.
  await page.locator("section#event-bus").first().scrollIntoViewIfNeeded();
  const art = page.locator(HUB_ART);
  await art.scrollIntoViewIfNeeded();
  await expect(art).toBeInViewport();
  // Let the entrance reveal settle before sampling.
  await page.waitForTimeout(1_500);
  return art;
}

async function twoSnapshots(page: Page) {
  const art = page.locator(HUB_ART);
  await art.scrollIntoViewIfNeeded();
  const a = await art.screenshot({ animations: "allow" });
  await page.waitForTimeout(1_500);
  await art.scrollIntoViewIfNeeded();
  const b = await art.screenshot({ animations: "allow" });
  return { a, b };
}

test.describe("Reduced motion: event hub", () => {
  test.describe("with prefers-reduced-motion: reduce", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("the hub renders a still, visible diagram", async ({ page }) => {
      const art = await openHub(page);
      const { a, b } = await twoSnapshots(page);
      expect(b.equals(a), "the hub art moved under reduced motion").toBe(true);

      // Still, not blank: every tool on the orbit is drawn at a readable opacity.
      const opacities = await art.evaluate((el) =>
        Array.from(el.querySelectorAll("[data-tool]")).map((n) => {
          let o = 1;
          for (let x: Element | null = n; x && x !== el; x = x.parentElement) o *= Number(getComputedStyle(x).opacity);
          return o;
        }),
      );
      expect(opacities.length).toBeGreaterThan(0);
      for (const o of opacities) expect(o).toBeGreaterThan(0.3);
    });
  });

  // Control: without the preference the same diagram animates while in view,
  // so the assertion above is about reduced motion, not art that never moves.
  test.describe("without a motion preference", () => {
    test.use({ contextOptions: { reducedMotion: "no-preference" } });

    test("the hub animates while in view", async ({ page }) => {
      await openHub(page);
      const { a, b } = await twoSnapshots(page);
      expect(b.equals(a), "the hub art never moved").toBe(false);
    });
  });
});
