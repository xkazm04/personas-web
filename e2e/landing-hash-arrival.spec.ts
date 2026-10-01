import { test, expect, type Page } from "@playwright/test";

/**
 * `/#download` lands on its section even though the section is lazy and
 * client-only (`ssr: false` + `<LazyMount>`): at first paint there is no
 * `#download` in the DOM, so the browser's own fragment scroll finds nothing.
 * `useHashArrival` (src/hooks/useHashArrival.ts) scrolls the always-present
 * wrapper, waits for the real section to mount, lands on it and moves focus
 * to its heading. The pure table is unit-tested in src/lib/landing-address.ts;
 * this is the same journey against the live DOM.
 */

// The mounted section (`#download`, labelled by `#download-heading`) inside
// the always-present wrapper (`data-scroll-anchor="download"`).
const SECTION = '[data-scroll-anchor="download"] #download';
const HEADING = "#download-heading";

async function expectLandedOnDownload(page: Page) {
  const section = page.locator(SECTION);
  await expect(section).toHaveCount(1);
  await expect(section).toBeInViewport();
  const heading = page.locator(HEADING);
  await expect(heading).toBeInViewport();
  await expect(heading).toBeFocused();
}

test.describe("Home address arrival", () => {
  test("a cold /#download load mounts the lazy download section, scrolls to it and focuses its heading", async ({ page }) => {
    await page.goto("/#download");
    await expectLandedOnDownload(page);
    // The arrival holds the section in place while skeletons above it resolve
    // (REASSERT_MS = 2.5s); it must still be there once that window is over.
    await page.waitForTimeout(3_000); // bounded: outlast the 2.5s re-assert window
    await expect(page.locator(HEADING)).toBeInViewport();
  });

  test("a same-page download link from the hero lands on the section", async ({ page }) => {
    await page.goto("/");
    // At first paint the section has not mounted: the hero CTA points at the
    // always-present wrapper (`#download-section`, an alias of #download)
    // while no installer is published. Assert the precondition so the test
    // cannot pass on a page that already had the section in view.
    await expect(page.locator(SECTION)).toHaveCount(0);
    const link = page.locator('#hero a[href="#download-section"], #hero a[href="#download"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/#download(-section)?$/);
    await expectLandedOnDownload(page);
  });

  test("an in-page link to the canonical #download id lands on the section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(SECTION)).toHaveCount(0);
    // No shipped home-page link uses the bare canonical id today (the hero
    // uses the wrapper alias above), but content links do (FlowCTA, blog
    // copy). Plant one outside React's tree (a fixed overlay on <body>, after
    // the hero has hydrated) so the click is a real same-document fragment
    // navigation with the section still unmounted.
    await expect(page.locator('#hero a[href^="#download"]').first()).toBeVisible();
    await page.evaluate(() => {
      const a = document.createElement("a");
      a.href = "#download";
      a.textContent = "to download";
      a.setAttribute("data-e2e", "canonical-download-link");
      a.style.cssText = "position:fixed;top:8px;left:8px;z-index:2147483647;padding:8px;background:#fff;color:#000";
      document.body.append(a);
    });
    await page.locator('[data-e2e="canonical-download-link"]').click();
    await expect(page).toHaveURL(/#download$/);
    await expectLandedOnDownload(page);
  });
});
