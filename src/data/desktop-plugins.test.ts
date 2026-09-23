import { describe, it, expect } from "vitest";
import { DESKTOP_PLUGINS } from "./desktop-plugins";
import { DESKTOP_MODULES } from "./guide/desktop-modules";
import {
  SHOWCASE_KEYS,
  DEFAULT_SHOWCASE_KEY,
  assertShowcaseShipped,
  pluginsIntro,
} from "@/components/feature-sections/plugins/roster";

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

  it("derives both intro numbers instead of hand-typing a count", () => {
    const shipped = shippedIds().length;
    const intro = pluginsIntro(SHOWCASE_KEYS.length, shipped);
    expect(intro).toMatch(/\bFour\b/);
    expect(intro).toMatch(/\btwo\b/);
    // A different roster yields different numbers: the count is computed.
    const other = pluginsIntro(3, 5);
    expect(other).toMatch(/\bFive\b/);
    expect(other).toMatch(/\bthree\b/);
    expect(other).not.toMatch(/\b(Four|four|two)\b/);
    // Out of the word table it falls back to digits rather than inventing one.
    expect(pluginsIntro(2, 17)).toMatch(/\b17\b/);
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
