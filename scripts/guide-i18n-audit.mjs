#!/usr/bin/env node
/**
 * Guide i18n completeness audit (parity-backlog stream 2, item G-1).
 *
 * For each of the 13 non-en locales, diffs:
 *   - locales/<lang>/topics.ts        vs  src/data/guide/topics.ts   (title/description keys)
 *   - locales/<lang>/content/<cat>.ts vs  src/data/guide/content/<cat>.ts (body keys)
 *
 * Emits a per-locale gap report and a machine-readable JSON summary so the
 * translation fan-out can be sized and scoped exactly.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GUIDE = join(ROOT, "src", "data", "guide");

const LOCALES = ["ar", "bn", "cs", "de", "es", "fr", "hi", "id", "ja", "ko", "ru", "vi", "zh"];

// ── Canonical English: id -> categoryId, and category -> [ids] ──────────────
const topicsSrc = readFileSync(join(GUIDE, "topics.ts"), "utf8");
const idCat = [];
const reTopic = /id:\s*"([^"]+)",\s*categoryId:\s*"([^"]+)"/g;
let m;
while ((m = reTopic.exec(topicsSrc)) !== null) idCat.push({ id: m[1], categoryId: m[2] });

const allIds = idCat.map((t) => t.id);
const byCategory = {};
for (const { id, categoryId } of idCat) (byCategory[categoryId] ??= []).push(id);
const categories = Object.keys(byCategory);

// Which English content files actually exist + which ids they define.
const enContentIds = {};
for (const cat of categories) {
  const f = join(GUIDE, "content", `${cat}.ts`);
  enContentIds[cat] = existsSync(f) ? keysIn(readFileSync(f, "utf8"), byCategory[cat]) : [];
}

// Extract which of the candidate ids appear as top-level keys in a file.
// Restricting to known ids avoids false positives from markdown bodies.
function keysIn(src, candidateIds) {
  return candidateIds.filter((id) => {
    const re = new RegExp(`(^|\\n)\\s{2,4}"${escapeRe(id)}"\\s*:`, "");
    return re.test(src);
  });
}
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

console.log(`\n=== Guide i18n audit ===`);
console.log(`English: ${allIds.length} topic ids across ${categories.length} categories`);
console.log(`Categories: ${categories.join(", ")}\n`);

const summary = { en: { totalIds: allIds.length, categories: byCategory }, locales: {} };

for (const lang of LOCALES) {
  const dir = join(GUIDE, "locales", lang);
  const topicsFile = join(dir, "topics.ts");
  const haveTitleKeys = existsSync(topicsFile) ? keysIn(readFileSync(topicsFile, "utf8"), allIds) : [];
  const missingTitles = allIds.filter((id) => !haveTitleKeys.includes(id));

  const missingBodies = {};
  const missingContentFiles = [];
  let bodyHave = 0;
  let bodyTotal = 0;
  for (const cat of categories) {
    const enIds = enContentIds[cat];
    bodyTotal += enIds.length;
    const f = join(dir, "content", `${cat}.ts`);
    if (!existsSync(f)) {
      missingContentFiles.push(cat);
      missingBodies[cat] = [...enIds];
      continue;
    }
    const have = keysIn(readFileSync(f, "utf8"), enIds);
    bodyHave += have.length;
    const miss = enIds.filter((id) => !have.includes(id));
    if (miss.length) missingBodies[cat] = miss;
  }

  const totalMissingBodies = Object.values(missingBodies).reduce((a, b) => a + b.length, 0);
  summary.locales[lang] = {
    titles: { have: haveTitleKeys.length, missing: missingTitles },
    bodies: { have: bodyHave, total: bodyTotal, missingFiles: missingContentFiles, missing: missingBodies },
  };

  console.log(`── ${lang} ──`);
  console.log(`  titles/desc: ${haveTitleKeys.length}/${allIds.length}` + (missingTitles.length ? `  MISSING: ${missingTitles.join(", ")}` : "  ✓"));
  console.log(`  bodies:      ${bodyHave}/${bodyTotal}` + (totalMissingBodies ? `  MISSING ${totalMissingBodies}` : "  ✓"));
  if (missingContentFiles.length) console.log(`  MISSING content files: ${missingContentFiles.join(", ")}`);
  for (const [cat, ids] of Object.entries(missingBodies)) {
    if (ids.length) console.log(`    ${cat}: ${ids.join(", ")}`);
  }
  console.log("");
}

// Aggregate totals
let totalMissingTitles = 0;
let totalMissingBodies = 0;
for (const lang of LOCALES) {
  totalMissingTitles += summary.locales[lang].titles.missing.length;
  totalMissingBodies += Object.values(summary.locales[lang].bodies.missing).reduce((a, b) => a + b.length, 0);
}
console.log(`=== TOTALS across 13 locales ===`);
console.log(`  missing title/desc entries: ${totalMissingTitles}`);
console.log(`  missing body entries:       ${totalMissingBodies}`);

writeFileSync(join(__dirname, "guide-i18n-audit.json"), JSON.stringify(summary, null, 2));
console.log(`\nWrote scripts/guide-i18n-audit.json`);
