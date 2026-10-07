import { test, expect, type Page } from "@playwright/test";

/**
 * /dashboard/reviews on a phone, in demo (PLAN M20, PHASE2-SPEC.md 1.6 + 6.2):
 * pending reviews as cards with 48 px Approve / Reject. A verdict opens the
 * 5 s undo window, then is a `review_decide` to the demo's scripted desktop
 * (mockCommandPlane: claim at 1.2 s, done at 2 s), which writes it back
 * through `mockApi.updateEvent`. Demo mode is in-memory, so every test enters
 * through /demo and moves the way a visitor does.
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

async function openReviews(page: Page, query = "") {
  await page.goto(`/demo${query}`);
  await page.waitForURL(/\/dashboard\/personas/);
  if (query) {
    // The `?desktop=` switch is read from the URL when a view mounts; the nav link carries no query.
    await page.evaluate((q) => window.history.pushState(null, "", `/dashboard/reviews${q}`), query);
  } else {
    await bottomNav(page).getByRole("link", { name: "Reviews" }).click();
  }
  await page.waitForURL(/\/dashboard\/reviews/);
  await expect(page.getByRole("heading", { level: 1, name: "Manual Reviews" })).toBeVisible();
}

const pendingCards = (page: Page) => page.locator("[data-reviews-pending] [data-review-card]");

test.describe("phone Reviews (demo)", () => {
  test("approve one and reject one: the card leaves the pending list, its chip goes Sending... -> Working... -> Done", async ({ page }) => {
    test.setTimeout(90_000);
    await openReviews(page);
    await expect(pendingCards(page).first()).toBeVisible();
    const before = await pendingCards(page).count();
    expect(before).toBeGreaterThanOrEqual(2);

    for (const [i, verdict] of [
      [0, "approve"],
      [1, "reject"],
    ] as const) {
      const card = pendingCards(page).first();
      const id = (await card.getAttribute("data-review-card"))!;
      if (verdict === "reject") {
        await card.getByRole("button", { name: "Add a note" }).click();
        await card.locator("textarea[data-review-note]").fill("Not this week.");
      }
      await card.locator(`[data-review-action="${verdict}"]`).click();
      // It leaves the pending list at once; Undo is offered for 5 s.
      await expect(page.locator(`[data-reviews-pending] [data-review-card="${id}"]`)).toHaveCount(0);
      await expect(pendingCards(page)).toHaveCount(before - i - 1);
      const decided = page.locator(`[data-decided-card="${id}"]`);
      await expect(decided).toContainText(verdict === "approve" ? "Approved" : "Rejected");
      await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
      // After the window: the command's chip walks to Done.
      const chip = decided.locator("[data-command-status]");
      await expect(chip).toHaveAttribute("data-command-status", /pending|executing/, { timeout: 8_000 });
      await expect(chip).toHaveAttribute("data-command-status", "executing", { timeout: 4_000 });
      await expect(chip).toHaveAttribute("data-command-status", "completed", { timeout: 4_000 });
      await expect(chip).toHaveText("Done");
    }

    // The next poll reads the verdicts back from the demo data: still decided.
    await page.waitForTimeout(16_000);
    await expect(pendingCards(page)).toHaveCount(before - 2);
  });

  test("Undo inside the window keeps the review pending and sends nothing", async ({ page }) => {
    await openReviews(page);
    const card = pendingCards(page).first();
    const id = (await card.getAttribute("data-review-card"))!;
    await card.locator('[data-review-action="approve"]').click();
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.locator(`[data-reviews-pending] [data-review-card="${id}"]`)).toHaveCount(1);
    await page.waitForTimeout(6_000);
    await expect(page.locator(`[data-decided-card="${id}"]`)).toHaveCount(0);
    await expect(page.locator(`[data-review-card="${id}"] [data-command-status]`)).toHaveCount(0);
  });

  test("?desktop=offline: Approve and Reject are disabled, and the notice says to open Personas", async ({ page }) => {
    await openReviews(page, "?desktop=offline");
    await expect(page.getByRole("heading", { name: /isn't running on/ })).toBeVisible();
    const card = pendingCards(page).first();
    await expect(card.locator('[data-review-action="approve"]')).toBeDisabled();
    await expect(card.locator('[data-review-action="reject"]')).toBeDisabled();
    await expect(page.getByRole("button", { name: "Send the download to my computer" })).toHaveCount(0);
  });

  test("touch targets are at least 44 px, and no horizontal scroll at phone width", async ({ page }) => {
    const device = page.viewportSize()!.width;
    await openReviews(page);
    const card = pendingCards(page).first();
    for (const target of [
      card.locator('[data-review-action="approve"]'),
      card.locator('[data-review-action="reject"]'),
      card.getByRole("button", { name: "Add a note" }),
    ]) {
      const box = await target.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
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
