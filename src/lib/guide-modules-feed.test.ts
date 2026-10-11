import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DESKTOP_MODULES } from "@/data/guide/desktop-modules";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { LANGUAGES } from "@/i18n/localeRelease";
import {
  buildGuideModulesFeed,
  serializeGuideModulesFeed,
  GUIDE_MODULES_FEED_PATH,
  type GuideModulesFeed,
} from "./guide-modules-feed";

/**
 * The published contract: public/guide/modules/v1.json is TOPIC_MODULE_MAP
 * inverted. The file is generated (node scripts/generate-guide-modules.mjs,
 * which runs this file with GUIDE_MODULES_WRITE=1); the tests below pin its
 * shape and fail when it drifts from the registries it is derived from.
 */

const FEED_FILE = join(process.cwd(), GUIDE_MODULES_FEED_PATH);
let feed: GuideModulesFeed;

beforeAll(async () => {
  feed = await buildGuideModulesFeed();
  if (process.env.GUIDE_MODULES_WRITE === "1") {
    mkdirSync(dirname(FEED_FILE), { recursive: true });
    writeFileSync(FEED_FILE, serializeGuideModulesFeed(feed));
  }
}, 60_000);

describe("guide modules feed", () => {
  it("is identical to the committed public/guide/modules/v1.json", () => {
    const onDisk = readFileSync(FEED_FILE, "utf8").replace(/\r\n/g, "\n");
    expect(onDisk, "stale feed: run `node scripts/generate-guide-modules.mjs` and commit the result").toBe(
      serializeGuideModulesFeed(feed),
    );
  });

  it("is versioned and names every locale the site ships", () => {
    expect(feed.schemaVersion).toBe(1);
    expect(feed.locales).toEqual(LANGUAGES.map((l) => l.id));
    expect(feed.locales).toHaveLength(14);
  });

  it("only lists real desktop modules, each with at least one topic", () => {
    const ids = new Set(DESKTOP_MODULES.map((m) => m.id));
    expect(feed.modules.length).toBeGreaterThan(0);
    for (const m of feed.modules) {
      expect(ids.has(m.id), `unknown module ${m.id}`).toBe(true);
      expect(m.topics.length, `${m.id} has no topics`).toBeGreaterThan(0);
      expect(m.from).toBe(m.id);
    }
  });

  it("gives every topic a title in every locale and a resolvable guide href", () => {
    const known = new Map(GUIDE_TOPICS.map((t) => [t.id, t]));
    for (const m of feed.modules) {
      for (const t of m.topics) {
        const src = known.get(t.id);
        expect(src, `${t.id} is not a guide topic`).toBeDefined();
        expect(t.href).toBe(`/guide/${src!.categoryId}/${t.id}`);
        expect(Object.keys(t.titles).sort()).toEqual([...feed.locales].sort());
        for (const [lang, title] of Object.entries(t.titles)) {
          expect(title.trim().length, `${t.id}/${lang} title is empty`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("excludes devOnly topics (they 404 in production)", () => {
    const devOnly = new Set(GUIDE_TOPICS.filter((t) => t.devOnly).map((t) => t.id));
    const listed = feed.modules.flatMap((m) => m.topics.map((t) => t.id));
    for (const id of listed) expect(devOnly.has(id), `${id} is devOnly`).toBe(false);
  });

  it("lists every visible topic once, and each module's screens partition its topics", () => {
    const visible = GUIDE_TOPICS.filter((t) => !t.devOnly).length;
    const total = feed.modules.reduce((n, m) => n + m.topics.length, 0);
    expect(total).toBe(visible);
    for (const m of feed.modules) {
      const fromScreens = m.screens.flatMap((s) => s.topics.map((t) => t.id)).sort();
      expect(fromScreens).toEqual(m.topics.map((t) => t.id).sort());
      for (const s of m.screens) {
        expect(s.from).toBe(`${m.id}/${s.id}`);
        if (s.kind === "sidebar") {
          const mod = DESKTOP_MODULES.find((d) => d.id === m.id)!;
          expect(mod.children?.some((c) => c.id === s.id), `${m.id}/${s.id} is not a sidebar child`).toBe(true);
        }
      }
    }
  });

  it("surfaces the Agents editor as a view, with prompt-writing help ranked in guide order", () => {
    const agents = feed.modules.find((m) => m.id === "agents")!;
    const editor = agents.screens.find((s) => s.id === "editor")!;
    expect(editor.kind).toBe("view");
    expect(editor.from).toBe("agents/editor");
    expect(editor.topics.map((t) => t.id)).toContain("writing-effective-prompts");
    const order = GUIDE_TOPICS.map((t) => t.id);
    const idx = editor.topics.map((t) => order.indexOf(t.id));
    expect(idx).toEqual([...idx].sort((a, b) => a - b));
  });
});
