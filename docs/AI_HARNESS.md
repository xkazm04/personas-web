# AI process & harness: personas-web

Turns ad-hoc prompting into a repeatable, trustworthy part of how the team ships.
New here? Start at `docs/README.md`, which gives the reading order for every doc.

## Components
- [x] Evals / golden tests for AI-generated output. The site calls no model at runtime;
      the AI output this repo owns is its skills' output, held by the contract and golden
      specs under "Skills" below. AI-authored *changes* are held to the deterministic
      suite listed under "Where things live". The agent-written guide translations are
      also graded on content, not just shape, by `src/lib/guideTranslationFidelity.test.ts`
      (see "Skills").
- [x] A versioned prompt & agent library the team reuses
- [x] Agent runbooks for recurring tasks
- [x] A review gate / Definition-of-Done for AI changes

## Where things live
- Tests and gates every change (human or agent) must pass:
  - unit: `vitest.config.ts`, `src/**/*.test.ts` (`npm run test:unit`)
  - end-to-end: `e2e/*.spec.ts` (`npm run test:e2e`; full suite nightly in CI, and a
    smoke tier on every PR by `.github/workflows/e2e-smoke.yml`, see
    `docs/testing/e2e-smoke-tier.md`)
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
    `src/lib/scopedGuidance.test.ts` fails when a path or section they cite disappears.
    `src/lib/decisionGoverns.test.ts` holds every pointer's paths
    and fails when a decision record's `**Governs:**` path sits under a pointer that does
    not cite the record
  - `scripts/apply-sql-migration.mjs`: the one connect-and-apply path for the Supabase
    migrations; `db:migrate` and `db:migrate:sync` are wrappers that name a migration, and
    a new one needs only its setup-NAME-db.sql file beside it (pinned by
    `src/lib/sqlMigrationRunner.test.ts`)
  - `scripts/CLAUDE.md`: the same kind of pointer for the gate and check scripts (the Gates
    table, the mutant specs, owner review). `src/lib/scriptsPointer.test.ts` holds its paths
    and the sections of this file it cites. `.github/` has no pointer yet: a file there is
    gate surface that an unattended lane may not add, so that one is the owner's step
  - `docs/degraded-dependencies.md`: what a visitor sees and what an operator checks when
    Supabase or the orchestrator is missing or down. `src/lib/degradationDrill.test.ts`
    runs the outage paths against the real route handlers and fails when a row of the
    runbook's table no longer matches its route
  - `docs/conventions-enforcement.md`: for each numbered convention in `.claude/CLAUDE.md`,
    the lint rule, spec or gate that catches a break, and what is left to the agent
  - `.ai/manifest.yaml` `guidance:`: declares `.claude/CLAUDE.md` the canonical guidance
    file and lists every scoped pointer. `src/lib/guidanceCanonical.test.ts` fails when the
    canonical file is missing, when a CLAUDE.md or AGENTS.md under `src/` is not declared, or
    when a pointer stops naming the canonical file or starts stating rules of its own
  - `docs/api/openapi.json`: request and response shapes of every API route, kept joined to
    the handlers by `src/lib/apiSchemaCoverage.test.ts` (paths, verbs, allowlists) and
    `src/lib/apiSchemaStatuses.test.ts` (every literal `status: NNN` a handler sends is a
    documented response on its path), and made readable by `src/lib/apiSchemaExamples.test.ts`
    (every JSON request and response body carries an `example` that satisfies its own schema)
- Proof that the gates reject: `src/lib/aiChangeGateMutants.test.ts` applies targeted
  mutations to `scripts/check-ai-change.mjs` (a flipped comparison, a dropped branch, an
  emptied pattern), imports each mutant and runs a suite of known-bad commits against it.
  Every mutant must be killed; the kill ratio is a ratchet at 1 and may not go down.
  `src/lib/agentReworkMutants.test.ts` does the same for the rework meter
  (`scripts/report-agent-rework.mjs`): dropped noise filter, inverted file overlap, an
  additive `fix:` read as a repair, a widened or shortened follow-up window, and each budget
  comparison. A gate that judges agent commits is held to the same bar: every mutant
  killed, and a survivor gets a new case in the suite, never a lower ratio
