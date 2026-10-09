import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";
import { DASHBOARD_ROUTES, DETAIL_ROUTES, PUBLIC_ROUTES } from "./smoke-routes";

/**
 * Content-Security-Policy proof for the production build (finding F5, scan
 * d4b90e7a).
 *
 * It answers one question per route: does the page load under the production
 * policy without the browser refusing anything? Run it against `next start`,
 * never `next dev`: dev keeps 'unsafe-eval' on purpose (React Refresh), so a
 * dev run proves nothing about the shipped header.
 *
 * Two kinds of evidence are collected, because they fail differently:
 *   1. `securitypolicyviolation` events, recorded by an init script so the
 *      listener exists before the first inline script runs;
 *   2. console errors that mention the policy, which is where Chrome reports a
 *      refusal that does not reach the document (a worker, a frame).
 *
 * The positive control at the bottom proves the listener can see a violation
 * at all. Without it, "zero violations" could mean "nothing was listening".
 */

/** Beyond the smoke list: a guide topic that renders a code block. */
const GUIDE_CODE_TOPIC = "/guide/agents-prompts/comparing-prompt-versions";

/** The public phone landing: same origin as the paired phone's signing key. */
const PHONE_LANDING = "/m";

interface Violation {
  readonly directive: string;
  readonly blocked: string;
  readonly source: string;
}

declare global {
  interface Window {
    __cspViolations?: Violation[];
  }
}

async function prepare(page: Page): Promise<string[]> {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personas-cookie-consent", "all");
    } catch {
      // Storage can be unavailable; the banner is then a pre-existing condition.
    }
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      window.__cspViolations!.push({
        directive: e.effectiveDirective || e.violatedDirective,
        blocked: e.blockedURI,
        source: `${e.sourceFile}:${e.lineNumber}`,
      });
    });
  });
  // A refused eval surfaces as an uncaught page error, a refused load as a
  // console error; both name the policy.
  const consoleCsp: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error" && /Content Security Policy/i.test(msg.text())) {
      consoleCsp.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    if (/Content Security Policy/i.test(err.message)) consoleCsp.push(err.message);
  });
  return consoleCsp;
}

async function violations(page: Page): Promise<Violation[]> {
  return page.evaluate(() => window.__cspViolations ?? []);
}

/** Step down the page so viewport-gated sections mount and load their chunks. */
async function scrollThrough(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 800) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }
  await page.waitForLoadState("networkidle").catch(() => {});
}

function expectNoEval(path: string, header: string | undefined): void {
  expect(header, `${path} sent no Content-Security-Policy`).toBeTruthy();
  expect(header, `${path} still allows eval`).not.toContain("'unsafe-eval'");
}

const HARD_NAV = [...PUBLIC_ROUTES, ...DETAIL_ROUTES].map((r) => r.path);

for (const path of [...HARD_NAV, GUIDE_CODE_TOPIC, PHONE_LANDING]) {
  test(`csp ${path}`, async ({ page }) => {
    const consoleCsp = await prepare(page);
    const res = await page.goto(path, { waitUntil: "load" });
    expect(res?.status(), `${path} did not answer 200`).toBe(200);
    expectNoEval(path, res?.headers()["content-security-policy"]);
    await scrollThrough(page);
    expect(await violations(page), `${path} violated the policy`).toEqual([]);
    expect(consoleCsp, `${path} logged policy errors`).toEqual([]);
  });
}

// Demo mode lives in memory, so the dashboard is reached the way smoke.spec.ts
// reaches it: enter demo once, then click through the sidebar. Client
// navigation fetches no new document, so each route's header is read with a
// plain request instead.
test("csp dashboard: enters demo and walks every sidebar route", async ({ page }) => {
  const consoleCsp = await prepare(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const res = await page.goto("/demo");
  expectNoEval("/demo", res?.headers()["content-security-policy"]);
  await page.waitForURL("**/dashboard/personas");

  for (const route of DASHBOARD_ROUTES) {
    const head = await page.request.get(route.path);
    expectNoEval(route.path, head.headers()["content-security-policy"]);

    const link = page.locator(`a[href="${route.path}"]`).first();
    await expect(link, `${route.path} is not linked in the sidebar`).toBeVisible();
    await link.click();
    await page.waitForURL(`**${route.path}`);
    await page.waitForLoadState("networkidle").catch(() => {});
    expect(await violations(page), `${route.path} violated the policy`).toEqual([]);
    expect(consoleCsp, `${route.path} logged policy errors`).toEqual([]);
  }
});

// The eval is deferred on purpose. addScriptTag inserts the tag from inside a
// DevTools Runtime.evaluate, which runs with allowUnsafeEvalBlockedByCSP, and
// an inline script inserted there executes synchronously under that exemption:
// a bare eval('1') runs and nothing is reported. The timer callback runs later
// as ordinary page script, under the page's own policy.
test("csp positive control: an eval is caught", async ({ page }) => {
  const consoleCsp = await prepare(page);
  await page.goto("/", { waitUntil: "load" });
  await page.addScriptTag({ content: "setTimeout(function () { eval('1'); }, 0)" });
  await expect
    .poll(async () => (await violations(page)).filter((v) => v.blocked === "eval").length, {
      message: "the listener saw no violation for a refused eval",
    })
    .toBeGreaterThan(0);
  const caught = (await violations(page)).find((v) => v.blocked === "eval");
  expect(caught?.directive).toBe("script-src");
  expect(consoleCsp.length, "the refused eval did not reach the error listener").toBeGreaterThan(0);
});
