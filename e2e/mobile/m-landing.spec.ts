import { test, expect, type Page } from "@playwright/test";

/**
 * /m - the "Hive Reels" phone landing (docs/features/platform/mobile-app-shell.md).
 *
 * Runs under the Playwright "mobile" project (iPhone 13: phone UA, touch, 390x844). The page is a
 * fixed phone column whose six posters scroll inside `main.film`, so every check walks the film,
 * not the window.
 */

const POSTERS = 6;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
      if (!window.localStorage.getItem("personas-theme")) {
        window.localStorage.setItem("personas-theme", JSON.stringify({ state: { themeId: "dark-midnight" }, version: 0 }));
      }
    } catch {
      /* storage unavailable: the page still renders */
    }
  });
});

async function open(page: Page) {
  await page.goto("/m");
  await expect(page.locator("main.film [data-poster]")).toHaveCount(POSTERS);
}

/** Scroll the film so poster `i` fills the screen, then let its arrival settle. */
async function toPoster(page: Page, i: number) {
  await page.evaluate((i) => {
    const film = document.querySelector<HTMLElement>("main.film")!;
    film.scrollTop = film.querySelectorAll<HTMLElement>("[data-poster]")[i].offsetTop;
  }, i);
  await expect(page.locator("[data-poster]").nth(i)).toHaveClass(/\bon\b/);
}

/** Widths that would mean a sideways scroll, measured against the device width (see baseline.spec.ts). */
async function widths(page: Page) {
  return page.evaluate(() => {
    const film = document.querySelector<HTMLElement>("main.film")!;
    return {
      inner: window.innerWidth,
      doc: document.documentElement.scrollWidth,
      film: film.scrollWidth,
      filmClient: film.clientWidth,
    };
  });
}

test.describe("/m phone landing", () => {
  test("renders server-side with the headline in the initial HTML, not indexed", async ({ request }) => {
    const res = await request.get("/m");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<h1[^>]*>[\s\S]*One event in\.[\s\S]*A whole team[\s\S]*on it\.[\s\S]*<\/h1>/);
    expect(html).toMatch(/<meta name="robots" content="noindex/);
    // Canonical to the site root, so /m never competes with / in search.
    expect(html).toMatch(/<link rel="canonical" href="https?:\/\/[^"/]+\/?"/);
  });

  for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 780 }]) {
    test(`no sideways scroll at ${vp.width}px, and the CTA is on screen at every stop`, async ({ page }) => {
      await page.setViewportSize(vp);
      await open(page);
      const cta = page.locator("[data-role=m-cta]");
      for (let i = 0; i < POSTERS; i++) {
        await toPoster(page, i);
        const w = await widths(page);
        expect(w.inner, `layout viewport widened on poster ${i + 1}`).toBeLessThanOrEqual(vp.width);
        expect(w.doc, `document scrolls sideways on poster ${i + 1}`).toBeLessThanOrEqual(vp.width);
        expect(w.film, `film scrolls sideways on poster ${i + 1}`).toBeLessThanOrEqual(w.filmClient);
        const box = await cta.boundingBox();
        expect(box, `CTA has no box on poster ${i + 1}`).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height);
        // Nothing covers it: the topmost element at its centre is the button (or inside it).
        const hit = await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest("[data-role=m-cta]"), { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 });
        expect(hit, `CTA covered on poster ${i + 1}`).toBe(true);
      }
    });
  }

  test("the dock CTA jumps to the last poster, then shares the download link", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (d: ShareData) => {
          (window as unknown as { __shared: ShareData }).__shared = d;
        },
      });
    });
    await open(page);
    await page.locator("[data-role=m-cta]").click();
    await expect(page.locator("#s6")).toHaveClass(/\bon\b/);
    await page.locator("[data-role=m-cta]").click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shared?: ShareData }).__shared?.url ?? "")).toMatch(/\/#download-section$/);
    await expect(page.locator("[data-role=m-cta]")).toHaveAttribute("data-mode", "sent");
  });

  test("Copy link reaches the clipboard, and a blocked clipboard shows the link to copy by hand", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __copied: string[]; __blockCopy: boolean };
      w.__copied = [];
      w.__blockCopy = false;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (t: string) => {
            if (w.__blockCopy) throw new Error("blocked");
            w.__copied.push(t);
          },
        },
      });
    });
    await open(page);
    await toPoster(page, 5);
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied[0] ?? "")).toMatch(/\/#download-section$/);
    await page.evaluate(() => ((window as unknown as { __blockCopy: boolean }).__blockCopy = true));
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.locator(".manual-url")).toHaveValue(/\/#download-section$/);
  });

  test("Add a reminder downloads an .ics with a VEVENT", async ({ page }) => {
    await open(page);
    await toPoster(page, 5);
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("button", { hasText: "Add a reminder" }).click()]);
    expect(download.suggestedFilename()).toMatch(/\.ics$/);
    const path = await download.path();
    const ics = (await import("node:fs")).readFileSync(path!, "utf8");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toMatch(/URL:[^\r\n]*#download-section/);
  });

  test("macOS joins the waitlist through POST /api/waitlist", async ({ page }) => {
    const posts: unknown[] = [];
    await page.route("**/api/waitlist", async (route) => {
      if (route.request().method() === "POST") posts.push(route.request().postDataJSON());
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "Added to waitlist", count: 1 }) });
    });
    await open(page);
    await toPoster(page, 5);
    await page.getByRole("radio", { name: "macOS" }).click();
    await page.getByPlaceholder("you@example.com").fill("visitor@example.com");
    await page.locator("[data-role=m-cta]").click();
    await expect.poll(() => posts.length).toBe(1);
    expect(posts[0]).toEqual({ email: "visitor@example.com", platform: "macos" });
    await expect(page.locator("[data-role=m-cta]")).toHaveAttribute("data-mode", "sent");
    await expect(page.locator("[data-role=m-cta]")).toContainText("macOS waitlist");
  });

  test("the light theme applies", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("personas-theme", JSON.stringify({ state: { themeId: "light" }, version: 0 }));
    });
    await open(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const bg = await page.locator(".phone").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(233, 230, 223)");
  });
});

test.describe("/m under reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("no animation runs on any poster", async ({ page }) => {
    await open(page);
    // Hydrated with the preference read (the server cannot know it, see useStillMotion).
    await expect(page.locator(".hm")).toHaveAttribute("data-still", "true");
    for (let i = 0; i < POSTERS; i++) {
      await toPoster(page, i);
      await page.waitForTimeout(400);
      const running = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === "running")
          .filter((a) => {
            const t = (a.effect as KeyframeEffect | null)?.target;
            return t instanceof Element && !!t.closest(".hm");
          })
          .map((a) => `${(a as CSSAnimation).animationName ?? a.constructor.name} on ${((a.effect as KeyframeEffect).target as Element).className}`),
      );
      expect(running, `running on poster ${i + 1}`).toEqual([]);
    }
    // The hero shows its finished frame: the team is lit without playing the beat.
    await toPoster(page, 0);
    await expect(page.locator(".hive .cell.team.on")).not.toHaveCount(0);
  });
});
