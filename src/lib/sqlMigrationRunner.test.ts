import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDotEnv, migrationSqlPath, parseDotEnv, redact } from "../../scripts/apply-sql-migration.mjs";

/**
 * Pins scripts/apply-sql-migration.mjs as the one connect-and-apply path for
 * the Supabase migrations. `db:migrate` and `db:migrate:sync` used to carry the
 * same .env loader, client setup and redaction twice; they are now wrappers
 * that name a migration. This spec fails when a wrapper grows its own pg client
 * again, and pins the helper's pure parts (no database is reached here).
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const WRAPPERS = ["scripts/run-voting-migration.mjs", "scripts/run-sync-migration.mjs"];

describe("apply-sql-migration", () => {
  it("parses .env lines: skips blanks, comments and lines without '=', strips matching quotes", () => {
    const text = ["# comment", "", "A=1", "B = \"two words\"", "C='x'", "not a pair", "D=a=b"].join("\r\n");
    expect(parseDotEnv(text)).toEqual([
      ["A", "1"],
      ["B", "two words"],
      ["C", "x"],
      ["D", "a=b"],
    ]);
  });

  it("never overrides a key that is already set, and ignores a missing file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sql-migration-"));
    const file = path.join(dir, ".env");
    fs.writeFileSync(file, "DATABASE_URL=from-file\nOTHER=x\n");
    const env = { DATABASE_URL: "from-env" } as unknown as NodeJS.ProcessEnv;
    loadDotEnv(file, env);
    loadDotEnv(path.join(dir, "missing.env"), env);
    expect(env).toEqual({ DATABASE_URL: "from-env", OTHER: "x" });
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("masks the password in the logged connection string", () => {
    expect(redact("postgresql://postgres.abc:s3cret@pooler.supabase.com:6543/postgres")).toBe(
      "postgresql://postgres.abc:***@pooler.supabase.com:6543/postgres",
    );
  });

  it("resolves a migration name to its setup SQL file, and both shipped migrations exist", () => {
    for (const name of ["voting", "sync"]) {
      const sqlPath = migrationSqlPath(name);
      expect(path.basename(sqlPath)).toBe(`setup-${name}-db.sql`);
      expect(fs.existsSync(sqlPath), sqlPath).toBe(true);
    }
  });

  it("refuses a name that is not a plain migration name", () => {
    for (const bad of ["../voting", "Voting", "", "sync.sql"]) expect(() => migrationSqlPath(bad)).toThrow();
  });

  it.each(WRAPPERS)("%s delegates to the shared runner and opens no client of its own", (rel) => {
    const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
    expect(text).toContain('from "./apply-sql-migration.mjs"');
    expect(text).not.toMatch(/from "pg"|pg\.Client|readFileSync/);
  });
});
