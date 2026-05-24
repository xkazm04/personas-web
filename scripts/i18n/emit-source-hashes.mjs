#!/usr/bin/env node
// Emit a topicId -> source-hash map for the current English guide content.
//
// Used by the orchestrator that spawns translation subagents — the hashes
// are baked into each locale's _meta.json so the drift detector
// (check-guide-translations.mjs) can detect re-translation needs later.
//
// The hash function must stay byte-identical to the one in
// check-guide-translations.mjs. If you change it here, change it there too.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function hashContent(s) {
  return crypto.createHash("sha1").update(s, "utf8").digest("hex").slice(0, 12);
}

function parseContentFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const out = {};
  const re = /"([a-z][a-z0-9-]+)":\s*`([\s\S]*?)`\s*,/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out[m[1]] = m[2];
  }
  return out;
}

function parseTopicsFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const out = {};
  const blockRe = /\{\s*id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]*(?:\\.[^"]*)*)"[\s\S]*?description:\s*\n?\s*"([^"]*(?:\\.[^"]*)*)"/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    out[m[1]] = {
      title: m[2].replace(/\\"/g, '"'),
      description: m[3].replace(/\\"/g, '"'),
    };
  }
  return out;
}

const guideContentDir = path.join(REPO_ROOT, "src", "data", "guide", "content");
const topicsFile = path.join(REPO_ROOT, "src", "data", "guide", "topics.ts");

const englishTopics = parseTopicsFile(topicsFile);
const englishContent = {};

for (const file of fs.readdirSync(guideContentDir)) {
  if (!file.endsWith(".ts") || file === "index.ts") continue;
  Object.assign(englishContent, parseContentFile(path.join(guideContentDir, file)));
}

const hashes = {};
for (const topicId of Object.keys(englishTopics)) {
  const meta = englishTopics[topicId];
  const body = englishContent[topicId] ?? "";
  hashes[topicId] = {
    hash: hashContent(JSON.stringify({ title: meta.title, description: meta.description, body })),
    title: meta.title,
    descriptionLength: meta.description.length,
    bodyLength: body.length,
  };
}

console.log(JSON.stringify({ generated: new Date().toISOString(), hashes }, null, 2));
