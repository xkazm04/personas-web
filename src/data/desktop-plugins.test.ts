import { describe, it, expect } from "vitest";
import { DESKTOP_PLUGINS } from "./desktop-plugins";
import { DESKTOP_MODULES } from "./guide/desktop-modules";
import {
  SHOWCASE_KEYS,
  DEFAULT_SHOWCASE_KEY,
  assertShowcaseShipped,
  fillTemplate,
  pluginsIntro,
  SHOWCASE_COUNTS,
} from "@/components/feature-sections/plugins/roster";
import { en } from "@/i18n/en";
import { ar } from "@/i18n/ar";
import { bn } from "@/i18n/bn";
import { cs } from "@/i18n/cs";
import { de } from "@/i18n/de";
import { es } from "@/i18n/es";
import { fr } from "@/i18n/fr";
import { hi } from "@/i18n/hi";
import { id } from "@/i18n/id";
import { ja } from "@/i18n/ja";
import { ko } from "@/i18n/ko";
import { ru } from "@/i18n/ru";
import { vi } from "@/i18n/vi";
import { zh } from "@/i18n/zh";

const LOCALES = { en, ar, bn, cs, de, es, fr, hi, id, ja, ko, ru, vi, zh };

/**
 * One desktop-plugin manifest drives the /features plugin showcase, the
 * guide's Find-in-App Plugins node and the intro count. The roster used to be
 * hand-typed in four places that disagreed (4 tabs, "Four", "six", Artist in
 * the guide nav), and the desktop's removal of Artist and Research Lab
 * (desktop CHANGELOG.md:45) landed silently. These cases make the next desktop
 * roster change a red test instead of a quietly wrong page.
 */

const shippedIds = () =>
  DESKTOP_PLUGINS.filter((p) => p.status === "shipped")
    .map((p) => p.id as string)
    .sort();

describe("DESKTOP_PLUGINS manifest", () => {
  it("mirrors the desktop catalog: 4 shipped, scraper dev-only, artist + research-lab removed", () => {
    expect(shippedIds()).toEqual(["dev-tools", "drive", "obsidian-brain", "twin"]);
    const statusOf = (id: string) => DESKTOP_PLUGINS.find((p) => p.id === id)?.status;
    expect(statusOf("scraper")).toBe("dev-only");
    expect(statusOf("artist")).toBe("removed");
    expect(statusOf("research-lab")).toBe("removed");
  });

  it("cites a desktop source and a verification date for every entry", () => {
    for (const p of DESKTOP_PLUGINS) {
      expect(p.source.trim().length, `${p.id} has no source`).toBeGreaterThan(0);
      expect(p.verifiedAgainst, `${p.id} has no verifiedAgainst date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("showcase roster", () => {
  it("showcases only plugins the desktop ships", () => {
    for (const key of SHOWCASE_KEYS) {
      const entry = DESKTOP_PLUGINS.find((p) => p.id === key);
      expect(entry, `showcase key "${key}" is not in the manifest`).toBeDefined();
      expect(entry?.status, `showcase key "${key}"`).toBe("shipped");
    }
  });

  it("refuses to showcase a removed plugin, naming it", () => {
    expect(() => assertShowcaseShipped(SHOWCASE_KEYS)).not.toThrow();
    expect(() => assertShowcaseShipped([...SHOWCASE_KEYS, "artist"])).toThrow(/artist/);
    expect(() => assertShowcaseShipped([...SHOWCASE_KEYS, "scraper"])).toThrow(/scraper/);
    expect(() => assertShowcaseShipped(["not-a-plugin"])).toThrow(/not-a-plugin/);
  });

  it("derives both intro numbers into the translated template instead of hand-typing a count", () => {
    const copy = en.pluginShowcase;
    expect(SHOWCASE_COUNTS).toEqual({ showcased: SHOWCASE_KEYS.length, shipped: shippedIds().length });
    const intro = pluginsIntro(copy, SHOWCASE_COUNTS.showcased, SHOWCASE_COUNTS.shipped);
    expect(intro).toMatch(/\b4\b/);
    expect(intro).toMatch(/\b2\b/);
    expect(intro).toContain(copy.introTail);
    // A different roster yields different numbers: the count is computed.
    const other = pluginsIntro(copy, 3, 5);
    expect(other).toMatch(/\b5\b/);
    expect(other).toMatch(/\b3\b/);
    expect(other).not.toMatch(/\b[24]\b/);
    // Every shipped plugin on stage switches to the "all of them" sentence.
    const all = pluginsIntro(copy, 4, 4);
    expect(all.startsWith(fillTemplate(copy.introAll, { shipped: 4 }))).toBe(true);
    // Numbers go through the injected formatter (the component passes the locale's).
    expect(pluginsIntro(copy, 2, 17, (n) => `<${n}>`)).toContain("<17>");
  });

  it("fills a template's placeholders and leaves unknown ones visible", () => {
    expect(fillTemplate("plugin {current} of {total}", { current: 1, total: 2 })).toBe("plugin 1 of 2");
    expect(fillTemplate("{a} and {a}", { a: "x" })).toBe("x and x");
    expect(fillTemplate("{missing}", {})).toBe("{missing}");
  });

  it("every locale translates the showcase copy and interpolates every placeholder", () => {
    for (const [code, t] of Object.entries(LOCALES)) {
      const copy = t.pluginShowcase;
      const some = pluginsIntro(copy, 2, 4);
      const all = pluginsIntro(copy, 4, 4);
      const counter = fillTemplate(copy.counter, { current: 1, total: 2 });
      for (const s of [some, all, counter]) expect(s, `${code}: ${s}`).not.toMatch(/[{}]/);
      expect(some, code).toMatch(/4/);
      expect(some, code).toMatch(/2/);
      expect(all, code).toMatch(/4/);
      expect(counter, code).toMatch(/1/);
      expect(counter, code).toMatch(/2/);
      if (code !== "en") {
        // Hand-translated, not an English placeholder.
        expect(copy.introSome, code).not.toBe(en.pluginShowcase.introSome);
        expect(copy.introTail, code).not.toBe(en.pluginShowcase.introTail);
        expect(copy.taglines.devTools, code).not.toBe(en.pluginShowcase.taglines.devTools);
      }
    }
  });

  // Guards (green before by design in spirit: the tour and the Brain demo
  // depend on these keys staying in the roster).
  it("keeps dev-tools as the default key (tour clicks data-plugin-key=dev-tools)", () => {
    expect(SHOWCASE_KEYS).toContain("dev-tools");
    expect(DEFAULT_SHOWCASE_KEY).toBe("dev-tools");
  });

  it("keeps obsidian-brain in the showcase", () => {
    expect(SHOWCASE_KEYS).toContain("obsidian-brain");
  });
});

describe("guide Find-in-App Plugins node", () => {
  it("lists exactly the shipped plugins (plus the Browse surface)", () => {
    const plugins = DESKTOP_MODULES.find((m) => m.id === "plugins");
    expect(plugins, "the 'plugins' module id must stay").toBeDefined();
    const ids = (plugins?.children ?? []).map((c) => c.id);
    expect(ids[0]).toBe("browse");
    expect(new Set(ids.filter((id) => id !== "browse"))).toEqual(new Set(shippedIds()));
  });
});
