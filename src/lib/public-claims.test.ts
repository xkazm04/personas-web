import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { connectors } from "@/data/connectors";
import { templateList } from "@/lib/templates";
import {
  CONNECTOR_COUNT,
  SITE_DESCRIPTION,
  TEMPLATE_COUNT,
  TEMPLATES_OG_SUBTITLE,
} from "@/lib/public-claims";

// Surfaces whose numbers must be derived from the catalogs, never typed.
const CLAIM_SURFACES = [
  "src/lib/seo.ts",
  "src/app/homeJsonLd.ts",
  "src/app/templates/opengraph-image.tsx",
  "src/app/templates/[id]/opengraph-image.tsx",
  "src/app/sitemap.ts",
];

describe("public claims", () => {
  it("derives counts from the shipped catalogs", () => {
    expect(CONNECTOR_COUNT).toBe(connectors.length);
    expect(TEMPLATE_COUNT).toBe(templateList.length);
    expect(SITE_DESCRIPTION).toContain(`${connectors.length} integrations`);
    expect(TEMPLATES_OG_SUBTITLE).toContain(`Browse ${templateList.length} `);
  });

  it.each(CLAIM_SURFACES)("%s has no hand-typed numeric floor like '40+'", (rel) => {
    const src = readFileSync(path.resolve(process.cwd(), rel), "utf8");
    const hits = src.split("\n").filter((l) => /\b\d+\+/.test(l));
    expect(hits).toEqual([]);
  });
});
