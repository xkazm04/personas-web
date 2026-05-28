#!/usr/bin/env node
/**
 * Apply scripts/setup-sync-db.sql against the Supabase Postgres pooler.
 *
 * Reads DATABASE_URL from .env (or the environment) — the pooler connection
 * string, the only credential that can run DDL + RLS (the anon/service-role
 * keys go through PostgREST, which is data-plane only). Idempotent: the SQL
 * uses CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS, so re-running is safe.
 *
 * Run with:  npm run db:migrate:sync
 *
 * Note: the migration contains `DO $$ ... $$` blocks and `CREATE VIEW ... WITH
 * (security_invoker = true)` (PG15+). If the transaction pooler (port 6543)
 * rejects these, point DATABASE_URL at the session pooler (5432) or the direct
 * connection for this one-off migration.
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

// Local .env first, then .env.local — same precedence Next.js uses.
loadDotEnv(join(root, ".env"));
loadDotEnv(join(root, ".env.local"));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Add it to .env (or .env.local) before running.",
  );
  process.exit(1);
}

const sqlPath = join(here, "setup-sync-db.sql");
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log(
    `Connecting to ${redact(connectionString)}\nApplying ${sqlPath} ...`,
  );
  await client.connect();
  try {
    await client.query(sql);
    console.log("Sync schema migration applied.");
  } finally {
    await client.end();
  }
}

function redact(url) {
  return url.replace(/:\/\/([^:]+):[^@]+@/, "://$1:***@");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
