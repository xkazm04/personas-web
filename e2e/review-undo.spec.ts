import { test, expect, type Page } from "@playwright/test";
import { en } from "../src/i18n/en";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The review queue's decision ledger (src/lib/review-ledger.ts, owned by
 * src/stores/reviewStore.ts): a verdict is held in a 5s undo window before it
 * is written; Undo inside the window puts the row back; a verdict left alone
 * commits, and the next poll must not repaint it pending (the demo's
 * mockApi.updateEvent write-through). Unit tests pin the ledger; this is the
 * same journey on the rendered /dashboard/reviews in demo mode.
 */

const approveToast = (page: Page) =>
  page.getByRole("status").filter({ hasText: en.reviewsPage.undo.approved.replace("{count}", "1") });

/** A demo session is in-memory: enter it via /demo, then navigate client-side. */
async function openReviewsInDemo(page: Page) {
  await page.goto("/demo");
  await page.waitForURL("**/dashboard/home");
  await page.locator("a[href='/dashboard/reviews']").first().click();
  await page.waitForURL("**/dashboard/reviews");
}

test.describe("Review queue undo", () => {
  // A saved consent keeps the cookie banner from covering the detail panel.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("personas-cookie-consent", "essential"));
  });

  test("approve -> Undo restores the row; approve again -> it stays resolved after the next poll", async ({ page }) => {
    test.setTimeout(120_000);
    await openReviewsInDemo(page);

    // The first pending row is auto-selected; its detail panel carries Approve.
    const active = page.locator('[data-review-row] [aria-current="true"]');
    await expect(active).toHaveCount(1);
    await expect(active.getByRole("button", { name: en.reviewsPage.selectReview })).toHaveCount(1); // pending
    const label = await active.getAttribute("aria-label");
    expect(label).toBeTruthy();
    const row = page.locator("[data-review-row]").filter({ has: page.getByRole("button", { name: label!, exact: true }) });
    await expect(row).toHaveCount(1);
    // A pending row is the only kind with a selection checkbox.
    const pendingMarker = row.getByRole("button", { name: en.reviewsPage.selectReview });
    // The detail panel's button is named "Approve" plus its shortcut hint ("A").
    const approve = page.getByRole("button", { name: new RegExp(`^${escapeRegExp(en.reviewsPage.focus.approve)}(\\s|$)`) });

    // 1. Approve -> undo toast -> Undo -> the row is pending again.
    await expect(approve).toHaveCount(1);
    await approve.click();
    await expect(approveToast(page)).toBeVisible();
    await expect(pendingMarker).toHaveCount(0);
    await approveToast(page).getByRole("button", { name: en.dashboardUi.undo }).click();
    await expect(approveToast(page)).toHaveCount(0);
    await expect(pendingMarker).toHaveCount(1);

    // 2. Approve it again (re-select it: after undo the queue re-sorts).
    await row.getByRole("button", { name: label!, exact: true }).click();
    await expect(row.locator('[aria-current="true"]')).toHaveCount(1);
    await expect(approve).toHaveCount(1);
    await approve.click();
    await expect(approveToast(page)).toBeVisible();
    // The window commits at 5s and the toast leaves with it.
    await expect(approveToast(page)).toHaveCount(0, { timeout: 10_000 });
    await expect(pendingMarker).toHaveCount(0);

    // 3. Wait for the next poll (15s interval) to complete, observed as the
    //    list's "Refreshing..." footer appearing and clearing. A mutation
    //    observer records the flash, which lasts only the mock's 300ms.
    await page.evaluate((text) => {
      const w = window as unknown as { __refreshSeen?: boolean };
      w.__refreshSeen = false;
      new MutationObserver((_, obs) => {
        if (document.body.innerText.includes(text)) {
          w.__refreshSeen = true;
          obs.disconnect();
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }, en.dashboardUi.refreshing);
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __refreshSeen?: boolean }).__refreshSeen), {
        timeout: 20_000,
      })
      .toBe(true);
    await expect(page.getByText(en.dashboardUi.refreshing)).toHaveCount(0);

    // 4. The poll's fresh data still has the verdict: the row did not revert.
    await expect(row).toHaveCount(1);
    await expect(pendingMarker).toHaveCount(0);
  });
});
