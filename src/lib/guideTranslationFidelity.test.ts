import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractBodies } from "../../scripts/i18n/guide-source.mjs";

/**
 * Quality eval for agent-written guide translations.
 *
 * The 13 guide locales under src/data/guide/locales/ are written by an agent from
 * scripts/i18n/translate-guide-subagent-prompt.md. check:guide-content checks that
 * each topic exists, and check:guide-translations checks that its pinned source
 * hash is current. Neither reads what the translation says. This spec compares
 * each translated topic with its English source on what a faithful translation
 * keeps: the heading outline (count and level of every heading, in order) and
 * every link and image target. A translator that drops a section, flattens a
 * list of sub-headings or loses a link fails here, even with every key present.
 *
 * KNOWN_* below lists the topics that diverge today, measured on 2026-10-13 and
 * the same in all 13 locales (in each case the English has the section or link
 * and the translation does not). It is a ratchet: a listed topic that matches
 * again in every locale fails the last test until it is removed from the list,
 * and the list may only shrink. Fix a listed topic by re-translating it.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GUIDE = path.join(ROOT, "src", "data", "guide");

/** Topics whose heading outline differs from the English in at least one locale. */
const KNOWN_OUTLINE_DRIFT = [
  "adding-a-new-credential",
  "connector-catalog",
  "installing-personas",
  "understanding-the-interface",
  "athenas-long-term-memory",
  "reviewing-and-cleaning-memories",
];

/** Topics whose link or image targets differ from the English in at least one locale. */
const KNOWN_LINK_DRIFT = [
  "adding-a-new-credential",
  "installing-personas",
  "what-is-an-ai-agent",
  "running-your-first-automation",
];

function readBodies(contentDir: string): Record<string, string> {
  const bodies: Record<string, string> = {};
  for (const file of fs.readdirSync(contentDir)) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    const full = path.join(contentDir, file);
    Object.assign(bodies, extractBodies(fs.readFileSync(full, "utf8"), full));
  }
  return bodies;
}

/** "2,3,3": the level of each markdown heading, in order. */
function outline(body: string): string {
  const levels: number[] = [];
  for (const line of body.split(/\r?\n/)) {
    const m = /^(#{1,6}) /.exec(line);
    if (m) levels.push(m[1].length);
  }
  return levels.join(",");
}

/** Sorted, de-duplicated targets of every `[text](target)` and `![alt](target)`. */
function linkTargets(body: string): string {
  const targets = new Set<string>();
  const re = /\]\(([^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) targets.add(m[1]);
  return [...targets].sort().join(" ");
}

const english = readBodies(path.join(GUIDE, "content"));
const locales = fs
  .readdirSync(path.join(GUIDE, "locales"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(GUIDE, "locales", d.name, "content")))
  .map((d) => d.name)
  .sort();
const translated = new Map(locales.map((l) => [l, readBodies(path.join(GUIDE, "locales", l, "content"))]));

/** topic -> locales in which `measure` of the translation differs from the English. */
function divergences(measure: (body: string) => string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const [locale, bodies] of translated) {
    for (const [topic, body] of Object.entries(bodies)) {
      const source = english[topic];
      if (source === undefined || measure(source) === measure(body)) continue;
      out.set(topic, [...(out.get(topic) ?? []), locale]);
    }
  }
  return out;
}

const outlineDrift = divergences(outline);
const linkDrift = divergences(linkTargets);

describe("guide translation fidelity", () => {
  it("reads a real corpus", () => {
    expect(Object.keys(english).length).toBeGreaterThan(100);
    expect(locales).toHaveLength(13);
    for (const [locale, bodies] of translated) {
      expect(Object.keys(bodies).length, locale).toBeGreaterThan(100);
    }
  });

  it("keeps every topic's heading outline, except the known drift", () => {
    const unexpected = [...outlineDrift].filter(([topic]) => !KNOWN_OUTLINE_DRIFT.includes(topic));
    expect(unexpected).toEqual([]);
  });

  it("keeps every topic's link and image targets, except the known drift", () => {
    const unexpected = [...linkDrift].filter(([topic]) => !KNOWN_LINK_DRIFT.includes(topic));
    expect(unexpected).toEqual([]);
  });

  it("lists only topics that exist and still drift (the ratchet only shrinks)", () => {
    for (const topic of [...KNOWN_OUTLINE_DRIFT, ...KNOWN_LINK_DRIFT]) {
      expect(english[topic], topic).toBeDefined();
    }
    expect(KNOWN_OUTLINE_DRIFT.filter((t) => !outlineDrift.has(t))).toEqual([]);
    expect(KNOWN_LINK_DRIFT.filter((t) => !linkDrift.has(t))).toEqual([]);
  });

  it("measures what it claims to", () => {
    expect(outline("## A\r\ntext\n### B\n#no\n  ## indented\n### C")).toBe("2,3,3");
    expect(linkTargets("see [a](/x) and ![b](/img.png) and [c](/x)")).toBe("/img.png /x");
    expect(linkTargets("no links (here)")).toBe("");
  });
});
