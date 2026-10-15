import { test, expect, type Page } from "@playwright/test";
import { en } from "../src/i18n/en";

/**
 * Fix the cause once, every surface settles (lib/settleThread.ts,
 * lib/demoCauseFix.ts). The Slack circuit-break is one outage seen from five
 * routes; Configure on its Health check settles all of them in the same
 * session, without a reload, and the toast's "Undo fix" reopens all of them.
 * Unit tests pin the projection and the mock reads; this walks the rendered
 * dashboard in demo mode.
 *
 * A demo session is in-memory, so it is entered once via /demo and every later
 * move is a client-side navigation (a hard navigation would end the demo and
 * restore the outage, which is the session-only contract).
 */

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));

const SLACK_BREACH = "Slack webhook circuit-broken; 3 retries exhausted.";
const SLACK_ISSUE = "Circuit breaker tripped — Slack API";
const SLACK_INCIDENT = "Slack webhook circuit-broken";

const navLink = (page: Page, view: string) => page.locator(`aside a[href='/dashboard/${view}']`).first();

async function openView(page: Page, view: string) {
  await navLink(page, view).click();
  await page.waitForURL(`**/dashboard/${view}**`);
}

/** The Slack check's row on /dashboard/health (the innermost row holding its failing line). */
const slackRow = (page: Page) => page.locator("div.rounded-lg").filter({ hasText: "Webhook circuit-broken" }).last();

/** The Health nav item's badge (the count chip inside its link). */
const healthBadge = (page: Page) => navLink(page, "health").locator("span.rounded-full");

async function expectThreadOpen(page: Page) {
  await expect(healthBadge(page)).toHaveText("1");

  await openView(page, "sla");
  const breach = page.getByRole("button", { name: new RegExp(SLACK_BREACH.replace(/[.;]/g, "\\$&")) });
  await expect(breach).toContainText(en.slaPage.breachLog.ongoing);

  await openView(page, "observability");
  const issue = page.locator("div").filter({ hasText: SLACK_ISSUE }).last();
  await expect(issue).not.toContainText(en.observabilityPage.resolved);

  await openView(page, "incidents");
  await expect(page.getByRole("button").filter({ hasText: SLACK_INCIDENT }).first()).toContainText(
    en.incidentsPage.status.escalated,
  );

  await openView(page, "home");
  await page.locator('[data-mission-dim="recovery"]').click();
  await expect(page.getByText(fill(en.dashboard.home.mission.evidence.recovery, { open: 2, paused: 1, fixed: 2 }))).toBeVisible();
}

test.describe("Fix the cause once", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("personas-cookie-consent", "essential"));
  });

  test("Configure on the Slack check settles SLA, Observability, Incidents, Health and Mission Control; Undo reopens them", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/demo");
    await page.waitForURL("**/dashboard/personas");
    await openView(page, "home"); // opens the Overview panel that holds the Reliability views

    // Start on the breach, as /dashboard/sla?focus=br_1 does, and follow its Health chip.
    await openView(page, "sla");
    const breach = page.getByRole("button", { name: new RegExp(SLACK_BREACH.replace(/[.;]/g, "\\$&")) });
    await breach.click();
    await page.locator("main#main-content").getByRole("link", { name: en.dashboard.health, exact: true }).click();
    await page.waitForURL("**/dashboard/health?focus=in_slack");
    await expect(healthBadge(page)).toHaveText("1");

    // Fix the cause.
    await slackRow(page).getByRole("button", { name: en.healthPage.actions.configure }).click();
    const toast = page.getByRole("alert").filter({ hasText: `Slack ${en.healthPage.toast.configured}` });
    await expect(toast).toBeVisible();
    await expect(healthBadge(page)).toHaveCount(0);

    // Every surface on the thread agrees, with no reload.
    await openView(page, "observability");
    await expect(page.locator("div").filter({ hasText: SLACK_ISSUE }).last()).toContainText(
      en.observabilityPage.resolved,
    );

    await openView(page, "sla");
    const settled = page.getByRole("button", { name: new RegExp(SLACK_BREACH.replace(/[.;]/g, "\\$&")) });
    await expect(settled).not.toContainText(en.slaPage.breachLog.ongoing);
    await settled.click();
    await expect(page.getByText(en.slaPage.breachLog.timeToResolve)).toBeVisible();

    await openView(page, "incidents");
    const incident = page.getByRole("button").filter({ hasText: SLACK_INCIDENT }).first();
    await expect(incident).toContainText(en.incidentsPage.status.resolved);
    // The correlated cluster still links its (now resolved) fragments.
    await incident.click();
    await expect(page.getByRole("dialog").getByRole("link", { name: en.dashboard.sla })).toBeVisible();
    await page.keyboard.press("Escape");

    await openView(page, "home");
    await page.locator('[data-mission-dim="recovery"]').click();
    await expect(page.getByText(fill(en.dashboard.home.mission.evidence.recovery, { open: 1, paused: 0, fixed: 2 }))).toBeVisible();
  });

  test("Undo fix on the toast restores all five readings", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/demo");
    await page.waitForURL("**/dashboard/personas");
    await openView(page, "home");
    await openView(page, "health");

    await slackRow(page).getByRole("button", { name: en.healthPage.actions.configure }).click();
    await expect(healthBadge(page)).toHaveCount(0);

    await page.getByRole("button", { name: en.healthPage.toast.undo }).click();
    await expect(page.getByText("Webhook circuit-broken")).toBeVisible();
    await expectThreadOpen(page);
  });
});
