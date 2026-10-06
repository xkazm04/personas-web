import { test, expect, type Page } from "@playwright/test";

/**
 * /dashboard/notes on a phone, in demo (PHASE2-SPEC.md 5.1 + 6.2, slice M8):
 * the desktop Notepad's goals, zoned by project, read-only. The demo serves
 * `mockApi.listNotes` (MOCK_NOTES). Demo mode is in-memory, so every test
 * enters through /demo and moves by the bottom nav, as a visitor does.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
    } catch {
      /* storage unavailable */
    }
  });
});

/** The phone bottom bar (the one nav holding the More button). */
function bottomNav(page: Page) {
  return page.locator("nav").filter({ has: page.getByRole("button", { name: "More" }) });
}

async function openNotes(page: Page, query = "") {
  await page.goto(`/demo${query}`);
  await page.waitForURL(/\/dashboard\/personas/);
  if (query) {
    // The `?desktop=` switch is read from the URL when a view mounts, and a nav
    // link carries no query, so move the way the SPA does, query kept.
    await page.evaluate((q) => window.history.pushState(null, "", `/dashboard/notes${q}`), query);
  } else {
    await bottomNav(page).getByRole("link", { name: "Notes" }).click();
  }
  await page.waitForURL(/\/dashboard\/notes/);
  await expect(page.getByRole("heading", { level: 1, name: "Notes" })).toBeVisible();
}

test.describe("phone Notes (demo)", () => {
  test("the bottom nav reads Personas, Reviews, Notes, Executions, More", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForURL(/\/dashboard\/personas/);
    const nav = bottomNav(page);
    await expect(nav.getByRole("link")).toHaveText([/Personas/, /Reviews/, /Notes/, /Executions/]);
    await expect(nav.getByRole("button", { name: "More" })).toBeVisible();
  });

  test("zones render by project, alphabetically, with the no-project zone last", async ({ page }) => {
    await openNotes(page);
    const zones = page.locator("[data-note-zone]");
    await expect(zones.first()).toBeVisible();
    expect(await zones.count()).toBeGreaterThanOrEqual(3);
    const keys = await zones.evaluateAll((els) => els.map((el) => el.getAttribute("data-note-zone") ?? ""));
    expect(keys[keys.length - 1]).toBe("__none");
    const named = keys.slice(0, -1);
    expect(named).toEqual([...named].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
    // Every card carries its rail glyph; some goals wait for review.
    const cards = page.locator("[data-note-card]");
    expect(await cards.count()).toBeGreaterThanOrEqual(8);
    expect(await page.locator("[data-note-card] [data-rail-glyph]").count()).toBe(await cards.count());
    await expect(page.locator("[data-note-card]").filter({ hasText: /\d+ to review/ }).first()).toBeVisible();
  });

  test("a card opens its body sheet, and Escape closes it", async ({ page }) => {
    await openNotes(page);
    const card = page.locator("[data-note-card]").filter({ hasText: /\d+ to review/ }).first();
    const title = (await card.locator("span").first().textContent())!.trim();
    await card.click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText(title);
    await expect(sheet.locator("[data-note-detail]")).toBeVisible();
    await expect(sheet.getByText("Open the note in Personas on your computer to answer its reviews.")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("a completed goal's sheet shows its run summary and rendered markdown", async ({ page }) => {
    await openNotes(page);
    await page.locator("[data-note-card]").filter({ hasText: "Completed" }).first().click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByText("Run summary")).toBeVisible();
    // The body is rendered markdown, not raw source.
    await expect(sheet.locator("[data-note-detail] ul li").first()).toBeVisible();
    await expect(sheet).not.toContainText("## ");
  });

  test("?desktop=never: the connect notice with the download, and no zones", async ({ page }) => {
    await openNotes(page, "?desktop=never");
    await expect(page.getByRole("heading", { name: "Connect your computer" })).toBeVisible();
    await expect(page.locator("[data-note-zone]")).toHaveCount(0);
  });

  test("no horizontal scroll at phone width", async ({ page }) => {
    const device = page.viewportSize()!.width;
    await openNotes(page);
    await expect(page.locator("[data-note-zone]").first()).toBeVisible();
    const widths = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const prev = body.style.overflowX;
      body.style.overflowX = "visible";
      const unclipped = doc.scrollWidth;
      body.style.overflowX = prev;
      return { innerWidth: window.innerWidth, scrollWidth: doc.scrollWidth, unclipped };
    });
    expect(widths.innerWidth).toBeLessThanOrEqual(device);
    expect(widths.scrollWidth).toBeLessThanOrEqual(device);
    expect(widths.unclipped).toBeLessThanOrEqual(device);
  });
});
