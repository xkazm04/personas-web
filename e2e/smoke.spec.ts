import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";
import {
  DASHBOARD_ROUTES,
  DETAIL_ROUTES,
  FAILURE_MARKERS,
  MOBILE_ROUTES,
  MUST_404_IN_PRODUCTION,
  PUBLIC_ROUTES,
  type SmokeRoute,
} from "./smoke-routes";

/**
 * Route smoke suite — a breadth instrument.
 *
 * It answers one question per route: does this page actually come up, without
 * throwing, for a first-time visitor? It deliberately does NOT assert product
 * behaviour; the other specs in this directory do that for the surfaces that
 * earn it.
 *
 * The bar it holds every route to:
 *   1. the `main` landmark renders
 *   2. it renders SUBSTANCE — more than a threshold of text. This is the clause
 *      that stops the suite being vacuous: a blank shell, a failed lazy chunk
 *      and a stuck skeleton all satisfy "main exists" and none of them satisfy
 *      this.
 *   3. no failure marker is visible (error boundary, not-found, crash screen)
 *   4. nothing threw during load — an uncaught page error fails the route
 *   5. no console error, except entries the manifest tolerates WITH a reason
 *
 * Partial runs use Playwright's own title filtering — see `smoke-routes.ts`.
 */

/** A page with less text than this has not really rendered. */
const MIN_CONTENT_CHARS = 200;

/**
 * Record the cookie choice before any page script runs, so the consent banner
 * never renders during a smoke run.
 *
 * This is not the suite dodging an inconvenience. The banner is a fixed,
 * bottom-centred overlay, and on a phone viewport it lands exactly on the
 * mobile tab bar and intercepts its clicks — so a first-visit mobile user
 * cannot use the primary navigation until they answer it. On desktop it misses
 * the left sidebar and nothing notices. That asymmetry is a real finding and it
 * is reported as one; what it must not do is decide the outcome of every other
 * route's smoke test, which is what happens if the banner is left up.
 *
 * `addInitScript` rather than clicking Accept: clicking races the banner's own
 * mount animation, and a smoke suite that flakes on its own setup step is worse
 * than no smoke suite.
 */
async function acceptCookies(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
    } catch {
      // Storage can be unavailable; the banner is then a pre-existing condition
      // and the click fallback in the mobile walk still applies.
    }
  });
}

interface Watcher {
  readonly pageErrors: string[];
  readonly consoleErrors: string[];
}

/**
 * Attach listeners BEFORE the first navigation. Errors thrown during initial
 * load are the ones worth catching, and a listener attached after `goto` has
 * already missed them.
 */
function watch(page: Page): Watcher {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  return { pageErrors, consoleErrors };
}

function assertClean(route: SmokeRoute, w: Watcher): void {
  expect(w.pageErrors, `${route.path} threw during load`).toEqual([]);
  const tolerated = route.allowConsole ?? [];
  const unexplained = w.consoleErrors.filter(
    (line) => !tolerated.some((t) => line.includes(t.match)),
  );
  expect(unexplained, `${route.path} logged console errors`).toEqual([]);
}

async function assertRendered(page: Page, route: SmokeRoute): Promise<void> {
  const main = page.locator(route.expectSelector ?? "main").first();
  await expect(main, `${route.path}: no main landmark`).toBeVisible();

  for (const marker of FAILURE_MARKERS) {
    await expect(
      page.getByText(marker, { exact: false }).first(),
      `${route.path} shows a failure marker: ${marker}`,
    ).toBeHidden();
  }

  // Poll rather than read once. Several routes hydrate lazy, viewport-gated
  // sections after first paint, so a single read taken at `domcontentloaded`
  // measures the shell and calls a healthy page empty. Asserting "eventually
  // renders substance" is the claim we actually want; asserting it instantly
  // makes the suite flaky, which is worse than useless because it teaches
  // people to re-run it until it goes green.
  await expect
    .poll(
      async () => ((await main.innerText()) ?? "").replace(/\s+/g, " ").trim().length,
      {
        message: `${route.path} never rendered more than ${MIN_CONTENT_CHARS} chars — a shell, not a page`,
        timeout: 15_000,
      },
    )
    .toBeGreaterThan(MIN_CONTENT_CHARS);

  if (route.expectText) {
    await expect(
      page.getByText(route.expectText, { exact: false }).first(),
      `${route.path} is missing its identifying text`,
    ).toBeVisible();
  }
}

