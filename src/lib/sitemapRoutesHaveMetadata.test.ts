import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Structural guard: every static route we advertise in `sitemap.ts` must ship
 * its own title/description.
 *
 * Why this needs a test rather than review. A `"use client"` page cannot export
 * `metadata` — Next forbids it — so routes whose page is a client component
 * carry a sibling server `layout.tsx` that exists for almost nothing except
 * holding the metadata. Seven routes do this. It works, and it is invisible:
 * nothing fails when the shim is missing. `/features` shipped for months
 * without one, inheriting the homepage's exact title and description while
 * sitting at priority 0.9 in the sitemap — a duplicate title on the site's most
 * important marketing page, caused by a convention no tool enforced.
 *
 * The guard is deliberately structural (does a metadata export exist for this
 * route?) rather than semantic (is the copy good?). It catches the failure mode
 * that actually occurred: a route added, advertised, and silently left to
 * inherit.
 */

const APP_DIR = join(process.cwd(), "src", "app");
const SITEMAP = join(APP_DIR, "sitemap.ts");

const METADATA_EXPORT = /export\s+(?:const\s+metadata|async\s+function\s+generateMetadata)\b/;

/** Pull the static `${SITE_URL}/foo` paths out of sitemap.ts's staticPages block. */
function staticSitemapRoutes(): string[] {
  const src = readFileSync(SITEMAP, "utf-8");
  const routes = new Set<string>();
  for (const m of src.matchAll(/\$\{SITE_URL\}\/([a-z0-9-]+)`/g)) {
    routes.add(m[1]);
  }
  return [...routes].sort();
}

/**
 * A route is covered when its own `page.tsx`, or any `layout.tsx` at or above
 * it (excluding the root layout, whose metadata is the generic site-wide
 * fallback this guard exists to detect), exports metadata.
 */
function metadataSourceFor(route: string): string | null {
  const segments = route.split("/");
  const pagePath = join(APP_DIR, ...segments, "page.tsx");
  if (existsSync(pagePath) && METADATA_EXPORT.test(readFileSync(pagePath, "utf-8"))) {
    return `${route}/page.tsx`;
  }
  for (let depth = segments.length; depth >= 1; depth--) {
    const layoutPath = join(APP_DIR, ...segments.slice(0, depth), "layout.tsx");
    if (existsSync(layoutPath) && METADATA_EXPORT.test(readFileSync(layoutPath, "utf-8"))) {
      return `${segments.slice(0, depth).join("/")}/layout.tsx`;
    }
  }
  return null;
}

describe("sitemap routes carry their own metadata", () => {
  it("finds the static routes in sitemap.ts", () => {
    // Guards the guard: if the sitemap is restructured so the regex stops
    // matching, this test fails loudly instead of vacuously passing.
    expect(staticSitemapRoutes().length).toBeGreaterThanOrEqual(9);
  });

  it.each(staticSitemapRoutes())(
    "/%s has a route-specific title",
    (route) => {
      expect(metadataSourceFor(route), `/${route} exports no metadata and no layout above it does either, so it inherits the root layout's generic site title. Add "export const metadata" to its page.tsx if the page is a server component, or to a sibling layout.tsx if the page is "use client".`).not.toBeNull();
    },
  );
});
