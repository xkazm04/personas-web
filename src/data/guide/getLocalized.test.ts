import { describe, it, expect, vi } from "vitest";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { resolveTopicUnit, type TopicUnit, type TopicUnitLoaders } from "./getLocalized";
import { GUIDE_TOPICS } from "./topics";
import { GUIDE_CONTENT } from "./content";
import { GUIDE_TRANSLATION_STATUS, GUIDE_STATUS_INPUT_DIGEST } from "./translation-status";
import type { Language } from "@/stores/i18nStore";

// Zero-dependency node scripts (see guide-source-extraction.test.ts for why they
// live outside src/).
import {
  buildStatusTable,
  emitGuideStatus,
  inputDigest,
  renderStatusModule,
} from "../../../scripts/i18n/emit-guide-status.mjs";
import { classifyGuide, createGitHistory, GUIDE_LOCALES, HistoryUnavailableError } from "../../../scripts/i18n/guide-drift.mjs";
import { normaliseEol } from "../../../scripts/i18n/guide-source.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LOCALES = GUIDE_LOCALES as readonly Language[];

function englishUnit(topicId: string): TopicUnit {
  const t = GUIDE_TOPICS.find((x) => x.id === topicId);
  if (!t) throw new Error(`no English topic ${topicId}`);
  return { title: t.title, description: t.description, body: GUIDE_CONTENT[topicId] ?? "" };
}

type LocaleTopics = { topics: Record<string, { title?: string; description?: string }> };
type LocaleContent = { content: Record<string, string> };

async function localeUnit(lang: Language, topicId: string): Promise<Partial<TopicUnit>> {
  const t = GUIDE_TOPICS.find((x) => x.id === topicId)!;
  const topics = (await import(`./locales/${lang}/topics`)) as LocaleTopics;
  const content = (await import(`./locales/${lang}/content/${t.categoryId}`)) as LocaleContent;
  return {
    title: topics.topics[topicId]?.title,
    description: topics.topics[topicId]?.description,
    body: content.content[topicId],
  };
}

function isShallowOrNoGit(): boolean {
  try {
    const out = execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim() !== "false";
  } catch {
    return true;
  }
}

// ── Serving policy: one whole unit, never a splice ──────────────────────────

