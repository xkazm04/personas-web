# AI process & harness: personas-web

Turns ad-hoc prompting into a repeatable, trustworthy part of how the team ships.

## Components
- [ ] Evals / golden tests for AI-generated output. Not applicable as model evals:
      this site calls no model at runtime. AI-authored *changes* are instead held to
      the deterministic suite listed under "Where things live".
- [x] A versioned prompt & agent library the team reuses
- [x] Agent runbooks for recurring tasks
- [x] A review gate / Definition-of-Done for AI changes

## Where things live
- Tests and gates every change (human or agent) must pass:
  - unit: `vitest.config.ts`, `src/**/*.test.ts` (`npm run test:unit`)
  - end-to-end: `e2e/*.spec.ts` (`npm run test:e2e`; nightly in CI)
  - repo invariants: `scripts/check-*.mjs` and `scripts/i18n/`, each wired as an
    `npm run check:*` script and listed under "Gates" below
- Prompt & agent library:
  - `.claude/CLAUDE.md`: the binding repo law every agent session loads
  - `.ai/manifest.yaml` `skills:`: the shared registry skills this repo uses (linked
    from `../ai-registry`, not copied); project-owned skills are real directories under
    `.claude/skills/`
  - `.claude/rules/ai-registry-*.md`: the registry knowledge loaded into every session
    (machine-local links made by `ai-registry/scripts/link-registry.mjs`, not committed)
- Runbooks for recurring agent tasks:
  - per-skill project overlays: `.claude/<skill>/config.md` (e.g. `.claude/perfect/config.md`,
    `.claude/architect/config.md`, `.claude/scan-sweep/config.md`)
  - `docs/features/INDEX.md`: one doc per submodule, with key files and known gotchas
  - `docs/decisions/`: recorded decisions and accepted risks (see its `README.md`)
  - `docs/threat-model.md`: every API route with its caller gate, the secret it may
    touch and its governing decision, plus a checklist for a new route
  - `src/app/api/CLAUDE.md`, `src/lib/server/CLAUDE.md`: directory-scoped pointers that
    Claude Code loads when it works in those folders. Each names the threat-model sections
    and the `.claude/CLAUDE.md` convention that govern the folder and restates no rule;
    `src/lib/scopedGuidance.test.ts` fails when a path or section they cite disappears
  - `docs/conventions-enforcement.md`: for each numbered convention in `.claude/CLAUDE.md`,
    the lint rule, spec or gate that catches a break, and what is left to the agent

## Gates

Every `check:*` script in `package.json` (and the `copy:check` copy gate), and where it
runs. Run the pre-push ones yourself before handing work back; the hook runs them too,
but finding a failure there costs a round trip. `src/lib/guidanceScripts.test.ts` keeps
this table honest. It fails `test:unit` when a gate is missing from this table, when a row
names a script that does not exist, or when the "Runs in" column disagrees with
`.github/workflows/ci.yml` or `scripts/install-git-hooks.mjs`. That test also fails when any
`npm run <name>` in `.claude/CLAUDE.md`, this file, `SECURITY.md`, `README.md`, CI or the
hook names a script `package.json` does not define.

| Gate | Runs in | What it holds |
|---|---|---|
| `check:i18n-coverage` | CI, pre-push | every `en.ts` key present in all 13 locales |
| `check:i18n-encoding` | CI, pre-push | mojibake ratchet against `scripts/i18n-encoding-baseline.json` |
| `check:i18n-ledger` | CI | per-key hash pins in `docs/i18n/ui-ledger.json`; fix with `npm run i18n:ledger` |
| `check:guide-content` | CI, pre-push | every listed guide topic has content (no 404 with SEO tags) |
| `check:guide-coverage` | CI | report-only guide drift against the desktop repo |
| `check:sync-rows` | CI | Supabase row interfaces match `scripts/setup-sync-db.sql` |
| `check:bundle` | CI | per-route first-load JS against `bundle-budget.json` (after `npm run build`) |
| `copy:check` | pre-push | English copy gate (native-copy, registry link; skipped loudly when unlinked) |
| `check:guide-translations` | manual | guide translation drift; Windows only, by decision (CRLF pins) |
| `check:connectors` | manual | `src/data/connectors.ts` matches the desktop connector catalog |
| `check:use-case-corpus` | manual | `src/data/use-case-corpus.json` matches a fresh compile at the pinned desktop commit |
| `check:changelog` | manual | compiled changelog is up to date |
| `check:route-coverage` | manual | share of static app routes exercised by Playwright |
| `check:field` | manual | real-user p75 LCP/INP/CLS against `field-budget.json` (needs a Sentry export) |

