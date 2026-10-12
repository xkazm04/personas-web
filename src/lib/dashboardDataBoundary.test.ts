import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The demo/live boundary of /dashboard, as a rule instead of prose.
 *
 * README and CLAUDE.md say the dashboard runs on mocks for a demo visitor and
 * reaches live data only for a signed-in account. What makes that true is one
 * switch: `api` in src/lib/api.ts reads `isDemo` from the auth store on every
 * call and answers from `mockApi` when it is set. The Supabase mirror reads
 * (`getSynced*` in src/lib/supabaseApi.ts) sit outside that switch, so each
 * hook that calls one checks `isDemo` itself.
 *
 * A dashboard file that fetches the orchestrator proxy, imports the transport
 * behind `api`, or calls the mirror without its own `isDemo` check would put a
 * demo visitor on live data paths. This spec fails `test:unit`, naming the file.
 * The service_role boundary is pinned separately by serviceRoleServerOnly.test.ts.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const ROOTS = ["src/components/dashboard", "src/app/dashboard"];

function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sources(full, out);
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = ROOTS.filter((r) => existsSync(path.join(REPO_ROOT, r)))
  .flatMap((r) => sources(path.join(REPO_ROOT, r)))
  .map((f) => ({
    rel: path.relative(REPO_ROOT, f).split(path.sep).join("/"),
    text: readFileSync(f, "utf8"),
  }));

interface Import {
  typeOnly: boolean;
  spec: string;
}

/** Static imports, multi-line ones included. */
function importsOf(text: string): Import[] {
  const out: Import[] = [];
  for (const m of text.matchAll(/^import\s+(type\s+)?[^;]*?\bfrom\s+["']([^"']+)["']/gm)) {
    out.push({ typeOnly: Boolean(m[1]), spec: m[2] });
  }
  return out;
}

/** Modules a dashboard file must not import: the transport behind `api`, and server-side code. */
const FORBIDDEN = [/lib\/desktopApi$/, /lib\/orchestrator-config$/, /lib\/supabase-admin$/, /lib\/server(\/|$)/];

/** Same-origin proxy routes that bypass the `api` switch when fetched directly. */
const PROXY_PATH = /["'`]\/api\/(orchestrator|executions|events)\b/;

/**
 * Files allowed to read NEXT_PUBLIC_ORCHESTRATOR_URL, and why. A ratchet: an
 * entry that no longer reads it fails, so the list only shrinks.
 */
const ORCHESTRATOR_URL_READERS: Record<string, string> = {
  "src/components/dashboard/views/settings/index.tsx": "displays the configured URL; shows mock://demo-data when isDemo",
};

describe("dashboard demo/live boundary", () => {
  it("scans the dashboard sources", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("imports neither the orchestrator transport nor server-only modules", () => {
    const bad = files.flatMap((f) =>
      importsOf(f.text)
        .filter((i) => !i.typeOnly && FORBIDDEN.some((re) => re.test(i.spec)))
        .map((i) => `${f.rel} -> ${i.spec}`),
    );
    expect(bad, "go through `api` from src/lib/api.ts, which answers from mockApi in demo").toEqual([]);
  });

  it("never fetches the orchestrator proxy routes directly", () => {
    expect(files.filter((f) => PROXY_PATH.test(f.text)).map((f) => f.rel)).toEqual([]);
  });

  it("guards every Supabase mirror read with isDemo", () => {
    const mirrorReaders = files.filter((f) =>
      importsOf(f.text).some((i) => !i.typeOnly && /lib\/supabaseApi$/.test(i.spec)),
    );
    expect(mirrorReaders.length).toBeGreaterThan(0);
    const unguarded = mirrorReaders.filter((f) => !/\bisDemo\b/.test(f.text)).map((f) => f.rel);
    expect(unguarded, "read isDemo from useAuthStore and serve the mock when it is set").toEqual([]);
  });

  it("reads NEXT_PUBLIC_ORCHESTRATOR_URL only where the allowlist says", () => {
    const readers = files.filter((f) => /NEXT_PUBLIC_ORCHESTRATOR_URL/.test(f.text)).map((f) => f.rel);
    expect(readers.sort()).toEqual(Object.keys(ORCHESTRATOR_URL_READERS).sort());
  });
});