describe("resolveTopicUnit - whole-unit serving", () => {
  it("a stale translation yields to the whole current English unit, with the translation as the alternate", async () => {
    // English says Windows today, macOS/Linux on the roadmap; the ja body still
    // tells the reader to pick the macOS .dmg or Linux .AppImage/.deb installer.
    const en = englishUnit("installing-personas");
    const r = await resolveTopicUnit("ja", "installing-personas", en);
    expect(r).toMatchObject({ unit: "canonical", status: "stale", alternate: "translation" });
    expect(r.title).toBe(en.title);
    expect(r.description).toBe(en.description);
    expect(r.body).toBe(en.body);
    expect(r.body).toMatch(/on the roadmap/);
    expect(r.body).not.toBe((await localeUnit("ja", "installing-personas")).body);
  });

  it("a fresh translation is served whole from the locale modules, no English field", async () => {
    const id = "installing-personas";
    const r = await resolveTopicUnit("ja", id, englishUnit(id), { loaders: { status: async () => ({}) } });
    const ja = await localeUnit("ja", id);
    expect(r).toMatchObject({ unit: "translated", status: "fresh", alternate: null });
    expect({ title: r.title, description: r.description, body: r.body }).toEqual(ja);
  });

  it("no splicing: over 13 locales x every topic, a unit is all-locale or all-English (both preferences)", async () => {
    let translated = 0;
    let canonical = 0;
    for (const lang of LOCALES) {
      for (const topic of GUIDE_TOPICS) {
        const en = englishUnit(topic.id);
        const loc = await localeUnit(lang, topic.id);
        for (const prefer of [undefined, "translation", "canonical"] as const) {
          const r = await resolveTopicUnit(lang, topic.id, en, { prefer });
          const fields = { title: r.title, description: r.description, body: r.body };
          if (r.unit === "translated") {
            translated++;
            expect(fields, `${lang}/${topic.id}`).toEqual(loc);
          } else {
            canonical++;
            expect(fields, `${lang}/${topic.id}`).toEqual(en);
          }
        }
      }
    }
    expect(translated).toBeGreaterThan(0);
    expect(canonical).toBeGreaterThan(0);
    // ~1.5k locale-module loads x 3 preferences: over the 5s default when the
    // machine is busy (timed out twice under a parallel build), well under this.
  }, 60_000);

  it("the reader's switch is a pure, reversible input: prefer translation, then back to current English", async () => {
    const en = englishUnit("installing-personas");
    const older = await resolveTopicUnit("ja", "installing-personas", en, { prefer: "translation" });
    expect(older).toMatchObject({ unit: "translated", status: "stale", alternate: "canonical" });
    expect(older.body).toBe((await localeUnit("ja", "installing-personas")).body);
    const back = await resolveTopicUnit("ja", "installing-personas", en, { prefer: "canonical" });
    expect(back).toMatchObject({ unit: "canonical", status: "stale", alternate: "translation" });
    expect(back.body).toBe(en.body);
  });

  it("a translated-but-unrecorded topic whose English has not changed is served translated (not demoted)", async () => {
    // team-assignments: present in every locale, never stamped in _meta.json, English unchanged since.
    const r = await resolveTopicUnit("ja", "team-assignments", englishUnit("team-assignments"));
    expect(r).toMatchObject({ unit: "translated", status: "fresh", alternate: null });
    expect(r.body).toBe((await localeUnit("ja", "team-assignments")).body);
  });

  it("a translated-but-unrecorded topic whose English changed since it landed is stale", async () => {
    const r = await resolveTopicUnit("ja", "athenas-long-term-memory", englishUnit("athenas-long-term-memory"));
    expect(r).toMatchObject({ unit: "canonical", status: "stale", alternate: "translation" });
  });

  it("an unverified pin is served as English with the translation offered, like stale", async () => {
    const id = "installing-personas";
    const r = await resolveTopicUnit("ja", id, englishUnit(id), {
      loaders: { status: async () => ({ ja: { [id]: "unverified" } }) },
    });
    expect(r).toMatchObject({ unit: "canonical", status: "unverified", alternate: "translation" });
  });

  it("no locale body -> English with no alternate (no dead button); half a unit is not a unit", async () => {
    const id = "installing-personas";
    const en = englishUnit(id);
    const noBody = await resolveTopicUnit("ja", id, en, {
      loaders: { content: async () => ({ content: {} }), status: async () => ({}) },
    });
    expect(noBody).toMatchObject({ unit: "canonical", status: "absent", alternate: null, body: en.body, title: en.title });

    const noTitle = await resolveTopicUnit("ja", id, en, {
      loaders: { topics: async () => ({ topics: { [id]: { description: "x" } } }), status: async () => ({}) },
    });
    expect(noTitle).toMatchObject({ unit: "canonical", status: "absent", alternate: null, title: en.title, description: en.description });

    const missingModule = await resolveTopicUnit("ja", id, en, { loaders: { content: async () => null } });
    expect(missingModule).toMatchObject({ unit: "canonical", alternate: null });
  });

  it("English is unchanged: canonical, and neither the status table nor a locale module is loaded", async () => {
    const loaders: TopicUnitLoaders = {
      topics: vi.fn(async () => null),
      content: vi.fn(async () => null),
      status: vi.fn(async () => ({})),
    };
    const en = englishUnit("installing-personas");
    const r = await resolveTopicUnit("en", "installing-personas", en, { loaders, prefer: "translation" });
    expect(r).toEqual({ ...en, unit: "canonical", status: "source", alternate: null });
    expect(loaders.topics).not.toHaveBeenCalled();
    expect(loaders.content).not.toHaveBeenCalled();
    expect(loaders.status).not.toHaveBeenCalled();
  });
});

// ── The status table: generated, committed, never allowed to drift ──────────

describe("translation-status.ts contract", () => {
  it("the committed table was generated from today's English, pins and locale bodies (no git needed)", () => {
    // Fails on any English guide edit (title, description or body), any _meta.json
    // change and any added/removed locale body until the table is regenerated with
    // `node scripts/i18n/emit-guide-status.mjs`.
    expect(inputDigest(createGitHistory(REPO_ROOT))).toBe(GUIDE_STATUS_INPUT_DIGEST);
  });

  it.skipIf(isShallowOrNoGit())(
    "the committed table deep-equals the table the history-anchored classifier derives today",
    () => {
      const report = classifyGuide({ history: createGitHistory(REPO_ROOT), locales: GUIDE_LOCALES });
      expect(buildStatusTable(report)).toEqual(GUIDE_TRANSLATION_STATUS);
    },
    180_000,
  );
});

// ── The emitter ─────────────────────────────────────────────────────────────

const F = (topicId: string, verdict: string, extra: Record<string, unknown> = {}) => ({ topicId, verdict, ...extra });