- The same ratchet on product code: each mutation spec carries its own `MIN_KILL_RATIO`,
  so the floor is per module. `src/lib/server/rateLimitMutants.test.ts` covers the limiter
  every write route goes through; `src/lib/server/requestMutants.test.ts` covers
  `src/lib/server/request.ts` (the client-IP trust ladder, the body cap at its exact
  boundary and across chunks, and the refusal shapes routes answer with). Both sit at 1.
  The auth surface has the same floor. `src/app/api/orchestrator/userSessionMutants.test.ts`
  covers the session verifier that gates the team key for the proxy and both SSE routes:
  a missing config read as verified, a refusal remembered, a 429 or 5xx taken as an answer,
  the TTL boundary, eviction, and what is sent to Auth. `src/lib/commands/pairingMutants.test.ts`
  covers the `#pair=` secret path from the pairing-link record: the null-state scrub in
  `src/lib/commands/pairing.ts`, what a pairing link must be, and the `pair=`, request-URL and
  breadcrumb passes in `src/lib/sentry-pii.ts`. Both sit at 1.
  The next candidate is `src/lib/server/json-file-store.ts`

## Gates

Every `check:*` script in `package.json` (and the `copy:check` copy gate), and where it
runs. Run the pre-push ones yourself before handing work back; the hook runs them too,
but finding a failure there costs a round trip. `src/lib/guidanceScripts.test.ts` keeps
this table honest. It fails `test:unit` when a gate is missing from this table, when a row
names a script that does not exist, or when the "Runs in" column disagrees with
`.github/workflows/ci.yml` or `scripts/install-git-hooks.mjs`. That test also fails when any
`npm run <name>` in `.claude/CLAUDE.md`, this file, `SECURITY.md`, `README.md`, CI or the
hook names a script `package.json` does not define. `src/lib/guidanceCommandForms.test.ts`
covers the forms that regex cannot see: every line of the `.claude/CLAUDE.md` Commands block
must be `npm run <existing script>` (and the block must list typecheck, lint and test:unit),
every `node scripts/<file>` cited in the guidance files must exist, and every script file a
`package.json` script runs must exist (registry links under `.claude/` excepted).

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

The four i18n gates above (coverage, encoding, ledger, guide translations) and the
hardcoded-string report are also modes of one entry point: `node scripts/i18n/check.mjs all`
runs the four gates and prints one pass/fail table, `node scripts/i18n/check.mjs <mode>`
runs one, `--list` prints them. Each mode runs its `package.json` script body, so the
command lives in one place. They stay separate scripts because they read different
inputs (decoded values, raw bytes, guide markdown, TSX), and they share one locale
selector, `listLocaleFiles` in `scripts/i18n/load-locale.mjs`. `src/lib/i18nCheckDispatcher.test.ts`
fails when an i18n check script is not a mode or the selector loses a locale.

## Skills

- **Project-owned** (`.claude/skills/icon-gen`, `.claude/skills/ui-variant-prototype`): real
  directories, committed here. Their tools call external models (Leonardo, Gemini) and
  `sharp`, which is not a dependency of this repo, so CI cannot run them. What CI holds
  instead is the prompt-to-code contract, in `src/lib/skillContracts.test.ts` (part of
  `test:unit`, next to the governance specs). It fails when:
  - a flag, sub-command or default that `SKILL.md` documents is no longer read by the tool
  - a tool exists that the prompt does not document, or the reverse
  - the Leonardo model or the default Gemini model changes (pinned)
  - the styles or the Targets sizes drift
  - an anti-noise clause or a scoring criterion drops out of icon-gen's prompts
  - the brand palette the prompt quotes no longer matches `src/styles/tokens.css`
  - a shared component, animation helper or token that ui-variant-prototype tells the
    agent to reuse is renamed away

  A new project-owned skill directory without a block in that spec fails it.
