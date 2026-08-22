#!/usr/bin/env node
// Emit a topicId -> source-hash map for the current English guide content.
//
// Used by the orchestrator that spawns translation subagents — the hashes
// are baked into each locale's _meta.json so the drift detector
// (check-guide-translations.mjs) can detect re-translation needs later.
//
// Extraction AND hashing come from ./guide-source.mjs, which is shared
// verbatim with check-guide-translations.mjs. That shared module replaces the
// hand-copied duplicates the two scripts used to keep in sync by comment:
// the digests matched, but the body extraction they fed was identically wrong
// (a non-greedy regex truncated any body containing an escaped code span
// followed by a comma). Import the module — never re-implement it here.

import { readEnglishGuide } from "./guide-source.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const { topics, bodies, hashes, stats } = readEnglishGuide(REPO_ROOT);

const out = {};
for (const topicId of Object.keys(topics)) {
  out[topicId] = {
    hash: hashes[topicId],
    title: topics[topicId].title,
    descriptionLength: topics[topicId].description.length,
    bodyLength: bodies[topicId].length,
  };
}

console.log(
  JSON.stringify({ generated: new Date().toISOString(), source: stats, hashes: out }, null, 2),
);
