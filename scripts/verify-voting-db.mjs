#!/usr/bin/env node
/**
 * One-shot verification that the voting tables + policies are in place.
 * Reads DATABASE_URL the same way as run-voting-migration.mjs.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function loadDotEnv(filePath) {
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    return;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotEnv(join(root, ".env"));
loadDotEnv(join(root, ".env.local"));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const TABLES = [
  "feature_votes",
  "feature_comments",
  "feature_boosts",
  "shipped_features",
];

async function main() {
  await client.connect();
  try {
    for (const table of TABLES) {
      const { rows } = await client.query(
        `select count(*)::int as n
         from information_schema.tables
         where table_schema = 'public' and table_name = $1`,
        [table],
      );
      const exists = rows[0].n === 1;
      console.log(`table public.${table.padEnd(20)} ${exists ? "OK" : "MISSING"}`);
    }

    const policies = await client.query(
      `select tablename, policyname
       from pg_policies
       where schemaname = 'public'
         and tablename = any($1::text[])
       order by tablename, policyname`,
      [TABLES],
    );
    console.log(`\nPolicies (${policies.rowCount}):`);
    for (const row of policies.rows) {
      console.log(`  ${row.tablename.padEnd(20)} ${row.policyname}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Verification failed:", err.message);
  process.exit(1);
});