The manual gates read a sibling `../personas` checkout or an exported snapshot that no
runner has, which is why they stay out of CI.

## Skills

- **Project-owned** (`.claude/skills/icon-gen`, `.claude/skills/ui-variant-prototype`): real
  directories, committed here. Their tools call external models (Leonardo, Gemini) and
  `sharp`, which is not a dependency of this repo, so nothing exercises their output in CI.
- **Registry-owned** (everything in `.ai/manifest.yaml` `skills:`): links into
  `../ai-registry`. Golden examples for these belong with the skill in the registry, so
  every consuming repo inherits them. That is a registry follow-up and is not done here.
- Open gap: no skill has golden tests yet. The first step is to split `icon-gen`'s pure
  helpers (`parseArgs`, `hexToRgb`, `buildIco`, the tile SVGs) out of
  `tools/icon-pipeline.mjs`, which imports `sharp` and runs its CLI on import, and pin them
  with a unit test. Unattended lanes cannot write under `.claude/`, so this needs a person
  or an attended session.

## What a fresh clone gets

An agent session on the owner's machine loads more than one on a fresh clone or in CI:

| Piece | Owner's machine | Fresh clone / CI |
|---|---|---|
| `.claude/CLAUDE.md`, `.claude/settings.json` | yes | yes |
| Project-owned skills (`icon-gen`, `ui-variant-prototype`) and overlays (`.claude/<skill>/config.md`) | yes | yes |
| Registry skills (`conform`, `architect`, `native-copy`, ... per `.ai/manifest.yaml`) | linked | **missing** (gitignored links) |
| Registry knowledge rules (`.claude/rules/ai-registry-*.md`) | linked | **missing** (gitignored links) |
| `copy:check` pre-push step | runs | skipped, with a warning |

To get the full contract, check out `github:xkazm04/ai-registry` next to this repo
(`../ai-registry`, per `registry.local` in `.ai/manifest.yaml`) and run
`node ../ai-registry/scripts/link-registry.mjs`. Add `--check` to verify the links without
writing them.

Open owner decision: whether the registry becomes a pinned git submodule or an installed
package, so that a clone or CI runner gets the same contract at a recorded version. Until
then, the gap above is expected.

## Provenance

Agent and lane commits are identified today by their `Co-Authored-By` trailer and, for
Ascent lanes, `Ascent-Resolves:` trailers. Both are claims: nothing verifies them
cryptographically, and anyone can write them.

Policy: **flag now, fail later**. Verified provenance needs a signing key that belongs to
the lane, not to the owner:

1. Generate a lane-only SSH key and register it on GitHub as a *signing* key.
2. Have the lane commit with `gpg.format=ssh`, `user.signingkey=<lane key>` and
   `commit.gpgsign=true`.
3. Commit an `allowed_signers` file mapping the lane identity to that key, so
   `git log --show-signature` (`%G?` = `G`) can tell lane commits from human ones offline.

Only once lane commits are signed should an unsigned commit carrying an agent trailer
fail a check. Nothing here is configured yet, and the steps are the owner's to take.

### How agent commits fared

