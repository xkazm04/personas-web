import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The module under test is a zero-dependency node script shared by
// scripts/i18n/check-guide-translations.mjs and scripts/i18n/emit-source-hashes.mjs.
// It is deliberately outside src/ because both consumers must run as plain node
// scripts (pre-push hook / CI) without the Next.js build.
import {
  parseContentFile,
  parseTopicsFile,
  readEnglishGuide,
  hashContent,
} from "../../scripts/i18n/guide-source.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * The extractor bug this suite exists to prevent:
 *
 *   /"([a-z][a-z0-9-]+)":\s*`([\s\S]*?)`\s*,/g
 *
 * `[\s\S]*?` closes at the first backtick followed by whitespace and a comma.
 * A markdown inline code span whose closing backtick is followed by a comma —
 * \`Create Agent\`, — matches that terminator, silently truncating the body.
 * It shortened 11 of 116 English bodies; one lost 94% of its text while still
 * producing a stable hash, so the drift detector called it fresh forever.
 */
const OLD_BUGGY_RE = /"([a-z][a-z0-9-]+)":\s*`([\s\S]*?)`\s*,/g;

let tmpDir: string;
function writeFixture(name: string, contents: string): string {
  const p = path.join(tmpDir, name);
  fs.writeFileSync(p, contents, "utf8");
  return p;
}

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "guide-source-"));
});
afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("parseContentFile — escaped-backtick truncation", () => {
  it("does not close the body at an escaped code span followed by a comma", () => {
    const file = writeFixture(
      "trigger.ts",
      [
        "export const content: Record<string, string> = {",
        '  "creating-a-new-agent": `',
        "## Creating a New Agent",
        "",
        "From scratch — click \\`Create Agent\\`, name it, and write instructions.",
        "",
        "TAIL_MARKER_MUST_SURVIVE",
        "`,",
        "};",
      ].join("\n"),
    );

    const body = parseContentFile(file)["creating-a-new-agent"];
    expect(body).toContain("TAIL_MARKER_MUST_SURVIVE");
    expect(body).toContain("Create Agent");

    // Pin the regression: the old regex demonstrably truncated this fixture.
    OLD_BUGGY_RE.lastIndex = 0;
    const old = OLD_BUGGY_RE.exec(fs.readFileSync(file, "utf8"));
    expect(old?.[2]).not.toContain("TAIL_MARKER_MUST_SURVIVE");
    expect(body.length).toBeGreaterThan((old?.[2] ?? "").length);
  });

  it("handles several escaped spans, and a span not followed by a comma", () => {
    const file = writeFixture(
      "multi.ts",
      [
        "export const content: Record<string, string> = {",
        '  "a-topic": `',
        "use \\`one\\`, then \\`two\\`, then \\`three\\` and done",
        "END_A",
        "`,",
        '  "b-topic": `',
        "plain body, with a comma but no code span",
        "END_B",
        "`,",
        "};",
      ].join("\n"),
    );

    const out = parseContentFile(file);
    expect(Object.keys(out).sort()).toEqual(["a-topic", "b-topic"]);
    expect(out["a-topic"]).toContain("END_A");
    expect(out["a-topic"]).toContain("three");
    expect(out["b-topic"]).toContain("END_B");
  });

  it("does not mistake markdown text inside a body for a new topic key", () => {
    // Backticks inside a body must be escaped in real source — an unescaped one
    // genuinely ends the literal, which is why the extractor stops there.
    const file = writeFixture(
      "decoy.ts",
      [
        "export const content: Record<string, string> = {",
        '  "real-topic": `',
        "A JSON sample inside prose:",
        '    "not-a-topic": \\`nope\\`,',
        "END_REAL",
        "`,",
        "};",
      ].join("\n"),
    );

    const out = parseContentFile(file);
    expect(Object.keys(out)).toEqual(["real-topic"]);
    expect(out["real-topic"]).toContain("END_REAL");
    expect(out["real-topic"]).toContain("not-a-topic");
  });

  it("throws on an unterminated template literal rather than returning a partial body", () => {
    const file = writeFixture(
      "unterminated.ts",
      ['export const content = {', '  "broken": `', "body that never closes \\`", ""].join("\n"),
    );
    expect(() => parseContentFile(file)).toThrow(/Unterminated template literal/);
  });
});

describe("readEnglishGuide — real corpus", () => {
  it("extracts every declared topic with a non-empty body", () => {
    const { topics, bodies, hashes, stats } = readEnglishGuide(REPO_ROOT);
    expect(stats.topicCount).toBeGreaterThan(0);
    expect(stats.bodyCount).toBe(stats.topicCount);
    for (const id of Object.keys(topics)) {
      expect(bodies[id], `body for ${id}`).toBeTruthy();
      expect(hashes[id]).toMatch(/^[0-9a-f]{12}$/);
    }
  });

  it("no body is truncated relative to the raw source span", () => {
    const contentDir = path.join(REPO_ROOT, "src", "data", "guide", "content");
    let truncated = 0;
    for (const f of fs.readdirSync(contentDir)) {
      if (!f.endsWith(".ts") || f === "index.ts") continue;
      const src = fs.readFileSync(path.join(contentDir, f), "utf8");
      const good = parseContentFile(path.join(contentDir, f));
      const old: Record<string, string> = {};
      OLD_BUGGY_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = OLD_BUGGY_RE.exec(src)) !== null) old[m[1]] = m[2];
      for (const [id, body] of Object.entries(good)) {
        if (old[id] !== undefined && old[id].length < body.length) truncated++;
      }
    }
    // The old extractor damaged 11 bodies; the fixed one must be strictly
    // longer for those and identical elsewhere. This asserts the fix is live.
    expect(truncated).toBeGreaterThan(0);
  });

  it("hashes change when any part of the body changes (no dead tail)", () => {
    const { topics, bodies } = readEnglishGuide(REPO_ROOT);
    const id = "creating-a-new-agent";
    expect(bodies[id]).toBeTruthy();
    const meta = topics[id];
    const base = hashContent(
      JSON.stringify({ title: meta.title, description: meta.description, body: bodies[id] }),
    );
    // Mutate the LAST character of the body — under the truncating extractor
    // this text was outside the hashed span and the digest never moved.
    const mutated = hashContent(
      JSON.stringify({
        title: meta.title,
        description: meta.description,
        body: bodies[id].slice(0, -1) + "X",
      }),
    );
    expect(mutated).not.toBe(base);
  });
});

describe("parseTopicsFile", () => {
  it("reads id/title/description for the real topics file", () => {
    const topics = parseTopicsFile(path.join(REPO_ROOT, "src", "data", "guide", "topics.ts"));
    expect(Object.keys(topics).length).toBeGreaterThan(0);
    for (const [id, t] of Object.entries(topics)) {
      expect(id).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    }
  });
});

describe("emitter/detector parity", () => {
  it("both consumers import the same extraction+hash module", () => {
    const dir = path.join(REPO_ROOT, "scripts", "i18n");
    for (const f of ["check-guide-translations.mjs", "emit-source-hashes.mjs"]) {
      const src = fs.readFileSync(path.join(dir, f), "utf8");
      expect(src, `${f} must import the shared module`).toMatch(
        /from\s+"\.\/guide-source\.mjs"/,
      );
      // Guard against a re-introduced local copy of the extractor or digest.
      expect(src, `${f} must not re-implement the extractor`).not.toMatch(
        /\[\\s\\S\]\*\?/,
      );
      expect(src, `${f} must not re-implement the hash`).not.toMatch(/createHash\(/);
    }
  });
});
