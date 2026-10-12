import { test, expect, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { DETAIL_ROUTES, PUBLIC_ROUTES } from "./smoke-routes";

/**
 * Locale render matrix: every public smoke route under every locale.
 *
 * Production hides the 13 non-English locales (LOCALE_RELEASE is empty), so
 * nothing else exercises them. This is the evidence an owner needs to release
 * a locale: a locale-by-route table of what actually renders.
 *
 * Opt-in. The matrix is 13 locales x ~12 routes, far too slow for a default
 * run, so it only runs when LOCALE_MATRIX=1 (the nightly job):
 *
 *   NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true LOCALE_MATRIX=1 \
 *     npx playwright test locale-matrix
 *
 * The preview flag is read at BUILD time (src/i18n/localeRelease.ts), and the
 * Playwright webServer builds, so the env var above reaches it. Without the
 * flag the store refuses to leave English, which the spec detects and fails
 * on rather than reporting 13 false "green" locales.
 *
 * Narrowing (comma lists): LOCALE_MATRIX_LOCALES=ar,de,ru  LOCALE_MATRIX_ROUTES=/,/roadmap
 * Sharding: use Playwright's own `--shard=i/n`.
 *
 * Detectors (per cell):
 *   mojibake  - UTF-8 read as cp1252/cp1250 look-alike pairs, or U+FFFD.      HARD
 *   dir       - html[dir] is "rtl" for ar and not rtl otherwise; lang matches. HARD
 *   overflow  - an element wider than the viewport/its box that is not scrollable.
 *   english   - for non-Latin-script locales, share of Latin letters in main text
 *               (a page that is mostly Latin was not translated).
 * overflow and english are recorded in the heat table; they fail the run only
 * with LOCALE_MATRIX_STRICT=1, because they are known-open and the table is
 * the product. The table is written to test-results/locale-matrix/.
 */

const ENABLED = process.env.LOCALE_MATRIX === "1";
const STRICT = process.env.LOCALE_MATRIX_STRICT === "1";

const LOCALES = [
  "de", "es", "fr", "cs", "ru", "vi", "id", "zh", "ja", "ko", "hi", "bn", "ar",
] as const;
type Locale = (typeof LOCALES)[number];

/** Script-specific locales where "mostly Latin letters" means untranslated. */
const NON_LATIN: ReadonlySet<Locale> = new Set(["ru", "zh", "ja", "ko", "hi", "bn", "ar"]);
/** Above this Latin-letter share, a non-Latin-script page is flagged. */
const LATIN_SHARE_LIMIT = 0.5;

const csv = (v: string | undefined) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : null);
const localeFilter = csv(process.env.LOCALE_MATRIX_LOCALES);
const routeFilter = csv(process.env.LOCALE_MATRIX_ROUTES);

const locales = LOCALES.filter((l) => !localeFilter || localeFilter.includes(l));
const routes = [...PUBLIC_ROUTES, ...DETAIL_ROUTES].filter(
  (r) => !routeFilter || routeFilter.includes(r.path),
);

/** Lead-byte look-alike followed by continuation look-alike (see scripts/check-i18n-encoding.mjs). */
const MOJIBAKE = /[Â-ô][\u0080-¿ŒœŠšŸŽžƒˆ˜–—‘-„†-•…‰‹›€™ĂĄĹĽŁŃŘŢť˘˝]|�/;

interface Cell {
  locale: Locale;
  route: string;
  mojibake: string | null;
  dir: string | null;
  overflow: string | null;
  latinShare: number | null;
  error: string | null;
}

const cells: Cell[] = [];

async function inspect(page: Page, locale: Locale) {
  return page.evaluate(
    ({ locale: loc, nonLatin }) => {
      const html = document.documentElement;
      const main = document.querySelector("main");
      const text = (main?.innerText ?? "").replace(/\s+/g, " ");
      const vw = html.clientWidth;
      let overflow: string | null = null;
      if (html.scrollWidth > vw + 1) overflow = `page ${html.scrollWidth}px > viewport ${vw}px`;
      if (!overflow && main) {
        for (const el of Array.from(main.querySelectorAll<HTMLElement>("*"))) {
          const cs = getComputedStyle(el);
          if (cs.display === "inline" || cs.overflowX !== "visible") continue;
          if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
            overflow = `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""} ${el.scrollWidth}px > ${el.clientWidth}px`;
            break;
          }
        }
      }
      let latinShare: number | null = null;
      if (nonLatin) {
        const letters = text.match(/\p{L}/gu) ?? [];
        const latin = text.match(/\p{Script=Latin}/gu) ?? [];
        latinShare = letters.length ? latin.length / letters.length : null;
      }
      return {
        text,
        lang: html.getAttribute("lang"),
        dir: html.getAttribute("dir"),
        overflow,
        latinShare,
        loc,
      };
    },
    { locale, nonLatin: NON_LATIN.has(locale) },
  );
}

