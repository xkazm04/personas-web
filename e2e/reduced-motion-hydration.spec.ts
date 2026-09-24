import { test, expect, type Page } from "@playwright/test";

/**
 * Reduced motion must not cost a visitor their server-rendered page.
 *
 * Every route streams inside the root `loading.tsx` Suspense boundary, which
 * sits under two layout-level ancestors: `QualityProvider` and `PageTransition`.
 * A context change that reaches that boundary before it has hydrated makes
 * React throw the streamed HTML away and client-render the whole page - with no
 * hydration error, no console message and no dev overlay. Both ancestors used
 * to do exactly that, only for visitors who asked for reduced motion:
 * `QualityProvider` flipped `reducedMotion` in its context from an effect, and
 * `PageTransition` flipped its motion.div's `initial`/`animate` props (which
 * framer re-publishes as MotionContext) once `useStillMotion` corrected.
 *
 * The instrument: an init script tags the first `section#event-bus` the parser
 * creates (the streamed one, still inside React's hidden `S:0` holder) and
 * counts every `section#event-bus` that leaves the document for good. React
 * adopting the streamed HTML moves that node; discarding it detaches it.
 */

declare global {
  interface Window {
    __eventBus?: { first: Element | null; detached: number; created: number };
  }
}

function installInstrument() {
  const probe = { first: null as Element | null, detached: 0, created: 0 };
  window.__eventBus = probe;
  const seen = new WeakSet<Element>();
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of Array.from(record.removedNodes)) {
        if (!(node instanceof Element)) continue;
        const hits = node.matches("section#event-bus")
          ? [node]
          : Array.from(node.querySelectorAll("section#event-bus"));
        for (const hit of hits) if (!hit.isConnected) probe.detached++;
      }
    }
    for (const el of Array.from(document.querySelectorAll("section#event-bus"))) {
      if (seen.has(el)) continue;
      seen.add(el);
      probe.created++;
      probe.first ??= el;
    }
  }).observe(document, { childList: true, subtree: true });
}

/** Loads /how and waits until the lazy showcase has mounted inside the page's wrapper. */
async function loadHow(page: Page) {
  await page.addInitScript(installInstrument);
  await page.goto("/how");
  // The page wrapper and the ssr:false showcase's own SectionWrapper share the id;
  // the showcase mounting means the boundary around the page has hydrated.
  await expect(page.locator("section#event-bus")).toHaveCount(2);
  // The discard, when it happens, lands just after that; give it room to show.
  await page.waitForTimeout(1_500);
  return page.evaluate(() => {
    const probe = window.__eventBus!;
    return {
      detached: probe.detached,
      created: probe.created,
      firstStillMounted: probe.first !== null && probe.first === document.querySelector("section#event-bus"),
    };
  });
}

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test.describe(`/how hydration with prefers-reduced-motion: ${reducedMotion}`, () => {
    // Playwright 1.62 ignores `test.use({ reducedMotion })`; contextOptions is honoured.
    test.use({ contextOptions: { reducedMotion } });

    test("the streamed event-bus section is adopted, never discarded and re-rendered", async ({ page }) => {
      const result = await loadHow(page);
      expect(result.detached).toBe(0);
      expect(result.firstStillMounted).toBe(true);
      // The streamed wrapper plus the showcase's own section - no replacement copy.
      expect(result.created).toBe(2);
    });
  });
}