- `icon-gen` would hurt most if it silently got worse, because its output ships as the
  site's icons. That is why it is covered twice: by its contract and by its exported output.
- **Registry-owned** (everything in `.ai/manifest.yaml` `skills:`): links into
  `../ai-registry`. Golden examples for these belong with the skill in the registry, so
  every consuming repo inherits them. That is a registry follow-up and is not done here.
- `icon-gen`'s golden output is the icon set it exported into this repo:
  `src/lib/iconSetGolden.test.ts` holds `src/app/favicon.ico`, `src/app/icon.png`,
  `src/app/apple-icon.png` and the PWA icons to the sizes, formats and alpha rules in its
  `SKILL.md` "Targets", and to what `src/app/manifest.ts` declares.
- The guide translations are agent output too, written from
  `scripts/i18n/translate-guide-subagent-prompt.md`. `check:guide-content` checks that each
  topic exists and `check:guide-translations` checks its source pin, but neither reads the
  translation. `src/lib/guideTranslationFidelity.test.ts` (in `test:unit`) is the quality
  eval: it fails when a translated topic's heading outline (every heading's level, in
  order) or its set of link and image targets differs from the English. The topics that
  differ today are listed inline in the spec as a ratchet that may only shrink; one that
  matches again fails the spec until it is taken off the list.
- **Roles** (`docs/agents/roles/`): versioned specs for the tasks lanes repeat (a gate
  workflow and its shape spec, a mutation spec, a decision record, a 14-locale string
  change). A skill is a tool; a role says how to do the task, what a good result looks
  like and what to refuse. They sit outside `.claude/` so lanes can improve them.
  `src/lib/agentRoleSpecs.test.ts` holds each role's version, sections, cited files and
  `done-when` scripts, and evaluates the role's merged exemplars against the structure
  the role demands, so agent-authored output is checked for shape, not only for passing.
- Open gap: `native-copy` has no golden output (its checker lives in the registry), and
  `icon-gen`'s tools themselves are untested. The next step is to split `icon-gen`'s pure
  helpers (`parseArgs`, `hexToRgb`, `buildIco`, the tile SVGs) out of
  `tools/icon-pipeline.mjs`, which imports `sharp` and runs its CLI on import, and pin them
  with a unit test. Unattended lanes cannot write under `.claude/`, so this needs a person
  or an attended session.
- Skills that read text the team did not write: `research` (videos, articles), `native-copy`
  (copy sources) and `scan-sweep` (scan output). A source can carry instructions, so
  `src/lib/skillInjectionFixture.test.ts` holds a hostile source and the commit an agent
  would make by obeying it, and checks that `scripts/check-ai-change.mjs` refuses each
  effect: `.claude/` writes, a committed env file, a new API route and SQL file, an invented
  doc anchor, a dropped trailer (warned, failed under strict provenance). Three gaps are
  `it.todo` there: an injected `AI-Gate-Override:` line waives the path and scope checks,
  a `route.js`/`route.tsx` or upper-case `.SQL` add is not matched, and hostile wording in
  copy is content no path rule can see. Closing the first two is an edit to the gate script
  (re-run its mutant spec); the third needs review of the copy itself.

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
then, the gap above is expected. The options and a recommendation are in
[`decisions/2026-10-13-registry-skill-revision-unpinned.md`](decisions/2026-10-13-registry-skill-revision-unpinned.md).

## Boundaries

The demo dashboard stays off live data through one switch: `api` in `src/lib/api.ts`
answers from `mockApi` while the auth store's `isDemo` is set. The Supabase mirror reads
in `src/lib/supabaseApi.ts` sit outside it, so each dashboard hook that calls one checks
`isDemo` itself. `src/lib/dashboardDataBoundary.test.ts` fails `test:unit` when a file
under `src/components/dashboard/` or `src/app/dashboard/` imports the transport behind
`api` (`src/lib/desktopApi.ts`, `src/lib/orchestrator-config.ts`) or server-side code,
fetches the orchestrator proxy routes directly, calls the mirror without an `isDemo`
check, or reads the orchestrator URL outside its allowlist (which may only shrink).
The service_role boundary is held by `src/lib/serviceRoleServerOnly.test.ts`.

