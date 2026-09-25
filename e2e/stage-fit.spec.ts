import { test, expect, type Page } from "@playwright/test";

/**
 * One section per screen on desktop (styles/stage.css).
 *
 * Before the stage system every marketing section had one fixed height on
 * every viewport (911-1704px measured 2026-09-25): 1.6-3x the usable height of
 * a 1366x768 laptop, and on a 1440p monitor the next section's heading showed
 * under the current one. This spec measures each `[data-stage]` section on the
 * two long marketing pages at realistic INNER viewports (screen minus taskbar
 * and browser chrome - a 1536x864 laptop, i.e. 1080p at 125%, shows ~730px),
 * and fails when a section is taller than the screen under the navbar.
 *
 * Sections whose content still needs its own fitting are listed in
 * KNOWN_OVERFLOW with the viewports they overflow on. The list is a ratchet:
 * it may only shrink. A fitted section left in it fails here too, so it cannot
 * rot into a permanent excuse.
 */

const VIEWPORTS = [
  { name: "1366x768 laptop", width: 1366, height: 657 },
  { name: "1536x864 laptop", width: 1536, height: 730 },
  { name: "1440x900 laptop", width: 1440, height: 790 },
  { name: "1920x1080 desktop", width: 1920, height: 960 },
  { name: "2560x1440 desktop", width: 2560, height: 1300 },
] as const;

type ViewportName = (typeof VIEWPORTS)[number]["name"];

/** `<route> <section id or aria-labelledby>` -> viewports it still overflows. */
const KNOWN_OVERFLOW: Record<string, readonly ViewportName[]> = {
  "/ get-started-heading": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop"],
  "/ team-canvas": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop"],
  "/ vision-grid": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop", "1920x1080 desktop"],
  "/ compare-heading": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop", "1920x1080 desktop", "2560x1440 desktop"],
  "/features design": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop", "1920x1080 desktop", "2560x1440 desktop"],
  "/features memory-layers": ["1366x768 laptop"],
  "/features healing-circuit": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop"],
  "/features security": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop"],
  "/features observe": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop", "1920x1080 desktop"],
  "/features lab": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop", "1920x1080 desktop"],
  "/features plugins": ["1366x768 laptop", "1536x864 laptop", "1440x900 laptop"],
};

/** Scroll the whole page so every LazyMount gate opens and every chunk mounts. */
async function mountEverything(page: Page) {
  let height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height + 1500; y += 600) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(200);
    height = await page.evaluate(() => document.documentElement.scrollHeight);
  }
  await page.waitForTimeout(1000);
}

for (const route of ["/", "/features"]) {
  for (const viewport of VIEWPORTS) {
    test(`${route} fits one section per screen at ${viewport.name}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route);
      await mountEverything(page);

      const sections = await page.evaluate(() => {
        const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16;
        return {
          stage: window.innerHeight - navHeight,
          rows: Array.from(document.querySelectorAll<HTMLElement>("[data-stage]")).map((el) => ({
            key: el.id || el.getAttribute("aria-labelledby") || "(unnamed)",
            height: Math.round(el.getBoundingClientRect().height),
          })),
        };
      });

      expect(sections.rows.length, "no [data-stage] sections found").toBeGreaterThan(0);

      const overflowing: string[] = [];
      const staleExemptions: string[] = [];
      for (const row of sections.rows) {
        const key = `${route} ${row.key}`;
        const exempt = KNOWN_OVERFLOW[key]?.includes(viewport.name) ?? false;
        const overflows = row.height > sections.stage + 1;
        if (overflows && !exempt) overflowing.push(`${key}: ${row.height}px > ${Math.round(sections.stage)}px`);
        if (!overflows && exempt) staleExemptions.push(`${key} now fits - remove it from KNOWN_OVERFLOW`);
      }
      expect(overflowing, "sections taller than one screen").toEqual([]);
      expect(staleExemptions, "KNOWN_OVERFLOW entries that no longer overflow").toEqual([]);
    });
  }
}
