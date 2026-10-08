import { test, expect, type Page } from "@playwright/test";

/**
 * One section per screen on desktop (styles/stage.css).
 *
 * Before the stage system every marketing section had one fixed height on
 * every viewport (911-1704px measured 2026-09-25): 1.6-3x the usable height of
 * a 1366x768 laptop, and on a 1440p monitor the next section's heading showed
 * under the current one. This spec measures each `[data-stage]` section on the
 * long marketing pages at realistic INNER viewports (screen minus taskbar
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

for (const route of ["/", "/features", "/athena", "/how"]) {
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
          rows: Array.from(document.querySelectorAll<HTMLElement>("[data-stage]")).map((el) => {
            // A fit="fill" section is forced to one stage high, so its height
            // alone cannot show overflow: content can spill past its bottom edge
            // and sit under the next section. Measure the lowest visible box,
            // clipped by any overflow-hiding ancestor (and SVG viewports).
            // Decorative layers - absolutely positioned and pointer-events:none,
            // like a slowly spinning ring whose rotated bounding box is its
            // diagonal - are not content and are skipped.
            const decorative = (n: Element) => {
              for (let a: Element | null = n; a && a !== el; a = a.parentElement) {
                const cs = getComputedStyle(a);
                if (cs.position === "absolute" && cs.pointerEvents === "none") return true;
              }
              return false;
            };
            const box = el.getBoundingClientRect();
            let lowest = box.top;
            for (const node of Array.from(el.querySelectorAll("*"))) {
              const style = getComputedStyle(node);
              if (style.position === "fixed" || style.display === "none" || style.visibility === "hidden") continue;
              if (decorative(node)) continue;
              const rect = node.getBoundingClientRect();
              if (!rect.width || !rect.height) continue;
              let bottom = rect.bottom;
              for (let a = node.parentElement; a && a !== el; a = a.parentElement) {
                if (getComputedStyle(a).overflowY !== "visible" || a.tagName.toLowerCase() === "svg") {
                  bottom = Math.min(bottom, a.getBoundingClientRect().bottom);
                }
              }
              lowest = Math.max(lowest, bottom);
            }
            return {
              key: el.id || el.getAttribute("aria-labelledby") || "(unnamed)",
              height: Math.round(box.height),
              spill: Math.round(lowest - box.bottom),
            };
          }),
        };
      });

      expect(sections.rows.length, "no [data-stage] sections found").toBeGreaterThan(0);

      const overflowing: string[] = [];
      const staleExemptions: string[] = [];
      for (const row of sections.rows) {
        const key = `${route} ${row.key}`;
        const exempt = KNOWN_OVERFLOW[key]?.includes(viewport.name) ?? false;
        const overflows = row.height > sections.stage + 1 || row.spill > 2;
        if (overflows && !exempt)
          overflowing.push(`${key}: ${row.height}px (content spills ${row.spill}px) vs ${Math.round(sections.stage)}px stage`);
        if (!overflows && exempt) staleExemptions.push(`${key} now fits - remove it from KNOWN_OVERFLOW`);
      }
      expect(overflowing, "sections taller than one screen").toEqual([]);
      expect(staleExemptions, "KNOWN_OVERFLOW entries that no longer overflow").toEqual([]);
    });
  }
}

/**
 * Snap control (2026-10-06). The landing, /features, /athena and /how snap every scroll to
 * exactly one section (`html:has([data-snap-page])` in styles/stage.css). It
 * silently did nothing for months: <main> and every StageSection carried
 * `overflow: hidden`, which makes a box a scroll container, and a snap area
 * belongs to its NEAREST scroll container - so the viewport had no snap points
 * and a scroll could stop anywhere. These cases pin both halves: no scroll
 * container between a stage and the viewport, and paging lands on stages.
 */
for (const route of ["/", "/features", "/athena", "/how"]) {
  test(`${route} snaps each page-down to exactly one stage`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 790 });
    await page.goto(route);
    await mountEverything(page);

    const captors = await page.evaluate(() => {
      const found = new Set<string>();
      for (const stage of Array.from(document.querySelectorAll("[data-stage], [data-stage-hero]"))) {
        for (let a = stage.parentElement; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (![cs.overflowX, cs.overflowY].every((v) => v === "visible" || v === "clip"))
            found.add(`<${a.tagName.toLowerCase()} class="${String(a.className).slice(0, 60)}"> overflow ${cs.overflowX}/${cs.overflowY}`);
        }
      }
      return [...found];
    });
    expect(captors, "scroll containers that capture stage snap points (use overflow-clip)").toEqual([]);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(500);
    const offsets: number[] = [];
    const headings: number[] = [];
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("PageDown");
      // Wait for the smooth scroll and its snap to settle (a fixed wait read
      // mid-scroll under parallel load): scrollY unchanged across 250ms.
      let last = -1;
      for (let t = 0; t < 20; t++) {
        await page.waitForTimeout(250);
        const y = await page.evaluate(() => window.scrollY);
        if (y === last) break;
        last = y;
      }
      const at = await page.evaluate(() => {
        const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16;
        const tops = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]")).map((el) => el.getBoundingClientRect().top - navHeight);
        const nearest = tops.reduce((best, top) => (Math.abs(top) < Math.abs(best) ? top : best), Infinity);
        const landed = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]")).find(
          (el) => Math.abs(el.getBoundingClientRect().top - navHeight) < 2,
        );
        // The intro block is the anchor (an eyebrow above the heading is
        // part of it), so sections with and without an eyebrow compare alike.
        const intro = landed?.querySelector("[data-section-intro]") ?? landed?.querySelector("h2");
        return { nearest: Math.round(nearest), heading: intro ? Math.round(intro.getBoundingClientRect().top) : null };
      });
      offsets.push(at.nearest);
      if (at.heading !== null) headings.push(at.heading);
    }
    expect(offsets, "each PageDown lands a stage flush under the navbar").toEqual(offsets.map(() => 0));
    // Every content stage anchors its intro block at one height (stage.css: the
    // column starts at the top; the body fills or centres under the intro).
    expect(new Set(headings).size, `heading tops ${headings.join(", ")}`).toBe(1);
  });
}