The layer directions are held by `src/lib/moduleBoundaries.test.ts`, which reads every
import under `src/` and fails `test:unit`, naming the edge, when:

- a module outside `src/app/` imports a route module (`src/app/` is the leaf)
- `src/lib/` imports from `src/components/` (lib is the shared base)
- an API route imports UI, a store, a hook, a context or the dashboard mock data
- a shipped locale imports the English-only `src/i18n/pending/` copy

Each rule carries an exact list of known exceptions (three guide/template helpers in
`src/lib/` and one type-only roadmap import), so the list can only shrink.

The edges around `src/lib/server/` are held by `src/lib/serverModuleBoundaries.test.ts`,
the same way and with empty exception lists today. It fails when:

- a module imports `src/lib/server/` and is not an API route, a file in that folder, or a
  module whose first line is `import "server-only"`
- `src/lib/server/` imports a route, UI, a store, a hook, a context or a demo mock
- a demo mock (`mockApi`, `mock-dashboard-data`, `mockData`, `mockAuth`) imports server
  code, `src/lib/supabase-admin.ts` or an API route

## Harness deny list

The git policy in `.claude/CLAUDE.md` says agents cannot bypass hooks or force-push,
because `.claude/settings.json` `permissions.deny` blocks them. `src/lib/harnessDeny.test.ts`
replays the forbidden commands against those patterns: `--no-verify` anywhere, and
`--force`, `--force-with-lease` and `-f` on `git push`. It also checks that a few ordinary
commands stay allowed and that the policy paragraph still names the settings file. If an
edit to the settings file lifts the guard, `test:unit` goes red.

Two commands the policy forbids are not caught by any pattern yet. They are recorded as
`it.todo` in that spec:

- `git push -f` with nothing after the flag. The pattern needs a character after `-f`.
- A plain `git push`. The policy says never push, but only the guidance stops an agent
  from running it.

Closing either one is an edit to `.claude/settings.json`, which belongs to the owner.

### Push-default drill

The never-push line in `.claude/CLAUDE.md` exists because a measurement showed that an
unattended harness session pushes and opens a draft PR when the guidance says nothing.
That is harness behaviour, and a harness release can change it silently.
`src/lib/harnessPushDrill.test.ts` reads the date the Git policy paragraph cites and fails
`test:unit` once it is older than the window below.

Re-measure window: 120 days.

To re-measure, and also on any harness upgrade:

1. In a scratch clone with a throwaway remote, remove the Git policy line and run one
   unattended session that ends in a commit. Record whether it pushed or opened a PR,
   and the harness version.
2. Put the line back and run the same session. Record whether it stopped at the commit.
3. The owner updates the cited date in `.claude/CLAUDE.md`. If step 2 pushed, the
   guidance no longer holds: add a deny pattern for a plain `git push` instead.

### Guidance policy invariants

Every session reads `.claude/CLAUDE.md` as policy before any gate runs, so a softened
prohibition would take effect before a reviewer saw it. `src/lib/guidancePolicyInvariants.test.ts`
pins the sentences that, if dropped or inverted, would widen what an agent may do:

- the git policy: never push, no force-push or pull request unless asked, and no working
  around the gate;
- the `service_role` boundary: server-only, never `NEXT_PUBLIC_`, and never read outside a
  `server-only` module (plus the matching pointers in `src/app/api/CLAUDE.md` and
  `src/lib/server/CLAUDE.md`);
- no route-path change without confirmation, and no `.env*` commit other than `.env.example`;
- the "do not work around it" clauses on the custom lint rules.

The spec also rejects softening phrasings ("may push", "skip the hooks", "may commit `.env`"
and similar) in the canonical file and the three scoped `CLAUDE.md` files, so adding a
looser sentence beside an intact one also fails `test:unit`. An owner who rewords a pinned
sentence on purpose updates the spec in the same commit.

