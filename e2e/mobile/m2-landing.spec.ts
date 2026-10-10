import { test, expect, type Page } from "@playwright/test";

/**
 * /m2 "Around the Clock" on a phone (docs/concepts/mobile-revival/PLAN.md, decision M5).
 *
 * Runs only under the Playwright "mobile" project (iPhone 13 profile). The page scrolls inside its
 * own column (`[data-k=scroller]`), so every scroll here drives that element, not the window.
 */

const SCROLLER = '[data-k="scroller"]';
const BAR = '[data-role="bar"] button';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
      if (!window.localStorage.getItem("personas-theme")) {
        window.localStorage.setItem("personas-theme", JSON.stringify({ state: { themeId: "dark-midnight" }, version: 0 }));
      }
    } catch {
      /* storage unavailable */
    }
  });
});

async function open(page: Page) {
  await page.goto("/m2");
  await page.waitForSelector(`${SCROLLER}`);
  // Hydrated once the scroll engine has measured and drawn its first frame.
  await page.waitForSelector("[data-ready]", { state: "attached" });
}

/** Scroll stops through the whole day: the pinned chapters, the FAQ and the CTA. */
async function stops(page: Page): Promise<number[]> {
  const { h, c } = await page.$eval(SCROLLER, (s) => ({ h: s.scrollHeight, c: s.clientHeight }));
  const n = 24;
  return Array.from({ length: n + 1 }, (_, i) => Math.round(((h - c) * i) / n));
}

async function scrollTo(page: Page, y: number) {
  await page.$eval(SCROLLER, (s, top) => ((s as HTMLElement).scrollTop = top), y);
  await page.waitForTimeout(250);
}