test.describe("locale matrix", () => {
  test.skip(!ENABLED, "opt-in: set LOCALE_MATRIX=1 (nightly)");

  for (const locale of locales) {
    for (const route of routes) {
      test(`locale [${locale}] ${route.path}`, async ({ page }) => {
        await page.addInitScript((lang) => {
          try {
            window.localStorage.setItem("personas-cookie-consent", "all");
            window.localStorage.setItem(
              "personas-language",
              JSON.stringify({ state: { language: lang, declined: [] }, version: 0 }),
            );
          } catch {
            // Storage unavailable: the lang assertion below reports it.
          }
        }, locale);

        const cell: Cell = {
          locale, route: route.path, mojibake: null, dir: null,
          overflow: null, latinShare: null, error: null,
        };
        cells.push(cell);

        const res = await page.goto(route.path, { waitUntil: "domcontentloaded" });
        expect(res?.status(), `${route.path} did not answer 200`).toBe(200);
        const main = page.locator("main").first();
        await expect(main).toBeVisible();
        // The store applies <html lang> after hydration; wait for it.
        try {
          await expect(page.locator("html")).toHaveAttribute("lang", locale, { timeout: 10_000 });
        } catch {
          cell.error = "locale not applied (is NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true at build?)";
        }
        await expect
          .poll(async () => ((await main.innerText()) ?? "").trim().length, { timeout: 15_000 })
          .toBeGreaterThan(200);

        const r = await inspect(page, locale);
        const m = MOJIBAKE.exec(r.text);
        if (m) cell.mojibake = r.text.slice(Math.max(0, m.index - 20), m.index + 20);
        const wantRtl = locale === "ar";
        if ((r.dir === "rtl") !== wantRtl) cell.dir = `dir=${r.dir ?? "(none)"}`;
        cell.overflow = r.overflow;
        cell.latinShare = r.latinShare;

        expect(cell.error, `${locale} ${route.path}`).toBeNull();
        expect(cell.mojibake, `${locale} ${route.path} mojibake`).toBeNull();
        expect(cell.dir, `${locale} ${route.path} direction`).toBeNull();
        if (STRICT) {
          expect(cell.overflow, `${locale} ${route.path} overflow`).toBeNull();
          if (cell.latinShare !== null) {
            expect(cell.latinShare, `${locale} ${route.path} untranslated`).toBeLessThan(
              LATIN_SHARE_LIMIT,
            );
          }
        }
      });
    }
  }

  test.afterAll(() => {
    if (!cells.length) return;
    const flag = (c: Cell) =>
      c.error || c.mojibake || c.dir
        ? "FAIL"
        : c.overflow || (c.latinShare !== null && c.latinShare >= LATIN_SHARE_LIMIT)
          ? "warn"
          : "ok";
    const paths = [...new Set(cells.map((c) => c.route))];
    const locs = [...new Set(cells.map((c) => c.locale))];
    const lines = [
      `| route | ${locs.join(" | ")} |`,
      `|---|${locs.map(() => "---").join("|")}|`,
      ...paths.map(
        (p) =>
          `| ${p} | ${locs
            .map((l) => {
              const c = cells.find((x) => x.route === p && x.locale === l);
              return c ? flag(c) : "-";
            })
            .join(" | ")} |`,
      ),
      "",
      "Details (non-ok cells):",
      ...cells
        .filter((c) => flag(c) !== "ok")
        .map(
          (c) =>
            `- ${c.locale} ${c.route}: ${[
              c.error && `error: ${c.error}`,
              c.mojibake && `mojibake: ...${c.mojibake}...`,
              c.dir && `direction: ${c.dir}`,
              c.overflow && `overflow: ${c.overflow}`,
              c.latinShare !== null && c.latinShare >= LATIN_SHARE_LIMIT &&
                `latin share ${(c.latinShare * 100).toFixed(0)}%`,
            ]
              .filter(Boolean)
              .join("; ")}`,
        ),
    ];
    const dir = path.join("test-results", "locale-matrix");
    fs.mkdirSync(dir, { recursive: true });
    // Shards each write their own file; merge by concatenation downstream.
    const shard = process.env.TEST_PARALLEL_INDEX ?? "0";
    fs.writeFileSync(path.join(dir, `heat-${shard}.md`), lines.join("\n") + "\n");
    fs.writeFileSync(path.join(dir, `cells-${shard}.json`), JSON.stringify(cells, null, 2));
  });
});