Generating the prose and the `permissions.deny` list from one source is the owner's call,
because both live under `.claude/`. Until then, `src/lib/harnessDeny.test.ts` checks that
the two agree.

## Provenance

Agent and lane commits are identified today by their `Co-Authored-By` trailer and, for
Ascent lanes, `Ascent-Resolves:` trailers. Both are claims: nothing verifies them
cryptographically, and anyone can write them. The trailer, not the conventional type,
marks a lane commit; lane commits typed `fix:` whatever they do is a runner habit, and
[the commit-type record](decisions/2026-10-13-lane-commit-type-from-change.md) proposes
that the runner take the type from the change instead.

Policy: **flag now, fail later**. Verified provenance needs a signing key that belongs to
the lane, not to the owner:

1. Generate a lane-only SSH key and register it on GitHub as a *signing* key.
2. Have the lane commit with `gpg.format=ssh`, `user.signingkey=<lane key>` and
   `commit.gpgsign=true`.
3. Commit an `allowed_signers` file mapping the lane identity to that key, so
   `git log --show-signature` (`%G?` = `G`) can tell lane commits from human ones offline.

Only once lane commits are signed should an unsigned commit carrying an agent trailer
fail a check. Nothing here is configured yet, and the steps are the owner's to take.

**What the gate does with a dropped trailer.** `scripts/check-ai-change.mjs` reads each
commit's signature status (`git log --format=%G?`) next to its trailers and sorts it with
`classifyCommit`:

| Commit | Class | Gate |
|---|---|---|
| Carries `Co-Authored-By: Claude` or `Ascent-Resolves:` | agent | checked; a problem fails |
| No agent trailer, good signature (`G`) | verified | skipped |
| No agent trailer, anything else | unverified | checked; a problem prints as a warning |
| Unverified, subject in the lane runner's shape | unverified | as above, plus a missing-trailer problem of its own |

The last row is how a lane commit that dropped its trailer stays visible. `isLaneShaped`
reads the runner's subject template (`fix: Added ...`, a capitalised past-tense verb after
`fix:`, or a subject ending `(via Ascent)`); people write the imperative. Such a commit gets
"lane-shaped subject but no trailer" even when its diff is clean, so the PR log names it,
and `--strict-provenance` fails it. `src/lib/agentReworkHardBand.test.ts` pins the shape.

Before this, an agent commit that left out its trailer was skipped without a word. Now it
runs the same anchor, protected-path and scope checks, and the PR log names it with
"would fail with --strict-provenance". `--strict-provenance` (or
`AI_GATE_STRICT_PROVENANCE=1`) makes `gateMode` fail unverified commits like agent ones.
Turn it on in `.github/workflows/ai-change-gate.yml` once lane and owner commits are
signed. Until then it would also fail the owner's own unsigned commits to `.claude/`.
`src/lib/aiChangeProvenance.test.ts` pins both functions.

### Who reviews what

The trailers say an agent wrote a commit; `.github/CODEOWNERS` says who has to read it. It
routes the paths the agent gate guards (`.claude/`, new API routes, `.sql` files), the
guidance files declared in `.ai/manifest.yaml`, every `import "server-only"` module, the
gate scripts, CI and the build and gate configs to the owner. `src/lib/codeownersCoverage.test.ts`
fails `test:unit` when a path `scripts/check-ai-change.mjs` refuses or treats as out of scope
has no owner, when a server-only module lands outside an owned directory, or when a rule
names a path that no longer exists.

Today the file only *requests* the owner's review. To make it block loop-lane PRs on those
paths, the owner turns on "Require review from Code Owners" in the branch protection for
`master`. That is a GitHub setting, not a file, so no lane can set it.

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
that in today.