The trailers say who wrote a commit; `scripts/report-agent-rework.mjs` reads them back to
say how it fared. Run `node scripts/report-agent-rework.mjs` (last 300 commits) or pass a
range and `--window N`. It prints, per lane (`ascent`, `skill:<name>`, `agent-other`) and
for `human` commits as the baseline, the share of commits that one of the next N commits
(default 10) reworked: a repairing `fix:` or a revert touching the same file, or a second
commit resolving the same `Ascent-Resolves:` id. An additive `fix:` ("fix: Added ...", the
lane's habit) is not counted as a repair. `--list` prints each pairing so it can be checked.

It is a meter, not a gate: it exits 0 and has no `package.json` script. Read it as a
comparison between lanes. The helpers are pinned by `src/lib/agentRework.test.ts`.

**Rework budget.** `REWORK_BUDGET` in the script sets the line a lane may not cross. A lane
with at least 10 commits in range gets a `FLAG` line when its rate is over 25%, or more
than 10 points over the human rate (the human comparison counts only when the human row
also has 10 commits or more). The budget flags; it does not pause. A flagged lane gets a
closer review of its recent work, or tasks of that kind go back to a person. `--strict`
turns any flag into exit 1, for a loop runner that wants to pause on it. Nothing wires
that in today. The limits were chosen before anyone ran the meter against this history.
Run it once, and if the human baseline or a healthy lane sits close to a limit, move that
limit in the same commit and record the measured rates here. `budgetFlags` is pinned by
`src/lib/agentReworkBudget.test.ts`.

## Review gate for AI changes
An AI-generated change is mergeable when all of the following hold:
1. The `checks` job in `.github/workflows/ci.yml` is green on the PR. It runs typecheck,
   lint (under the `--max-warnings` ceiling in `package.json`), unit tests, the i18n and
   guide gates, `next build`, and the bundle budget.
2. The pre-push hook installed by `scripts/install-git-hooks.mjs` (i18n coverage and
   encoding, guide content, English copy gate) passed locally.
3. It follows the conventions in `.claude/CLAUDE.md`: every user-facing string is translated
   in all 14 locales, motion is gated, and the commit message uses the
   `<pass-id>/<area>: ...` format with `Why` / `Risk` / `Verified` lines.
4. A new or changed API route has its row in `docs/threat-model.md` (enforced by
   `src/lib/threatModelCoverage.test.ts`).
5. The agent did not push. The owner reads the log and pushes (CLAUDE.md "Git policy").
6. The `ai-change` job in `.github/workflows/ai-change-gate.yml` is green. On every PR
   to master it runs `scripts/check-ai-change.mjs` over the PR's commits. It only checks
   the ones that carry an agent trailer (`Co-Authored-By: Claude`, `Ascent-Resolves:`)
   and fails on mistakes agents make and people rarely do:
   - **Hallucinated anchors.** A line the commit added to a `.md` file contains a
     backticked repo path, `path:line` or relative link that is not tracked, or that
     points past the end of the file.
   - **Protected paths.** A committed `.env*` other than `.env.example`, or a write under
     `.claude/`.
   - **Scope creep.** A new API `route.ts` or a new `.sql` file. Both add the backend or
     data-layer surface that `.ai/manifest.yaml` `scope.does_not` keeps out of this repo
     until the owner decides otherwise.

   A commit line `AI-Gate-Override: <reason>` waives the path and scope checks for that
   commit, and the job prints the reason. Anchors are never waived. The CLAUDE.md
   commit format is reported as advice only, because lane commits are written by the
   lane runner. So is a conventional type that misnames the change: a `fix:` whose
   subject opens with an additive verb ("Added", "Introduce", "New") is a `feat:`, and a
   `fix:`/`feat:` touching only docs, tests or CI is `docs:`/`test:`/`ci:` (pinned by
   `src/lib/commitTypeAdvice.test.ts`). The other rules are pinned by `src/lib/aiChangeGate.test.ts`. To run the
   gate locally: `node scripts/check-ai-change.mjs origin/master..HEAD`.
