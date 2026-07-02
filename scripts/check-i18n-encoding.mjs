#!/usr/bin/env node
/**
 * check-i18n-encoding — mojibake ratchet for src/i18n/*.ts.
 *
 * History: locale files have repeatedly been corrupted by editors/tools that
 * read UTF-8 as cp1250/cp1252 and saved the result (e.g. "—" → "â€”",
 * "ě" → "Ä›", Cyrillic → "Đ¾Đ´..."). Commit 5a57d9b even RE-corrupted four
 * locales that had already been repaired. tsc enforces key parity but cannot
 * see this, so the guard lives here and runs on pre-push.
 *
 * Detection: a "UTF-8 lead-byte look-alike" character immediately followed by
 * a "UTF-8 continuation-byte look-alike" (cp1252/cp1250 C1-controls range and
 * Latin-1 punctuation), plus the U+FFFD replacement character. Legit Latin
 * diacritics, CJK, Cyrillic, Arabic, and \uXXXX escapes never match.
 *
 * Ratchet semantics (baseline: scripts/i18n-encoding-baseline.json):
 *   - en.ts must always be at ZERO — it ships to production.
 *   - any other file may not EXCEED its baseline count (new corruption fails;
 *     existing known corruption is tracked until the repair pass lands).
 *   - counts below baseline print a reminder to tighten the ratchet.
 *   - node scripts/check-i18n-encoding.mjs --update-baseline  → rewrite the
 *     baseline to current counts (use only after an intentional repair).
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const I18N_DIR = path.join(process.cwd(), "src", "i18n");
const BASELINE_PATH = path.join(process.cwd(), "scripts", "i18n-encoding-baseline.json");

// UTF-8 lead bytes (0xC2-0xDF, 0xE0-0xEF) rendered through cp1252/cp1250.
const LEAD =
  "ÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþ" +
  "ĂĹĎĐĚŃŇŐŔŘŚŞŤŮŰŹŻŽăĺďđěńňőŕřśşťůűźżž";
// UTF-8 continuation bytes (0x80-0xBF) rendered through cp1252/cp1250.
const CONT =
  "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ" +
  " ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿" +
  "ˇ˘Łł˝";
const escapeCls = (s) => s.replace(/[\\\]^-]/g, "\\$&");
const MOJIBAKE = new RegExp(`[${escapeCls(LEAD)}][${escapeCls(CONT)}]|�`, "g");

const updateBaseline = process.argv.includes("--update-baseline");

const files = fs
  .readdirSync(I18N_DIR)
  .filter((f) => /^[a-z]{2}\.ts$/.test(f))
  .sort();

const counts = {};
const samples = {};
for (const f of files) {
  const text = fs.readFileSync(path.join(I18N_DIR, f), "utf8");
  const lines = text.split("\n");
  let n = 0;
  const hits = [];
  lines.forEach((line, i) => {
    const m = line.match(MOJIBAKE);
    if (m) {
      n += m.length;
      if (hits.length < 3) hits.push(`  ${f}:${i + 1}  ${line.trim().slice(0, 100)}`);
    }
  });
  counts[f] = n;
  samples[f] = hits;
}

if (updateBaseline) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(counts, null, 2) + "\n");
  console.log(`[i18n-encoding] baseline updated: ${BASELINE_PATH}`);
  process.exit(0);
}

const baseline = fs.existsSync(BASELINE_PATH)
  ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"))
  : {};

let failed = false;
let improved = false;
for (const f of files) {
  const now = counts[f];
  const base = baseline[f] ?? 0;
  if (f === "en.ts" && now > 0) {
    failed = true;
    console.error(`[i18n-encoding] FAIL ${f}: ${now} mojibake sequence(s) — en.ts ships to production and must be clean:`);
    for (const s of samples[f]) console.error(s);
  } else if (now > base) {
    failed = true;
    console.error(`[i18n-encoding] FAIL ${f}: ${now} mojibake sequence(s) (baseline ${base}) — an editor/tool re-corrupted this file. Fix the encoding before pushing:`);
    for (const s of samples[f]) console.error(s);
  } else if (now < base) {
    improved = true;
  }
}

if (failed) {
  console.error("[i18n-encoding] See scripts/check-i18n-encoding.mjs header for repair notes.");
  process.exit(1);
}
if (improved) {
  console.log("[i18n-encoding] Counts dropped below baseline — tighten the ratchet with: node scripts/check-i18n-encoding.mjs --update-baseline");
}
const dirty = files.filter((f) => counts[f] > 0);
console.log(
  dirty.length === 0
    ? `[i18n-encoding] OK — all ${files.length} locale files clean`
    : `[i18n-encoding] OK — no new corruption (${dirty.length} file(s) still carry known baseline debt: ${dirty.map((f) => `${f}=${counts[f]}`).join(", ")})`,
);
