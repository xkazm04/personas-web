import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Both modules are zero-dependency node scripts (see guide-source-extraction.test.ts
// for why they live outside src/).
import {
  classifyPin,
  classifyGuide,
  runDriftCheck,
  strictFails,
  formatReport,
  createGitHistory,
  HistoryUnavailableError,
  EXIT,
} from "../../scripts/i18n/guide-drift.mjs";
import {
  extractBodies,
  extractBodiesLegacy,
  parseTopicsSource,
  normaliseEol,
  hashContent,
  topicHashInput,
} from "../../scripts/i18n/guide-source.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// ── Fixture history ─────────────────────────────────────────────────────────
// A fake repository: a list of revisions (oldest first), each a full snapshot of
// the files that matter, plus a working tree. It implements the same GuideHistory
// interface createGitHistory() does, so the classifier runs unchanged over it.

const CONTENT = "src/data/guide/content/basics.ts";
const TOPICS = "src/data/guide/topics.ts";
const loc = (lang: string, rel: string) => `src/data/guide/locales/${lang}/${rel}`;

type Files = Record<string, string>;
type Rev = { rev: string; time: string; files: Files };
type Eol = "lf" | "crlf";
type Extractor = "scanner" | "legacy";

function fixtureHistory(revs: Rev[], worktree: Files, opts: { failRevReads?: boolean } = {}) {
  const reads: Array<[string | null, string]> = [];
  const byRev = new Map(revs.map((r) => [r.rev, r]));
  const filesAt = (rev: string | null): Files => {
    if (rev === null) return worktree;
    const r = byRev.get(rev);
    if (!r) throw new Error(`fixture: unknown revision ${rev}`);
    return r.files;
  };
  return {
    reads,
    readAt(rev: string | null, rel: string): string | null {
      reads.push([rev, rel]);
      if (rev !== null && opts.failRevReads) throw new Error("fatal: bad object (shallow clone)");
      return filesAt(rev)[rel] ?? null;
    },
    listAt(rev: string | null, dir: string): string[] {
      if (rev !== null && opts.failRevReads) throw new Error("fatal: bad object (shallow clone)");
      return Object.keys(filesAt(rev))
        .filter((p) => p.startsWith(dir + "/") && !p.slice(dir.length + 1).includes("/"))
        .map((p) => p.slice(dir.length + 1));
    },
    revisions({ until }: { until: string }) {
      return revs
        .filter((r) => Date.parse(r.time) <= Date.parse(until))
        .reverse()
        .map(({ rev, time }) => ({ rev, time }));
    },
    introducedIn(rel: string, key: string) {
      const first = revs.find((r) => (r.files[rel] ?? "").includes(`"${key}": \``));
      return first ? { rev: first.rev, time: first.time } : null;
    },
  };
}

function contentFile(bodies: Record<string, string>, eol: Eol = "lf"): string {
  const lines = ["export const content: Record<string, string> = {"];
  for (const [k, b] of Object.entries(bodies)) lines.push(`  "${k}": \`${b}\`,`);
  lines.push("};", "");
  return normaliseEol(lines.join("\n"), eol);
}

function topicsFile(topics: Record<string, { title: string; description: string }>): string {
  const lines = ["export const GUIDE_TOPICS = ["];
  for (const [id, t] of Object.entries(topics)) {
    lines.push(`  { id: "${id}", categoryId: "basics", title: "${t.title}", description: "${t.description}" },`);
  }
  lines.push("];", "");
  return lines.join("\n");
}

/** A pin exactly as the old instrument (variant) would have recorded it. */
function pinOf(topicsSrc: string, contentSrc: string, id: string, extractor: Extractor, eol: Eol): string {
  const text = normaliseEol(contentSrc, eol);
  const bodies = extractor === "legacy" ? extractBodiesLegacy(text) : extractBodies(text);
  const meta = parseTopicsSource(topicsSrc)[id];
  return hashContent(topicHashInput(meta, bodies[id] ?? ""));
}

function metaFile(pins: Record<string, string>, translatedAt = "2026-05-16T16:00:00.000Z"): string {
  const topics: Record<string, { translatedFromHash: string; translatedAt: string }> = {};
  for (const [id, h] of Object.entries(pins)) topics[id] = { translatedFromHash: h, translatedAt };
  return JSON.stringify({ locale: "ja", translatedAt, topics });
}

// Body B: the escaped code span followed by a comma is exactly what truncated
// the legacy regex, so B's legacy extraction is a strict prefix of it.
const B = "\n## Alpha\n\nFirst paragraph.\n\nClick \\`Create Agent\\`, then name it.\n\nThird paragraph.\n";
const B_EDITED = B.replace("Third paragraph.", "Third paragraph, rewritten after translation.");
const META = { alpha: { title: "Alpha", description: "About alpha" } };
const T1 = "2026-05-16T10:00:00.000Z";
const PIN_AT = "2026-05-16T16:00:00.000Z";

function oneTopicCase(opts: {
  anchorContent: string;
  headContent: string;
  pin: string;
  headTopics?: string;
}) {
  const anchorTopics = topicsFile(META);
  const history = fixtureHistory(
    [{ rev: "r-anchor", time: T1, files: { [TOPICS]: anchorTopics, [CONTENT]: opts.anchorContent } }],
    { [TOPICS]: opts.headTopics ?? anchorTopics, [CONTENT]: opts.headContent },
  );
  return classifyPin({
    history,
    topicId: "alpha",
    pin: { translatedFromHash: opts.pin, translatedAt: PIN_AT },
  });
}

// ── Acceptance ──────────────────────────────────────────────────────────────

describe("classifyPin - instrument churn is named, not reported as drift", () => {
  it("CRLF pin, English unchanged, working tree now LF -> fresh / instrument:eol", () => {
    // git show returns the blob (LF); the pin was taken over a CRLF checkout.
    const anchor = contentFile({ alpha: B }, "lf");
    const pin = pinOf(topicsFile(META), anchor, "alpha", "scanner", "crlf");
    // v1 compared bare hashes: this pin differs from today's hash, so it read stale.
    expect(pin).not.toBe(pinOf(topicsFile(META), anchor, "alpha", "scanner", "lf"));
    const f = oneTopicCase({ anchorContent: anchor, headContent: contentFile({ alpha: B }, "lf"), pin });
    expect(f).toMatchObject({ verdict: "fresh", cause: "instrument:eol", anchorRev: "r-anchor" });
  });

  it("pin over the legacy-regex PREFIX, English unchanged -> fresh / instrument:extractor", () => {
    const anchor = contentFile({ alpha: B }, "lf");
    const legacyBody = extractBodiesLegacy(anchor).alpha;
    expect(legacyBody.length).toBeLessThan(extractBodies(anchor).alpha.length); // fixture sanity
    const pin = pinOf(topicsFile(META), anchor, "alpha", "legacy", "crlf");
    const f = oneTopicCase({ anchorContent: anchor, headContent: contentFile({ alpha: B }, "crlf"), pin });
    expect(f).toMatchObject({ verdict: "fresh", cause: "instrument:extractor", anchorRev: "r-anchor" });
  });

  it("verified pin, one paragraph changed at HEAD -> stale / content, with both hashes, anchor and the line diff", () => {
    const anchor = contentFile({ alpha: B }, "lf");
    const pin = pinOf(topicsFile(META), anchor, "alpha", "scanner", "crlf");
    const head = contentFile({ alpha: B_EDITED }, "crlf");
    const f = oneTopicCase({ anchorContent: anchor, headContent: head, pin });
    expect(f).toMatchObject({ verdict: "stale", cause: "content", recordedHash: pin, anchorRev: "r-anchor" });
    expect(f.currentHash).toBe(pinOf(topicsFile(META), head, "alpha", "scanner", "crlf"));
    expect(f.currentHash).not.toBe(pin);
    expect(f.diff?.body).toContain("+Third paragraph, rewritten after translation.");
    expect(f.diff?.body).toContain("-Third paragraph.");
    // Unchanged lines are context, never reported as changed.
    expect(f.diff?.body).not.toContain("-First paragraph.");
  });

  it("verified pin, body unchanged, title changed at HEAD -> stale / content (title stays in hash scope)", () => {
    const anchor = contentFile({ alpha: B }, "lf");
    const pin = pinOf(topicsFile(META), anchor, "alpha", "scanner", "crlf");
    const f = oneTopicCase({
      anchorContent: anchor,
      headContent: contentFile({ alpha: B }, "crlf"),
      headTopics: topicsFile({ alpha: { title: "Alpha, renamed", description: "About alpha" } }),
      pin,
    });
    expect(f).toMatchObject({ verdict: "stale", cause: "content" });
    expect(f.diff?.title).toEqual(["Alpha", "Alpha, renamed"]);
  });

  it("pin that matches no variant at the anchor or any candidate revision -> stale / unverified, never fresh", () => {
    const anchor = contentFile({ alpha: B }, "lf");
    // Outside the closed variant set: an instrument that trimmed the body.
    const meta = parseTopicsSource(topicsFile(META)).alpha;
    const trimmedPin = hashContent(topicHashInput(meta, extractBodies(anchor).alpha.trim()));
    for (const pin of ["deadbeef0000", trimmedPin]) {
      const history = fixtureHistory(
        [
          { rev: "r-old", time: "2026-05-15T10:00:00.000Z", files: { [TOPICS]: topicsFile(META), [CONTENT]: anchor } },
          { rev: "r-anchor", time: T1, files: { [TOPICS]: topicsFile(META), [CONTENT]: anchor } },
        ],
        { [TOPICS]: topicsFile(META), [CONTENT]: contentFile({ alpha: B }, "crlf") },
      );
      const f = classifyPin({ history, topicId: "alpha", pin: { translatedFromHash: pin, translatedAt: PIN_AT } });
      expect(f).toMatchObject({ verdict: "stale", cause: "unverified", recordedHash: pin });
      expect(f.anchorRev ?? null).toBeNull();
    }
  });
});

describe("classifyGuide - unpinned is not untranslated", () => {
  it("locale content has the key, _meta.json has no entry -> missing / present-unpinned with the introducing commit", () => {
    const ids = Array.from({ length: 19 }, (_, i) => `topic-${String.fromCharCode(97 + i)}`);
    const meta = Object.fromEntries(ids.map((id) => [id, { title: `T ${id}`, description: `D ${id}` }]));
    const en = contentFile(Object.fromEntries(ids.map((id) => [id, `\n## ${id}\n\nBody of ${id}.\n`])), "lf");
    const ja = contentFile(Object.fromEntries(ids.map((id) => [id, `\n## ${id} (ja)\n\nJA ${id}.\n`])), "lf");
    const enFiles = { [TOPICS]: topicsFile(meta), [CONTENT]: en };
    const history = fixtureHistory(
      [
        { rev: "r-english", time: "2026-06-01T10:00:00.000Z", files: { ...enFiles } },
        { rev: "r-parity", time: "2026-06-14T10:00:00.000Z", files: { ...enFiles, [loc("ja", "content/basics.ts")]: ja } },
      ],
      { ...enFiles, [loc("ja", "content/basics.ts")]: ja, [loc("ja", "_meta.json")]: metaFile({}) },
    );
    const report = classifyGuide({ history, locales: ["ja"] });
    const missing = report.locales.ja.missing;
    expect(missing).toHaveLength(19);
    for (const m of missing) {
      expect(m).toMatchObject({ verdict: "missing", sub: "present-unpinned", anchorRev: "r-parity" });
    }
    const text = formatReport(report);
    expect(text).toContain("missing 19 (19 present-unpinned)");
    expect(text).not.toMatch(/missing 19\s*:/);
  });

  it("a key the locale does not carry at all stays missing / absent, with no anchor", () => {
    const en = contentFile({ alpha: B }, "lf");
    const history = fixtureHistory([], {
      [TOPICS]: topicsFile(META),
      [CONTENT]: en,
      [loc("ja", "content/basics.ts")]: contentFile({}, "lf"),
      [loc("ja", "_meta.json")]: metaFile({}),
    });
    const report = classifyGuide({ history, locales: ["ja"] });
    expect(report.locales.ja.missing).toEqual([
      expect.objectContaining({ topicId: "alpha", verdict: "missing", sub: "absent" }),
    ]);
    expect(formatReport(report)).toContain("missing 1 (1 absent)");
  });
});

// A whole-guide fixture with one topic per verdict/cause, reused by the exit-code cases.
function guideFixture(kinds: Array<"exact" | "eol" | "extractor" | "content" | "unverified" | "unpinned">, opts: { failRevReads?: boolean } = {}) {
  const topics: Record<string, { title: string; description: string }> = {};
  const anchorBodies: Record<string, string> = {};
  const headBodies: Record<string, string> = {};
  const jaBodies: Record<string, string> = {};
  for (const k of kinds) {
    topics[k] = { title: `Title ${k}`, description: `Desc ${k}` };
    const body = `\n## ${k}\n\nSee \\\`Create Agent\\\`, then continue.\n\nTail of ${k}.\n`;
    anchorBodies[k] = body;
    headBodies[k] = k === "content" ? body.replace(`Tail of ${k}.`, `New tail of ${k}.`) : body;
    jaBodies[k] = `\n## ${k} (ja)\n`;
  }
  const anchor = contentFile(anchorBodies, "lf");
  const head = contentFile(headBodies, "crlf");
  const topicsSrc = topicsFile(topics);
  const pins: Record<string, string> = {};
  for (const k of kinds) {
    if (k === "unpinned") continue;
    if (k === "exact") pins[k] = pinOf(topicsSrc, head, k, "scanner", "crlf");
    else if (k === "eol") pins[k] = pinOf(topicsSrc, anchor, k, "scanner", "lf");
    else if (k === "extractor") pins[k] = pinOf(topicsSrc, anchor, k, "legacy", "crlf");
    else if (k === "content") pins[k] = pinOf(topicsSrc, anchor, k, "scanner", "crlf");
    else pins[k] = "0123456789ab";
  }
  const jaContent = contentFile(jaBodies, "lf");
  return fixtureHistory(
    [{ rev: "r-anchor", time: T1, files: { [TOPICS]: topicsSrc, [CONTENT]: anchor, [loc("ja", "content/basics.ts")]: jaContent } }],
    { [TOPICS]: topicsSrc, [CONTENT]: head, [loc("ja", "content/basics.ts")]: jaContent, [loc("ja", "_meta.json")]: metaFile(pins) },
    opts,
  );
}

describe("history unavailable is its own outcome", () => {
  it("an injected reader that cannot read revisions -> distinct exit and 'history unavailable', no report", () => {
    const history = guideFixture(["exact", "eol", "content"], { failRevReads: true });
    const out = runDriftCheck({ history, locales: ["ja"], flags: { strict: false } });
    expect(out.exitCode).toBe(EXIT.HISTORY_UNAVAILABLE);
    expect(EXIT.HISTORY_UNAVAILABLE).not.toBe(EXIT.OK);
    expect(EXIT.HISTORY_UNAVAILABLE).not.toBe(EXIT.DRIFT);
    expect(out.stderr).toContain("history unavailable");
    // Not a clean report, and not the v1 bare-hash numbers relabelled.
    expect(out.stdout).toBe("");
    expect(out.stderr).not.toMatch(/stale|fresh|Total drift/);
  });

  it("the same under --strict and --json", () => {
    const history = guideFixture(["eol"], { failRevReads: true });
    for (const flags of [{ strict: true }, { json: true }, { workOrder: true }]) {
      const out = runDriftCheck({ history, locales: ["ja"], flags });
      expect(out.exitCode).toBe(EXIT.HISTORY_UNAVAILABLE);
      expect(out.stdout).toBe("");
    }
  });

  describe("a real shallow clone", () => {
    let tmp: string;
    beforeAll(() => {
      tmp = fs.mkdtempSync(path.join(os.tmpdir(), "guide-drift-"));
      const src = path.join(tmp, "src-repo");
      fs.mkdirSync(src);
      const git = (cwd: string, ...args: string[]) =>
        execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
      git(src, "init", "-q");
      git(src, "config", "user.email", "t@example.com");
      git(src, "config", "user.name", "t");
      git(src, "config", "core.autocrlf", "false");
      fs.mkdirSync(path.join(src, "src", "data", "guide", "content"), { recursive: true });
      fs.writeFileSync(path.join(src, TOPICS), topicsFile(META));
      fs.writeFileSync(path.join(src, CONTENT), contentFile({ alpha: B }));
      git(src, "add", ".");
      git(src, "commit", "-q", "-m", "one");
      fs.writeFileSync(path.join(src, CONTENT), contentFile({ alpha: B_EDITED }));
      git(src, "commit", "-q", "-am", "two");
      git(tmp, "clone", "-q", "--depth", "1", `file://${src.replace(/\\/g, "/")}`, "shallow");
    }, 30_000);
    afterAll(() => {
      fs.rmSync(tmp, { recursive: true, force: true });
    });

    it("createGitHistory refuses a shallow clone with HistoryUnavailableError", () => {
      const history = createGitHistory(path.join(tmp, "shallow"));
      expect(() => history.assertAvailable()).toThrow(HistoryUnavailableError);
      expect(() => history.assertAvailable()).toThrow(/history unavailable/);
    });

    it("runDriftCheck over it exits HISTORY_UNAVAILABLE even when every pin would be exact", () => {
      const history = createGitHistory(path.join(tmp, "shallow"));
      const out = runDriftCheck({ history, locales: [], flags: { strict: true } });
      expect(out.exitCode).toBe(EXIT.HISTORY_UNAVAILABLE);
      expect(out.stderr).toContain("history unavailable");
      expect(out.stdout).toBe("");
    });

    it("the full clone it came from is available", () => {
      expect(() => createGitHistory(path.join(tmp, "src-repo")).assertAvailable()).not.toThrow();
    });
  });
});

describe("--strict is a statement over the verdict set", () => {
  it("instrument-only differences -> exit 0 under --strict", () => {
    const history = guideFixture(["exact", "eol", "extractor"]);
    const report = classifyGuide({ history, locales: ["ja"] });
    expect(strictFails(report)).toBe(false);
    expect(report.locales.ja.fresh.map((f) => f.cause).sort()).toEqual([
      "exact",
      "instrument:eol",
      "instrument:extractor",
    ]);
    expect(runDriftCheck({ history, locales: ["ja"], flags: { strict: true } }).exitCode).toBe(EXIT.OK);
  });

  it.each([["content"], ["unverified"], ["unpinned"]] as const)("a %s finding -> exit 1 under --strict, 0 without", (kind) => {
    const history = guideFixture(["exact", "eol", kind]);
    expect(strictFails(classifyGuide({ history, locales: ["ja"] }))).toBe(true);
    expect(runDriftCheck({ history, locales: ["ja"], flags: { strict: true } }).exitCode).toBe(EXIT.DRIFT);
    expect(runDriftCheck({ history, locales: ["ja"], flags: { strict: false } }).exitCode).toBe(EXIT.OK);
  });

  it("the text report folds instrument churn into fresh and says so", () => {
    const history = guideFixture(["exact", "eol", "extractor", "content"]);
    const text = runDriftCheck({ history, locales: ["ja"], flags: {} }).stdout;
    expect(text).toContain("stale 1 (content 1; instrument 2 folded into fresh)");
  });

  it("--work-order lists content-stale topics per locale with the English diff, and no instrument-only topic", () => {
    const history = guideFixture(["exact", "eol", "extractor", "content"]);
    const text = runDriftCheck({ history, locales: ["ja"], flags: { workOrder: true } }).stdout;
    expect(text).toContain("- ja (1): content");
    expect(text).toContain("## content");
    expect(text).toContain("+New tail of content.");
    expect(text).not.toMatch(/^## (eol|extractor|exact)$/m);
  });
});

describe("classifyPin - supporting behaviour", () => {
  it("a pin equal to today's hash is fresh / exact without reading any revision", () => {
    const history = guideFixture(["exact"]);
    const report = classifyGuide({ history, locales: ["ja"] });
    expect(report.locales.ja.fresh).toEqual([expect.objectContaining({ topicId: "exact", cause: "exact" })]);
    expect(history.reads.filter(([rev]) => rev !== null)).toEqual([]);
  });

  it("anchor search walks back past a newer revision where the pin does not verify", () => {
    const older = contentFile({ alpha: B }, "lf");
    const newer = contentFile({ alpha: B_EDITED }, "lf");
    const pin = pinOf(topicsFile(META), older, "alpha", "scanner", "crlf");
    const history = fixtureHistory(
      [
        { rev: "r-older", time: "2026-05-15T10:00:00.000Z", files: { [TOPICS]: topicsFile(META), [CONTENT]: older } },
        { rev: "r-newer", time: T1, files: { [TOPICS]: topicsFile(META), [CONTENT]: newer } },
        { rev: "r-after-pin", time: "2026-05-20T10:00:00.000Z", files: { [TOPICS]: topicsFile(META), [CONTENT]: older } },
      ],
      { [TOPICS]: topicsFile(META), [CONTENT]: contentFile({ alpha: B_EDITED }, "crlf") },
    );
    const f = classifyPin({ history, topicId: "alpha", pin: { translatedFromHash: pin, translatedAt: PIN_AT } });
    expect(f).toMatchObject({ verdict: "stale", cause: "content", anchorRev: "r-older" });
  });
});

// ── Guard: the real repository ──────────────────────────────────────────────

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

describe("real repository (skipped on a shallow clone)", () => {
  it.skipIf(isShallowOrNoGit())(
    "every ja pin verifies at an anchor revision (unverified === 0)",
    () => {
      const meta = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, loc("ja", "_meta.json")), "utf8"));
      const pinned = Object.keys(meta.topics).length;
      const report = classifyGuide({ history: createGitHistory(REPO_ROOT), locales: ["ja"] });
      const ja = report.locales.ja;
      const unverified = ja.stale.filter((f) => f.cause === "unverified");
      expect(unverified.map((f) => f.topicId)).toEqual([]);
      const pinnedAndCurrent = ja.fresh.length + ja.stale.length;
      expect(pinnedAndCurrent + ja.orphaned.length).toBe(pinned);
      for (const f of ja.fresh.filter((x) => x.cause !== "exact")) {
        expect(f.anchorRev, f.topicId).toMatch(/^[0-9a-f]{40}$/);
      }
    },
    60_000,
  );
});