describe("emit-guide-status", () => {
  it("maps classifier findings to runtime status; only non-current translations are stored", () => {
    const report = {
      generated: null,
      source: { contentFiles: 1, topicCount: 9, bodyCount: 9 },
      locales: {
        ja: {
          fresh: [F("exact", "fresh", { cause: "exact" }), F("eol", "fresh", { cause: "instrument:eol" }), F("ext", "fresh", { cause: "instrument:extractor" })],
          stale: [F("edited", "stale", { cause: "content" }), F("unknown", "stale", { cause: "unverified" })],
          missing: [
            F("unpinned-same", "missing", { sub: "present-unpinned", englishChangedSinceAnchor: false }),
            F("unpinned-changed", "missing", { sub: "present-unpinned", englishChangedSinceAnchor: true }),
            F("unpinned-unanchored", "missing", { sub: "present-unpinned", englishChangedSinceAnchor: null }),
            F("never", "missing", { sub: "absent" }),
          ],
          orphaned: [F("gone", "orphaned")],
        },
        de: { fresh: [F("exact", "fresh", { cause: "exact" })], stale: [], missing: [], orphaned: [] },
      },
    };
    expect(buildStatusTable(report)).toEqual({
      de: {},
      ja: { edited: "stale", unknown: "unverified", "unpinned-changed": "stale", "unpinned-unanchored": "unverified" },
    });
  });

  it("renders deterministically: insertion order does not change a byte", () => {
    const a = renderStatusModule({ table: { ja: { b: "stale", a: "unverified" }, de: {} }, digest: "d" });
    const b = renderStatusModule({ table: { de: {}, ja: { a: "unverified", b: "stale" } }, digest: "d" });
    expect(a).toBe(b);
    expect(a.indexOf('"de"')).toBeLessThan(a.indexOf('"ja"'));
    expect(a.indexOf('"a"')).toBeLessThan(a.indexOf('"b"'));
    expect(a).toContain("emit-guide-status.mjs");
  });

  const realWorktree = () => {
    const git = createGitHistory(REPO_ROOT);
    return { readAt: git.readAt, listAt: git.listAt };
  };

  it("history unavailable (shallow clone) fails loudly and writes nothing", () => {
    const write = vi.fn();
    const history = {
      ...realWorktree(),
      assertAvailable() {
        throw new HistoryUnavailableError("shallow clone");
      },
      revisions: () => [],
      introducedIn: () => null,
    };
    const r = emitGuideStatus({ history, locales: GUIDE_LOCALES, write });
    expect(r.exitCode).toBe(3);
    expect(r.stderr).toMatch(/history unavailable/);
    expect(write).not.toHaveBeenCalled();
  });

  it("history failing mid-run (a revision read throws) also exits 3 and writes nothing", () => {
    const write = vi.fn();
    const wt = realWorktree();
    const history = {
      readAt: (rev: string | null, rel: string) => {
        if (rev !== null) throw new Error("fatal: bad object");
        return wt.readAt(null, rel);
      },
      listAt: wt.listAt,
      revisions: () => [{ rev: "deadbeef", time: "2026-05-01T00:00:00Z" }],
      introducedIn: () => {
        throw new Error("fatal: bad object");
      },
    };
    const r = emitGuideStatus({ history, locales: ["ja"], write });
    expect(r.exitCode).toBe(3);
    expect(write).not.toHaveBeenCalled();
  });

  it("refuses to write a table built from no English at all", () => {
    const write = vi.fn();
    const history = {
      readAt: () => null,
      listAt: () => [],
      revisions: () => [],
      introducedIn: () => null,
      assertAvailable() {},
    };
    const r = emitGuideStatus({ history, locales: ["ja"], write });
    expect(r.exitCode).toBe(2);
    expect(write).not.toHaveBeenCalled();
  });

  it("the input digest moves when an English body changes and ignores the checkout's line endings", () => {
    const wt = realWorktree();
    const history = (edit: (rel: string, text: string) => string) => ({
      readAt: (rev: string | null, rel: string) => {
        const t = wt.readAt(rev, rel);
        return t == null ? t : edit(rel, t);
      },
      listAt: wt.listAt,
    });
    const base = inputDigest(history((_, t) => t));
    expect(base).toBe(inputDigest(history((rel, t) => (rel.includes("/guide/content/") ? normaliseEol(t, "crlf") : t))));
    expect(base).toBe(inputDigest(history((rel, t) => (rel.includes("/guide/content/") ? normaliseEol(t, "lf") : t))));
    const edited = inputDigest(
      history((rel, t) => (rel.endsWith("/guide/content/getting-started.ts") ? t.replace("Windows", "Windoze") : t)),
    );
    expect(edited).not.toBe(base);
  });
});
