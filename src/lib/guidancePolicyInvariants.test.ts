import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The guidance files are read as policy before any gate sees a change, so
 * the sentences that hold agents back are pinned here by their content.
 *
 * Each sentence below would widen what an agent may do if it were dropped or
 * inverted: the git policy (no push, no PR, no hook bypass), the service_role
 * boundary, the route-path and .env limits, and the "do not work around"
 * clauses on the custom lint rules. CODEOWNERS routes an edit to the owner.
 * This spec makes the edit visible as a red test as well, including one that
 * keeps a sentence but adds a softer one beside it.
 *
 * harnessDeny.test.ts holds the other half: the deny list in
 * .claude/settings.json and the policy paragraph that names it. An owner who
 * rewords a pinned sentence on purpose updates the sentence here in the same
 * commit. See docs/AI_HARNESS.md "Guidance policy invariants".
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
/** Whitespace-collapsed, so a re-wrapped paragraph still matches. */
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\s+/g, " ");

const CANONICAL = ".claude/CLAUDE.md";
const SCOPED = ["scripts/CLAUDE.md", "src/app/api/CLAUDE.md", "src/lib/server/CLAUDE.md"];

const PROHIBITIONS: Record<string, string[]> = {
  [CANONICAL]: [
    "**Commit on the current branch; never push.**",
    "Do not push, force-push, or open a pull request unless this session's prompt asks for it.",
    "do not work around it; if a gate is red, fix the tree.",
    "(`SUPABASE_SERVICE_ROLE_KEY`) is **server-only**",
    "must never carry a `NEXT_PUBLIC_` prefix.",
    "Never read `SUPABASE_SERVICE_ROLE_KEY` outside a `server-only` module, and never send it to the browser.",
    "Do **not** modify route paths under `src/app/` without confirmation",
    "Do **not** commit `.env*` files other than `.env.example`.",
    "`eslint-rules/no-low-text-opacity.js`; do not work around it.",
    "`useReducedMotionPreference`. Do not work around it.",
  ],
  "scripts/CLAUDE.md": ["the npm alias is the owner's step"],
  "src/app/api/CLAUDE.md": ["`SUPABASE_SERVICE_ROLE_KEY` is reached only through `getSupabaseAdmin()`"],
  "src/lib/server/CLAUDE.md": ["starts with `import \"server-only\"`"],
};

/** Phrasings that would grant what the policy withholds. None appear today. */
const SOFTENERS = [
  /\bmay push\b/i,
  /\bfree to push\b/i,
  /\ballowed to push\b/i,
  /\bpush is allowed\b/i,
  /\bpush when\b/i,
  /\bmay force/i,
  /\ballowed to force/i,
  /no-verify`? is (fine|ok|allowed)/i,
  /\buse `?--no-verify/i,
  /\bskip (the )?hooks\b/i,
  /\bbypass the (gate|hook)/i,
  /\bmay commit `?\.env/i,
  /\bmay read `?SUPABASE_SERVICE_ROLE_KEY/i,
  /\bopen a (draft )?pull request when\b/i,
];

describe("guidance prohibitions", () => {
  for (const [file, sentences] of Object.entries(PROHIBITIONS)) {
    it.each(sentences)(`${file} still says: %s`, (sentence) => {
      expect(read(file)).toContain(sentence);
    });
  }
});

describe("guidance softeners", () => {
  it.each([CANONICAL, ...SCOPED])("%s grants nothing the policy withholds", (file) => {
    const text = read(file);
    const found = SOFTENERS.filter((re) => re.test(text)).map(String);
    expect(found).toEqual([]);
  });
});