// ── Public surface: hard navigation ─────────────────────────────────────────

for (const route of [...PUBLIC_ROUTES, ...DETAIL_ROUTES]) {
  test(`smoke [${route.tag}] ${route.path} — ${route.name}`, async ({ page }) => {
    await acceptCookies(page);
    const w = watch(page);
    const res = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(res?.status(), `${route.path} did not answer 200`).toBe(200);
    await assertRendered(page, route);
    assertClean(route, w);
  });
}

// ── Dashboard: enter demo ONCE, then navigate in-app ────────────────────────
//
// Demo mode lives in memory and is never persisted, so `goto` on any dashboard
// route lands on the sign-in prompt rather than the page. Clicking the sidebar
// keeps the session alive, which is also how a real visitor moves through it.

test.describe("dashboard", () => {
  test(`smoke [dashboard] enters demo and walks every sidebar route`, async ({ page }) => {
    await acceptCookies(page);
    const w = watch(page);
    // Pin a desktop viewport. The sidebar collapses below the `lg` breakpoint
    // and Playwright's default is 1280x720, so without this the nav links are
    // present in the DOM but not visible and every click times out — a suite
    // failure that says nothing about the app.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/demo");
    await page.waitForURL("**/dashboard/home");

    for (const route of DASHBOARD_ROUTES) {
      const link = page.locator(`a[href="${route.path}"]`).first();
      await expect(link, `${route.path} is not linked in the sidebar`).toBeVisible();
      await link.click();
      await page.waitForURL(`**${route.path}`);
      await assertRendered(page, route);
      // Fail at the first bad route rather than at the end, so the report names
      // the page that broke instead of the last one visited.
      assertClean(route, w);
    }
  });
});

// ── Mobile: its own tree, same in-memory demo constraint ────────────────────

test.describe("mobile", () => {
  test(`smoke [mobile] enters demo and walks the mobile tree`, async ({ page }) => {
    await acceptCookies(page);
    const w = watch(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/m/overview");

    const tryDemo = page.getByRole("button", { name: "Try Demo" });
    if (await tryDemo.isVisible().catch(() => false)) await tryDemo.click();

    for (const route of MOBILE_ROUTES) {
      const link = page.locator(`a[href="${route.path}"]`).first();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForURL(`**${route.path}`);
      } else {
        // Not in the tab bar — alerts consolidates several desktop routes. A
        // hard navigation drops the in-memory demo session, so the auth guard
        // renders its prompt in place and the demo entry has to be taken again;
        // it resolves on the same URL rather than redirecting.
        await page.goto(route.path);
        const retry = page.getByRole("button", { name: "Try Demo" });
        if (await retry.isVisible().catch(() => false)) await retry.click();
        await expect(retry).toBeHidden();
      }
      await assertRendered(page, route);
      assertClean(route, w);
    }
  });
});

// ── Routes that must be dead in a production build ─────────────────────────

test.describe("production reachability", () => {
  // KNOWN DEFECT, recorded in executable form rather than in a comment.
  //
  // `/preview` is the dev-only section harness. Its page calls `notFound()`
  // when NODE_ENV is production and the not-found BODY does render — but the
  // route is statically prerendered, so the guard ran at BUILD time and the
  // response ships with HTTP 200. A genuinely missing path on the same server
  // answers 404, so this is a soft 404: a crawler or an uptime check sees a
  // live page where the code intended a dead one.
  //
  // Marked fixme rather than deleted or inverted: inverting it would bake the
  // defect in as expected behaviour, and deleting it would lose the finding.
  test.fixme(`smoke [dev] dev-only harness must not be reachable in production`, async ({
    page,
  }) => {
    for (const path of MUST_404_IN_PRODUCTION) {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should be 404 in a production build`).toBe(404);
    }
  });
});