On every PR to `master`, `.github/workflows/agent-rework.yml` runs
`node scripts/report-agent-rework.mjs --list` over the default window (the last 300 commits
on the PR head; a PR-only range is too short for a 10-commit follow-up window) and turns
each `FLAG` line into a warning annotation on the PR. It annotates and stays green. It
does not block, because the meter is a heuristic. `src/lib/agentReworkCi.test.ts` pins
that wiring. The limits were chosen before anyone ran the meter against this history.
Run it once, and if the human baseline or a healthy lane sits close to a limit, move that
limit in the same commit and record the measured rates here. `budgetFlags` is pinned by
`src/lib/agentReworkBudget.test.ts`.

**Hard band.** The FLAG band advises; `HARD_REWORK_BUDGET` stops. A lane with at least 20
commits in the window whose rate is over 50%, or more than 30 points over the human rate,
is past the point where the heuristic's noise could explain it. `--block-in <pr-range>`
prints a `BLOCK` line and exits 1 for each such lane that also has a commit in the PR, so
the PR that would add to a struggling lane's record fails, and a PR from anyone else does
not. `.github/workflows/agent-rework-hard-band.yml` runs it on every PR to `master` with the
PR's own commits as the range and turns each `BLOCK` line into an error annotation. To let
a blocked lane through, narrow it as below, or have the owner move the band in the script
with the measured rates in the commit. `src/lib/agentReworkHardBand.test.ts` pins the band
and the wiring. Like the FLAG limits, the hard band was set without running the meter on
this history; the first PR run prints the rates to check it against.

A lane commit that lost its trailer is not counted as a person's: `laneOf` puts an
untrailered commit whose subject has the lane runner's shape (`isLaneShaped` in
`scripts/check-ai-change.mjs`) under `lane-untrailered`, so it neither hides from the
budget nor inflates the human baseline.

### What a lane's work cost

The rework rate says whether a lane's output holds. It does not say what each change
that held cost, and that number is what decides how far autonomy should scale. A lane
commit can declare its spend in two optional trailers, next to `Ascent-Resolves:`:

| Trailer | Value |
|---|---|
| `Ascent-Tokens: <int>` | input + output tokens for the whole cycle that produced the commit |
| `Ascent-Wall-Clock: <seconds>` | seconds from cycle start to commit (a trailing `s` is accepted) |

`node scripts/report-lane-cost.mjs [<range>] [--window N]` reads them back. It takes its
lanes, its follow-up window and its rework pairs from `scripts/report-agent-rework.mjs`,
so the two reports agree on which commit belongs to which lane and which one survived.
Per agent lane, it prints how many commits declared spend and the tokens and seconds per
*surviving* change: everything the costed commits spent, reworked ones included, divided by
the costed commits nothing reworked. A lane with no trailers prints `no cost data`, not a
zero. Human commits are left out; they carry no spend to compare.

**Review line.** `COST_REVIEW` in the script prints a `REVIEW` line for a lane with at least
10 costed commits whose surviving change costs more than 2,000,000 tokens, or where nothing
it paid for survived. It is advisory and exits 0, like the rework FLAG band, and it feeds
the same narrowing steps below. The line was set before any lane wrote the trailers. The
first run with real figures should move it in the same commit that records them here.
`src/lib/laneCost.test.ts` pins the trailer parsing, the per-survivor arithmetic and the
review line. Writing the trailers is the lane runner's job, which lives outside this
repository; until it does, every lane reads `no cost data`.

**Hard band.** `HARD_COST_BUDGET` is twice the review line on twice the evidence: over
4,000,000 tokens per surviving change, or no survivor at all, on 20 or more costed commits.
`node scripts/report-lane-cost.mjs --block-in <pr-range>` prints a `BLOCK` line and exits 1
for each lane over it that also has a commit in the range, the same contract as the rework
hard band. A lane with no cost data never blocks. An over-budget lane goes through the
narrowing steps below. `src/lib/laneCostMutants.test.ts` applies 17 mutations to the report
and both bands and must kill every one. The CI step that runs `--block-in` on a PR is the
owner's, because a lane may not edit `.github/`; its YAML and the reasoning behind the
numbers are in [the lane-spend record](decisions/2026-10-13-lane-spend-hard-band.md).

