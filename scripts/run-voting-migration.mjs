#!/usr/bin/env node
/**
 * Apply scripts/setup-voting-db.sql, then scripts/harden-voting-rls.sql,
 * against the Supabase Postgres pooler.
 *
 * Reads DATABASE_URL from .env (or the environment). Both files use
 * CREATE ... IF NOT EXISTS / DROP POLICY IF EXISTS, and harden always runs
 * last, so a re-run leaves the anon role with no write on the voting tables.
 * Set SUPABASE_SERVICE_ROLE_KEY in the deployment first: the API writes these
 * tables with the service-role client, and an anon-key fallback can no longer
 * write them. The connect-and-apply logic is `scripts/apply-sql-migration.mjs`.
 *
 * Run with:  npm run db:migrate
 */

import { runMigrationCli } from "./apply-sql-migration.mjs";

runMigrationCli({ name: "voting", then: ["harden-voting-rls.sql"] });
