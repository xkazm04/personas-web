import { test, expect, type Page } from "@playwright/test";

/**
 * Phone baseline for the /m revival (docs/concepts/mobile-revival/PLAN.md).
 *
 * Runs only under the Playwright "mobile" project (iPhone 13 profile: phone
 * UA, touch, isMobile, 390px wide). It is the instrument every later phase
 * verifies against, since a 375-390px viewport can't be checked by hand on the
 * dev machine.
 */

test.beforeEach(async ({ page }) => {
  // Keep the consent banner out of the measurements (see smoke.spec.ts).
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
    } catch {
      /* storage unavailable: the banner is then part of what is measured */
    }
  });
});

interface Width {
  /**
   * window.innerWidth. NOT a safe yardstick on its own: with isMobile, the
   * browser widens the layout viewport to fit overflowing content (a 600px
   * element makes innerWidth read 600 on a 390px phone), so
   * `scrollWidth <= innerWidth` holds even while the page scrolls sideways.
   * Every check below compares against the device width instead.
   */
  innerWidth: number;
  /** documentElement.scrollWidth as the page ships. */
  scrollWidth: number;
  /**
   * documentElement.scrollWidth with body's `overflow-x: hidden` (globals.css)
   * lifted for the reading, so a clip that one engine honours and another
   * (iOS Safari) may not cannot hide content that overflows.
   */
  unclippedScrollWidth: number;
  /** The widest unclipped offenders, for the report. */
  offenders: string[];
}

async function measure(page: Page, deviceWidth: number): Promise<Width> {
  return page.evaluate((device) => {
    const doc = document.documentElement;
    const body = document.body;
    const innerWidth = window.innerWidth;
    const scrollWidth = doc.scrollWidth;
    const prev = body.style.overflowX;
    body.style.overflowX = "visible";
    const unclippedScrollWidth = doc.scrollWidth;
    const offenders: { right: number; label: string }[] = [];
    if (Math.max(scrollWidth, unclippedScrollWidth, innerWidth) > device) {
      for (const el of Array.from(body.querySelectorAll<HTMLElement>("*"))) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.right <= device + 0.5) continue;
        // Count an element only if nothing between it and body clips it.
        let clipped = false;
        for (let a = el.parentElement; a && a !== body; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (s.position === "fixed" || (s.overflowX !== "visible" && a.getBoundingClientRect().right <= device + 0.5)) {
            clipped = true;
            break;
          }
        }
        if (clipped || getComputedStyle(el).position === "fixed") continue;
        const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 4).join(".") : "";
        const section = el.closest("[id]")?.id ?? "";
        offenders.push({ right: Math.round(r.right), label: `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} in #${section} -> ${Math.round(r.right)}px` });
      }
    }
    body.style.overflowX = prev;
    offenders.sort((a, b) => b.right - a.right);
    return { innerWidth, scrollWidth, unclippedScrollWidth, offenders: offenders.slice(0, 5).map((o) => o.label) };
  }, deviceWidth);
}

test.describe("phone baseline", () => {
  test("/ has no horizontal scroll at phone width, top to bottom", async ({ page }) => {
    test.setTimeout(180_000);
    const device = page.viewportSize()!.width;
    await page.goto("/");
    await page.waitForLoadState("networkidle").catch(() => {});

    // Walk the page so every LazyMount section mounts, measuring at each stop.
    const readings: Width[] = [await measure(page, device)];
    for (let i = 0; i < 80; i++) {
      const done = await page.evaluate(() => {
        window.scrollBy(0, Math.round(window.innerHeight * 0.8));
        return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      });
      await page.waitForTimeout(500);
      readings.push(await measure(page, device));
      if (done) break;
    }

    const widest = (r: Width) => Math.max(r.innerWidth, r.scrollWidth, r.unclippedScrollWidth);
    const worst = readings.reduce((a, b) => (widest(b) > widest(a) ? b : a));
    test.info().annotations.push({
      type: "phone-width",
      description:
        `device ${device}px over ${readings.length} stops: max innerWidth ${Math.max(...readings.map((r) => r.innerWidth))}px, ` +
        `max scrollWidth ${Math.max(...readings.map((r) => r.scrollWidth))}px, ` +
        `max scrollWidth with body overflow-x lifted ${Math.max(...readings.map((r) => r.unclippedScrollWidth))}px; ` +
        `widest: ${worst.offenders.join(" | ") || "none"}`,
    });

    const why = `wider than the ${device}px phone: ${worst.offenders.join(" | ") || "(no single offender found)"}`;
    expect(worst.innerWidth, `layout viewport widened, ${why}`).toBeLessThanOrEqual(device);
    expect(worst.scrollWidth, `documentElement.scrollWidth ${why}`).toBeLessThanOrEqual(device);
    expect(worst.unclippedScrollWidth, `content overflows once body's overflow-x clip is lifted, ${why}`).toBeLessThanOrEqual(device);
  });

  test("a phone on /dashboard/* is not redirected", async ({ page }) => {
    const response = await page.goto("/dashboard/reviews");
    expect(response?.request().redirectedFrom(), "the phone redirect (src/proxy.ts) is retired").toBeNull();
    expect(new URL(page.url()).pathname).toBe("/dashboard/reviews");
  });

  test("an old /m URL redirects to its desktop page, query kept", async ({ page }) => {
    const response = await page.goto("/m/reviews?id=x");
    const hop = response?.request().redirectedFrom();
    expect(hop, "/m/reviews should be a redirect").not.toBeNull();
    // Temporary (307), not permanent: the new /m will take these paths back.
    expect((await hop!.response())?.status()).toBe(307);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/dashboard/reviews");
    expect(url.searchParams.get("id")).toBe("x");
  });
});
