#!/usr/bin/env node
/**
 * Apply one `scripts/setup-<name>-db.sql` file against the Supabase Postgres pooler.
 *
 * The one connect-and-apply path for every migration: `run-voting-migration.mjs`
 * (`npm run db:migrate`) and `run-sync-migration.mjs` (`npm run db:migrate:sync`)
 * are thin wrappers over `runMigrationCli`. A new migration needs only its
 * `setup-<name>-db.sql` file; run it with
 *
 *   node scripts/apply-sql-migration.mjs <name>
 *
 * Reads DATABASE_URL from .env / .env.local (or the environment): the pooler
 * connection string, the only credential that can run DDL + RLS (the anon and
 * service-role keys go through PostgREST, which is data-plane only). The SQL
 * files are idempotent (CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS),
 * so re-running is safe.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import process from "node:process";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

/** `KEY=value` pairs of a .env file, in order; blank lines, comments and lines without `=` are skipped. */
export function parseDotEnv(text) {
  const entries = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    entries.push([key, value]);
  }
  return entries;
}

/** Copy a .env file into `env` without overriding a key that is already set. A missing file is not an error. */
export function loadDotEnv(filePath, env = process.env) {
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    return;
  }
  for (const [key, value] of parseDotEnv(text)) {
    if (env[key] === undefined) env[key] = value;
  }
}

/** The connection string with its password masked, for the log line. */
export function redact(url) {
  return url.replace(/:\/\/([^:]+):[^@]+@/, "://$1:***@");
}

/** `scripts/setup-<name>-db.sql` for a migration name; refuses anything that is not a plain lowercase name. */
export function migrationSqlPath(name) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error(`Not a migration name: ${JSON.stringify(name)} (expected e.g. "voting" or "sync").`);
  }
  return join(here, `setup-${name}-db.sql`);
}

/**
 * The files a migration applies, in order: its setup file, then each `then` file
 * (a plain `scripts/<file>.sql` name), so a hardening step that must follow the
 * setup cannot be skipped by a re-run that applies the setup alone.
 */
export function migrationSqlPaths(name, then = []) {
  const followUps = then.map((file) => {
    if (!/^[a-z][a-z0-9-]*\.sql$/.test(file)) {
      throw new Error(`Not a migration file: ${JSON.stringify(file)} (expected e.g. "harden-voting-rls.sql").`);
    }
    return join(here, file);
  });
  return [migrationSqlPath(name), ...followUps];
}

/** Load .env then .env.local (the precedence Next.js uses), connect, and apply the named migration. */
export async function runMigrationCli({ name, label = "Migration", then = [] }) {
  loadDotEnv(join(root, ".env"));
  loadDotEnv(join(root, ".env.local"));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Add it to .env (or .env.local) before running.");
    process.exit(1);
  }

  try {
    const sqlPaths = migrationSqlPaths(name, then);
    const sqls = sqlPaths.map((sqlPath) => readFileSync(sqlPath, "utf8"));
    const { default: pg } = await import("pg");
    const client = new pg.Client({
      connectionString,
      // pooler.supabase.com presents a valid certificate but pg defaults to
      // verifying against a CA bundle that on Windows often misses the root
      // — use the relaxed config Supabase recommends for non-prepared client
      // connections through the transaction pooler.
      ssl: { rejectUnauthorized: false },
    });
    console.log(`Connecting to ${redact(connectionString)}`);
    await client.connect();
    try {
      for (const [i, sqlPath] of sqlPaths.entries()) {
        console.log(`Applying ${sqlPath} ...`);
        await client.query(sqls[i]);
      }
      console.log(`${label} applied.`);
    } finally {
      await client.end();
    }
  } catch (err) {
    console.error("Migration failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const name = process.argv[2];
  if (!name) {
    console.error("Usage: node scripts/apply-sql-migration.mjs <name>   (applies scripts/setup-<name>-db.sql)");
    process.exit(1);
  }
  runMigrationCli({ name });
}
