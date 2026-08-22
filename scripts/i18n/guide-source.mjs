#!/usr/bin/env node
/**
 * Shared English guide-source reader for the translation tooling.
 *
 * This module is the SINGLE definition of "what the English source of a topic
 * is" and "how that source is hashed". It exists because the two consumers —
 *   scripts/i18n/check-guide-translations.mjs  (drift detector)
 *   scripts/i18n/emit-source-hashes.mjs        (pin emitter)
 * must agree byte-for-byte. They previously agreed by holding two hand-copied
 * duplicates in sync via a comment. Parity was enforced on the digest but NOT
 * on the extraction that feeds it, so both stayed byte-identical while both
 * were wrong: a shared truncation bug silently shortened 11 of 116 bodies.
 * Sharing the whole pipeline — extraction included — is what actually makes
 * the parity claim true.
 *
 * Zero dependencies, plain node ESM. Runs without the Next.js build, because
 * both consumers run as standalone scripts (pre-push hook / CI / ad-hoc).
 *
 * ── Body extraction ────────────────────────────────────────────────────────
 * Guide content files are plain object literals mapping topicId -> markdown
 * held in a template literal:
 *
 *     "topic-id": `
 *     ## Heading
 *     ...click \`Create Agent\`, name it...
 *     `,
 *
 * The previous extractor used a non-greedy regex:
 *
 *     /"([a-z][a-z0-9-]+)":\s*`([\s\S]*?)`\s*,/g
 *
 * `[\s\S]*?` stops at the FIRST backtick followed by optional whitespace and a
 * comma. A markdown inline code span whose closing backtick is followed by a
 * comma — `\`Create Agent\`,` — matches that terminator, so the body was cut
 * off at the first such span. The regex cannot tell a real closing delimiter
 * from an escaped backtick inside the body, because regex alternation has no
 * notion of "unescaped".
 *
 * The fix is a character scan that honours backslash escaping and terminates
 * only at a genuinely UNESCAPED backtick — the same rule the JS parser uses.
 * Verified against ground truth by evaluating the real modules: all 116 bodies
 * now match the values the app itself loads.
 *
 * ── Hash stability caveat (KNOWN, deliberately not changed here) ────────────
 * Bodies are hashed as RAW SOURCE TEXT: escape sequences stay escaped and line
 * endings are whatever is on disk. The repo has no .gitattributes, so a
 * Windows checkout (CRLF) and a Linux checkout (LF) produce DIFFERENT hashes
 * for 98 of 116 topics. The drift detector is therefore not portable across
 * platforms today, and must not be wired into a Linux CI job until that is
 * resolved. Normalising line endings here would fix portability but would
 * invalidate all 1261 stored pins at once (measured), so it needs a
 * coordinated re-pin and is left as an explicit follow-up rather than folded
 * into the truncation fix.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/** sha1 of a string — used purely as a content identity, not for security. */
export function hashContent(s) {
  return crypto.createHash("sha1").update(s, "utf8").digest("hex").slice(0, 12);
}

/**
 * Extract topicId -> raw body source from a guide content file.
 *
 * Scans to the first UNESCAPED backtick so that escaped backticks inside
 * markdown inline code spans cannot terminate the body early. After a body is
 * read, scanning resumes past its closing backtick, so markdown text can never
 * be mistaken for a key.
 *
 * @param {string} filePath
 * @returns {Record<string, string>} topicId -> raw body source
 */
export function parseContentFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const out = {};
  const keyRe = /"([a-z][a-z0-9-]+)":\s*`/g;
  let m;
  while ((m = keyRe.exec(src)) !== null) {
    const topicId = m[1];
    let i = keyRe.lastIndex;
    let body = "";
    let closed = false;
    while (i < src.length) {
      const c = src[i];
      if (c === "\\") {
        // Escaped character: consume both bytes verbatim. This is what stops
        // \` from being read as a closing delimiter.
        body += c + (src[i + 1] ?? "");
        i += 2;
        continue;
      }
      if (c === "`") {
        closed = true;
        break;
      }
      body += c;
      i += 1;
    }
    if (!closed) {
      throw new Error(
        `[guide-source] Unterminated template literal for "${topicId}" in ${filePath} — ` +
          `reached end of file without an unescaped closing backtick.`,
      );
    }
    out[topicId] = body;
    keyRe.lastIndex = i + 1;
  }
  return out;
}

/**
 * Parse topics.ts for id -> { title, description }.
 * @param {string} filePath
 */
export function parseTopicsFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const out = {};
  // Tolerate the fields appearing in any order with other fields between them.
  const blockRe =
    /\{\s*id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]*(?:\\.[^"]*)*)"[\s\S]*?description:\s*\n?\s*"([^"]*(?:\\.[^"]*)*)"/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    out[m[1]] = {
      title: m[2].replace(/\\"/g, '"'),
      description: m[3].replace(/\\"/g, '"'),
    };
  }
  return out;
}

/**
 * The canonical source-hash input for one topic. Title and description are
 * included so a metadata-only change also triggers re-translation.
 */
export function topicHashInput(meta, body) {
  return JSON.stringify({ title: meta.title, description: meta.description, body });
}

/**
 * Read the whole English guide corpus and compute per-topic source hashes.
 *
 * Asserts the instrument before reporting a result: a reader that silently
 * walks an empty corpus, or hashes an empty body for a real topic, would make
 * every locale look permanently fresh. Both are treated as broken-tool errors.
 *
 * @param {string} repoRoot
 * @returns {{ topics, bodies, hashes, stats }}
 */
export function readEnglishGuide(repoRoot) {
  const contentDir = path.join(repoRoot, "src", "data", "guide", "content");
  const topicsFile = path.join(repoRoot, "src", "data", "guide", "topics.ts");

  if (!fs.existsSync(contentDir)) {
    throw new Error(`[guide-source] Guide content directory not found: ${contentDir}`);
  }
  if (!fs.existsSync(topicsFile)) {
    throw new Error(`[guide-source] Guide topics file not found: ${topicsFile}`);
  }

  const topics = parseTopicsFile(topicsFile);
  if (Object.keys(topics).length === 0) {
    throw new Error(
      `[guide-source] Parsed ZERO topics from ${topicsFile} — the topics parser no longer ` +
        `matches the file's shape. Refusing to report on an empty corpus.`,
    );
  }

  const contentFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
  if (contentFiles.length === 0) {
    throw new Error(
      `[guide-source] No guide content files found in ${contentDir}. ` +
        `Refusing to report on an empty corpus.`,
    );
  }

  const bodies = {};
  for (const file of contentFiles) {
    Object.assign(bodies, parseContentFile(path.join(contentDir, file)));
  }

  // A topic declared in topics.ts with no extractable body would be hashed as
  // "" — a stable hash over nothing, which pins the locale to emptiness.
  const bodyless = Object.keys(topics).filter((id) => !bodies[id]);
  if (bodyless.length > 0) {
    throw new Error(
      `[guide-source] ${bodyless.length} topic(s) declared in topics.ts have no extractable ` +
        `body: ${bodyless.slice(0, 8).join(", ")}${bodyless.length > 8 ? ", ..." : ""}. ` +
        `Hashing an empty body would pin translations to nothing.`,
    );
  }

  const hashes = {};
  for (const topicId of Object.keys(topics)) {
    hashes[topicId] = hashContent(topicHashInput(topics[topicId], bodies[topicId]));
  }

  return {
    topics,
    bodies,
    hashes,
    stats: {
      contentFiles: contentFiles.length,
      topicCount: Object.keys(topics).length,
      bodyCount: Object.keys(bodies).length,
    },
  };
}