test.describe("/m2 Around the Clock", () => {
  test("renders server-side, with the headline in the initial HTML", async ({ request }) => {
    const res = await request.get("/m2");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain("Say it once.");
    expect(html).toMatch(/<h1[^>]*>/);
    expect(html).toContain('name="robots" content="noindex');
  });

  for (const width of [390, 360]) {
    test(`no sideways scroll at ${width}px, and the CTA is visible at every scroll stop`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 844 });
      await open(page);
      const all = await stops(page);
      for (const y of all) {
        await scrollTo(page, y);
        const m = await page.evaluate(
          ({ bar, scroller }) => {
            const doc = document.documentElement;
            const sc = document.querySelector(scroller) as HTMLElement;
            const b = document.querySelector(bar) as HTMLElement;
            const r = b.getBoundingClientRect();
            const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return {
              docWidth: Math.max(doc.scrollWidth, window.innerWidth),
              scrollerOverflow: sc.scrollWidth - sc.clientWidth,
              barTop: r.top,
              barBottom: r.bottom,
              barWidth: r.width,
              barOnTop: !!hit && b.contains(hit),
              vh: window.innerHeight,
            };
          },
          { bar: BAR, scroller: SCROLLER },
        );
        expect(m.docWidth, `page width at scroll ${y}`).toBeLessThanOrEqual(width);
        expect(m.scrollerOverflow, `column overflow at scroll ${y}`).toBeLessThanOrEqual(0);
        expect(m.barBottom, `CTA inside the screen at scroll ${y}`).toBeLessThanOrEqual(m.vh);
        expect(m.barTop).toBeGreaterThan(m.vh / 2);
        expect(m.barWidth).toBeGreaterThan(width * 0.8);
        expect(m.barOnTop, `CTA not covered at scroll ${y}`).toBe(true);
      }
      test.info().annotations.push({ type: "stops", description: `${width}px: ${all.length} scroll stops checked` });
    });
  }

  test("the story's taps: rail, chip, tool beads, cards (Back, Escape, swipe down) and the FAQ dial", async ({ page }) => {
    test.setTimeout(90_000);
    await open(page);
    const top = () => page.$eval(SCROLLER, (s) => s.scrollTop);
    const layer = page.locator('[data-k="layer"]');

    // A run bead opens its scene; Back closes it and returns focus.
    await page.getByRole("button", { name: /^11:20, Client email flagged in Slack/ }).click();
    await expect(layer).toHaveAttribute("data-open", "");
    await expect(page.getByRole("heading", { name: "Client email flagged in Slack" })).toBeVisible();
    await page.getByRole("button", { name: "Back to the dial" }).click();
    await expect(layer).not.toHaveAttribute("data-open", "");

    // A hero step opens its scene; Escape closes it.
    await page.getByRole("button", { name: "Step 3: Connect Gmail and Slack" }).click();
    await expect(layer).toHaveAttribute("data-open", "");
    await page.keyboard.press("Escape");
    await expect(layer).not.toHaveAttribute("data-open", "");

    // The rail jumps to "One persona, every tool"; a tool bead jumps to its shift.
    await page.getByRole("button", { name: "One persona, every tool, 09:30 to 17:00" }).click();
    await expect.poll(top).toBeGreaterThan(500);
    await expect(page.locator('[data-k="stage"]')).toHaveAttribute("data-ch", "1");
    await page.getByRole("button", { name: "Jira, 14:30 shift. Jump to it." }).click();
    await expect(page.locator('[data-k="ch1"]')).toContainText("Jira");
    // A job opens its scene; a swipe down from the top closes it.
    await page.locator('[data-k="ch1"]').getByRole("button", { name: "Blocker detector" }).click();
    await expect(layer).toHaveAttribute("data-open", "");
    const card = layer.locator("section");
    const box = (await card.boundingBox())!;
    const x = box.x + box.width / 2;
    const swipe = { pointerId: 1, pointerType: "touch", isPrimary: true, bubbles: true, clientX: x };
    await card.dispatchEvent("pointerdown", { ...swipe, clientY: box.y + 200 });
    await card.dispatchEvent("pointermove", { ...swipe, clientY: box.y + 260 });
    await card.dispatchEvent("pointermove", { ...swipe, clientY: box.y + 340 });
    await expect(layer).not.toHaveAttribute("data-open", "");

    // Athena's chapter: a moment chip opens her scene.
    await page.getByRole("button", { name: "While you sleep, Athena, 22:00" }).click();
    await expect(page.locator('[data-k="stage"]')).toHaveAttribute("data-ch", "2");
    await page.getByRole("button", { name: "02:10, Remembers what matters" }).click();
    await expect(page.getByRole("heading", { name: "Remembers what matters" })).toBeVisible();
    await page.keyboard.press("Escape");

    // Pricing: a node opens "where a run goes".
    await page.getByRole("button", { name: "All day, free" }).click();
    await expect(page.locator('[data-k="stage"]')).toHaveAttribute("data-ch", "3");
    await page.locator('[data-k="ch3"]').getByRole("button", { name: /Anthropic/ }).click();
    await expect(page.getByText("Where a run goes · 3 of 3")).toBeVisible();
    await page.keyboard.press("Escape");

    // FAQ: a label turns the dial; the arrows step; the knob answers the keyboard.
    await page.getByRole("button", { name: "Ask the dial, questions" }).click();
    await page.getByRole("button", { name: "Telemetry" }).click();
    await expect(page.locator('[data-role="faq-q"]')).toHaveText("Does Personas collect any telemetry or usage data?");
    await page.getByRole("button", { name: "Next question" }).click();
    await expect(page.locator('[data-role="faq-q"]')).toHaveText("Is Personas free?");
    await page.getByRole("slider", { name: "Question dial" }).press("ArrowRight");
    await expect(page.locator('[data-role="faq-q"]')).toHaveText("Are there any limits on the number of agents?");

    // Dragging the knob a quarter turn clockwise snaps to the next question (wrapping to the first).
    const knob = page.getByRole("slider", { name: "Question dial" });
    const k = (await knob.boundingBox())!;
    const cx = k.x + k.width / 2;
    const cy = k.y + k.height / 2;
    const drag = { pointerId: 2, pointerType: "touch", isPrimary: true, bubbles: true };
    await knob.dispatchEvent("pointerdown", { ...drag, clientX: cx, clientY: cy - 60 });
    await knob.dispatchEvent("pointermove", { ...drag, clientX: cx + 42, clientY: cy - 42 });
    await knob.dispatchEvent("pointermove", { ...drag, clientX: cx + 60, clientY: cy });
    await knob.dispatchEvent("pointerup", { ...drag, clientX: cx + 60, clientY: cy });
    await expect(page.locator('[data-role="faq-q"]')).toHaveText("What is Claude Code and why do I need it?");

    // The bar takes you to the CTA, and there it becomes the reminder; the chip goes home.
    await page.locator(BAR).click();
    await expect(page.locator(BAR)).toHaveText(/Add a 9:00 reminder/);
    await page.getByRole("button", { name: "Day one, 09:00" }).click();
    await expect.poll(top).toBeLessThan(5);
    await expect(page.locator('[data-role="chip"]')).toContainText("Day one");
  });

  test("share sends the download link to the share sheet", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __shared: unknown[] };
      w.__shared = [];
      Object.defineProperty(navigator, "share", { configurable: true, value: async (d: unknown) => void w.__shared.push(d) });
    });
    await open(page);
    await page.getByRole("button", { name: "Share", exact: true }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: { url: string }[] }).__shared)).toHaveLength(1);
    const shared = await page.evaluate(() => (window as unknown as { __shared: { url: string }[] }).__shared[0]);
    expect(shared.url).toMatch(/\/\?via=phone&from=m2#download-section$/);
  });

  test("copy puts the link on the clipboard; with no clipboard the link is shown for manual copy", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __copied: string[] };
      w.__copied = [];
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (t: string) => void w.__copied.push(t) } });
    });
    await open(page);
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied)).toEqual([expect.stringMatching(/\?via=phone&from=m2#download-section$/)]);
    await expect(page.getByRole("status").filter({ hasText: "Link copied" })).toBeVisible();

    // Clipboard refused and the textarea fallback refused too: the manual-copy fallback shows.
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => Promise.reject(new Error("denied")) } });
      document.execCommand = () => false;
    });
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByText("Copy this link by hand")).toBeVisible();
    await expect(page.locator('[data-role="handoff-link"]')).toHaveAttribute("data-manual", "");
  });

  test("the reminder downloads an .ics file with a VEVENT", async ({ page }) => {
    await open(page);
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Put 9:00 in my calendar" }).click()]);
    expect(download.suggestedFilename()).toMatch(/\.ics$/);
    const path = await download.path();
    const text = (await import("node:fs")).readFileSync(path!, "utf8");
    expect(text).toContain("BEGIN:VEVENT");
    expect(text).toContain("SUMMARY:Install Personas on my computer");
    expect(text).toMatch(/DTSTART:\d{8}T\d{6}Z/);
  });

  test("Enter while a join is in flight posts once", async ({ page }) => {
    const bodies: unknown[] = [];
    await page.route("**/api/waitlist", async (route) => {
      if (route.request().method() === "POST") {
        bodies.push(route.request().postDataJSON());
        await new Promise((r) => setTimeout(r, 800));
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", count: 3 }) });
      } else await route.fallback();
    });
    await open(page);
    await page.locator('[data-role="optin"]').click();
    await page.locator("button", { hasText: "macOS" }).filter({ hasText: "Waitlist" }).click();
    const field = page.getByPlaceholder("you@example.com");
    await field.fill("someone@example.com");
    await field.press("Enter");
    await field.press("Enter");
    await expect(page.getByText("You're on the macOS waitlist.")).toBeVisible();
    expect(bodies).toEqual([{ email: "someone@example.com", platform: "macos" }]);
  });

  for (const [name, platform] of [
    ["macOS", "macos"],
    ["Linux", "linux"],
  ] as const) {
    test(`${name} joins the waitlist through POST /api/waitlist`, async ({ page }) => {
      const bodies: unknown[] = [];
      await page.route("**/api/waitlist", async (route) => {
        if (route.request().method() === "POST") {
          bodies.push(route.request().postDataJSON());
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "ok", count: 3 }) });
        } else await route.fallback();
      });
      await open(page);
      await page.locator('[data-role="optin"]').click();
      await page.locator("button", { hasText: name }).filter({ hasText: "Waitlist" }).click();
      await page.getByPlaceholder("you@example.com").fill("someone@example.com");
      await page.getByRole("button", { name: "Join waitlist" }).click();
      await expect(page.getByText(`You're on the ${name} waitlist.`)).toBeVisible();
      expect(bodies).toEqual([{ email: "someone@example.com", platform }]);
    });
  }

  test("the light theme applies", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("personas-theme", JSON.stringify({ state: { themeId: "light" }, version: 0 }));
    });
    await open(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const bg = await page.$eval('[data-k="scroller"]', (s) => getComputedStyle(s.parentElement!).backgroundColor);
    // The light theme's --background (#e9e6df), not the dark default.
    expect(bg).toBe("rgb(233, 230, 223)");
  });

  test.describe("reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("leaves no running animation", async ({ page }) => {
      await open(page);
      for (const y of (await stops(page)).filter((_, i) => i % 4 === 0)) {
        await scrollTo(page, y);
        await page.waitForTimeout(400);
        const running = await page.evaluate(() =>
          document
            .getAnimations()
            .filter((a) => a.playState === "running")
            .map((a) => {
              const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
              return `${(a as CSSAnimation).animationName ?? a.constructor.name} on ${t?.tagName.toLowerCase()}.${String(t?.getAttribute("class") ?? "").slice(0, 40)}`;
            }),
        );
        expect(running, `running animations at scroll ${y}`).toEqual([]);
      }
      // No arrival, and the hero's step loop holds still.
      await scrollTo(page, 0);
      await expect(page.locator('[data-k="digits"]')).toHaveText("09:00");
      const step = await page.locator('[data-k="ch0"] button[data-on]').getAttribute("aria-label");
      await page.waitForTimeout(3200);
      expect(await page.locator('[data-k="ch0"] button[data-on]').getAttribute("aria-label")).toBe(step);
    });
  });
});