### When a lane degrades

The gates reject bad commits one at a time; this is the step for a lane whose output keeps
failing. The proposed manifest field behind it is in
[the lane-scope record](decisions/2026-10-13-lane-scope-narrowing.md).

- **Trigger.** A `FLAG` line from `node scripts/report-agent-rework.mjs` (exit 1 under
  `--strict`), the same annotation on a PR from `.github/workflows/agent-rework.yml`, or the
  `ai-change` job failing on two cycles of the same lane in a row.
- **Which lane first.** The flagged lane with the highest rework rate. `ascent` is the one
  to watch: it writes most commits, so its rate moves first and costs the most.
- **Find the folder.** `node scripts/report-agent-rework.mjs --list` prints each reworked
  pair. Group them by top directory; the narrowing targets that folder, not the whole lane.
- **Narrow, in this order.** (1) Items whose expected files fall in that folder go to a
  person. (2) If the next window still flags, the lane may touch only docs and tests.
  (3) If it still flags, the lane is paused: the owner stops dispatching it, or the runner
  calls the meter with `--strict` before a cycle and stops on exit 1.
- **Record it.** `.ai/manifest.yaml` has no lane-scope field today (`scope:` is the repo's
  product scope), so a narrowing is a dated status line in the lane-scope record until the
  owner settles the `lanes:` block it proposes.
- **Resume.** Widen one step at a time, after two consecutive meter runs with the lane
  under budget.

## One command after a change

Run `node scripts/verify.mjs` after a change, rather than picking gates from a list. It
reads the `checks` job in `.github/workflows/ci.yml` and runs its steps in the same order,
stopping at the first failure. Then it prints a pass/fail table with each step's time.
Everything before `npm run build` is the default tier: typecheck, lint, unit tests, the
i18n, sync-row and guide gates. `--full` adds the build and the bundle budget, and
`--list` prints the steps without running them. Because the list is read from CI, a
new gate there also runs here, with no second list to keep in step.
`src/lib/verifyScript.test.ts` pins the parse against the real workflow and checks that
every `npm run` it calls exists in `package.json`.

Owner follow-ups, which an unattended lane cannot make:
- Add a `verify` script to `package.json` and name it in `.claude/CLAUDE.md` "Commands" as
  the after-change command.
- Optionally, add a Claude Code `Stop` hook in `.claude/settings.json` that runs
  `node scripts/verify.mjs` so a session cannot end on a red tree. The default tier is
  minutes, not seconds, so a hook on every edit would be too slow. Stop is the right
  point.

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
   `src/lib/commitTypeAdvice.test.ts`). The type is for reviewers scanning `git log`;
   `compile:changelog` does not read it (it reads the `### Added/Changed/Fixed/Removed`
   sections of `CHANGELOG.md`). The other rules are pinned by `src/lib/aiChangeGate.test.ts`. To run the
   gate locally: `node scripts/check-ai-change.mjs origin/master..HEAD`.

### Review-quality eval
`src/lib/reviewGateEval.test.ts` runs a seeded set of known-bad commits through the gate
in the same order the script applies its rules (trailer, mode, override, problems), and
checks that each one gets the outcome it should. The set covers hallucinated anchors,
protected paths, scope creep, a lane commit that lost its trailer, and misnamed commit
types (one is the real `fix: Added ...` subject of 0a31fe05). It also holds known-good
controls and the classes the gate cannot see. The spec enforces one policy: a rule may
**block** a merge only while it catches 100% of its seeded cases with no false positive on
the controls. A rule that falls below that bar is demoted to advice, not loosened. The blind spots are written
down as cases that must pass the gate, each naming the layer that covers it instead.
Today these are a red unit test (the `checks` job), a weakened existing test (no automated
layer), hardcoded English in JSX (no automated layer) and ungated motion (the
animation-gating lint rule, rAF and canvas only). When a new rule starts to catch one of
these, move that case into the rule's class. When agents ship a new kind of mistake, add it
as a case first.
