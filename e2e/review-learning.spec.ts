import { test, expect, type Page } from "@playwright/test";
import { en } from "../src/i18n/en";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A verdict becomes learned memory (tiger D4): approving a review, once its
 * 5 s undo window commits, makes the scripted desktop write the memory its
 * `flip_status` writes ("Human approved: {title}"), which Knowledge > Memories
 * shows first, with an evidence chip that opens the run the review was about.
 * Demo mode is in-memory: enter via /demo, then move client-side only.
 */

async function goClient(page: Page, href: string) {
  await page.evaluate((to) => window.history.pushState(null, "", to), href);
  await page.waitForURL(`**${href}`);
}

const TITLE = "Proposed Incident Mitigation";

test.describe("Review verdict -> learned memory", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("personas-cookie-consent", "essential"));
  });

  test("approve, wait out undo: Memories shows it first and its chip opens the run", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/demo");
    await page.waitForURL("**/dashboard/personas");
    await goClient(page, "/dashboard/reviews");

    await page.getByRole("button", { name: new RegExp(escapeRegExp(TITLE)) }).first().click();
    const approve = page.getByRole("button", { name: new RegExp(`^${escapeRegExp(en.reviewsPage.focus.approve)}(\\s|$)`) });
    await expect(approve).toHaveCount(1);
    await page.getByRole("textbox").first().fill("Canary first");
    await approve.click();

    // The undo window commits at 5 s; the scripted desktop answers 2 s later.
    const toast = page.getByRole("status").filter({ hasText: en.reviewsPage.undo.approved.replace("{count}", "1") });
    await expect(toast).toBeVisible();
    await expect(toast).toHaveCount(0, { timeout: 10_000 });

    await goClient(page, "/dashboard/knowledge");
    await page.getByRole("tab", { name: en.knowledgePage.memories }).click();
    const firstCard = page.locator("[id='knowledge-panel-memories'] .space-y-2 > div").first();
    await expect(firstCard).toContainText(`Human approved: ${TITLE}`, { timeout: 15_000 });
    await expect(firstCard).toContainText("Canary first");

    const chip = firstCard.locator("a[href='/dashboard/executions?focus=e-0002-mock']");
    await expect(chip).toBeVisible();
    await chip.click();
    await page.waitForURL("**/dashboard/executions?focus=e-0002-mock");
    await expect(page.getByRole("dialog")).toContainText("Incident Responder");

    await page.goBack();
    await page.waitForURL("**/dashboard/knowledge");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
