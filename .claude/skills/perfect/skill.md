---
name: perfect
description: Session-after-session product perfection loop for personas-web. The strongest available model (Fable) directs — it walks the repo's context map context-by-context, proposes 5 challenged, high-value directions per context (features, design elevations, significant optimizations), gates them with the user until 10 are accepted, then orchestrates one Opus builder subagent per context in isolated worktrees while making every review/merge decision itself. All state lives in a linked Obsidian vault so any future session resumes the loop exactly where the last one stopped. Invoke with `/perfect [init|propose|build|status|reflect] [context-name]`.
---

# Perfect — the direction-and-delivery loop (personas-web)

> One model is best at *judgment* — seeing what would make a product excellent, challenging its own ideas, reviewing diffs ruthlessly. Cheaper strong models are great at *execution* inside a well-scoped brief. `/perfect` wires the two together in a permanent loop: **Fable directs, Opus builds, the vault remembers.** Each session moves the product measurably closer to the best UX, architecture, and feature quality it can have; no session ever starts from zero.

## Roles — Director and Builders

- **Director (the main session — Fable, or the strongest model available).** Owns everything that is judgment: opportunity-scoring contexts, drafting directions, adversarially challenging them before the user ever sees them, running the acceptance gate, writing builder briefs, answering builders' product questions mid-flight, reviewing every diff, deciding merge/redo/drop, running the repo gates, committing, and writing the vault. The Director **never delegates a decision** to a builder and never rubber-stamps a builder's diff.
- **Builders (Opus subagents, `model: "opus"`, one per context).** Each receives a tight brief (direction specs + acceptance criteria + the context's `filePaths` scope + repo-convention digest) and implements in its **own worktree**. Builders return a structured report; when they hit a genuine product ambiguity they **return the question instead of guessing** — the Director answers via `SendMessage` and the builder continues.
- **Scouts (Explore subagents, cheap).** Produce the per-context current-state brief the Director synthesizes directions from. Never used for judgment.

## The Obsidian vault — durable loop state

Resolve the vault root (first hit wins), then use `$VAULT/PerfectWeb/` (namespaced —
`Perfect/` in the same vault belongs to the desktop repo's loop; never write there):

```bash
for v in "C:/Users/kazda/Documents/Obsidian/personas" "C:/Users/mkdol/Documents/Obsidian/personas"; do
  [ -d "$v" ] && VAULT="$v" && break
done
# Portable fallback: if no Obsidian vault exists, use <repo>/.perfect/ (same schema — still an Obsidian-openable folder).
```

```
PerfectWeb/
  Perfect.md               # HOME / Map-of-Content — always reflects current truth:
                           #   mission, the scored context QUEUE with the CURSOR,
                           #   the ACCEPTED POOL (n/10), shipped ledger headline, link to last session
  config.md                # per-repo overlay: gates to run, worktree recipe, wave size,
                           #   direction sizing rules, cooldown, ## User taste, + ## Skill improvement log
  contexts/<name>.md       # one per context-map context (long-lived, updated in place)
  directions/<slug>.md     # one per direction (long-lived; the atom of the whole loop)
  sessions/<YYYY-MM-DD[-n]>.md  # immutable run records, each ends with a `next:` pointer
```

**Context note** (`contexts/<name>.md`):
```markdown
---
name: <context-map name>        type: perfect/context
group: <group>                  category: ui|api|lib|data|config|test
opportunity: <0-10>             # value reach × headroom × strategic fit (Director's judgment)
last_proposed: <YYYY-MM-DD|never>   cooldown_until: <date|—>
directions: ["[[<slug>]]", …]
---
## Current state   (scout brief digest + file:line evidence — refreshed each proposal pass)
## Direction history   (proposed / accepted / REJECTED-and-why — rejections are memory too)
## Shipped   (direction → commit SHA → observed effect)
```

**Direction note** (`directions/<slug>.md`):
```markdown
---
slug: <kebab, stable>           type: perfect/direction
context: "[[<context-name>]]"   lens: feature|ux|optimization|robustness|wildcard
status: proposed | accepted | building | shipped | failed | dropped | rejected
size: S|M|L                     # must fit ONE builder session (≲15 files, no cross-context schema break)
proposed: <date>  accepted: <date|—>  shipped: <date|—>  commit: <sha|—>
---
## What & why   (the user value, one paragraph, no fluff)
## Evidence   (file:line of the gap/opportunity in today's code)
## Acceptance criteria   (3-6 checkable bullets — the builder's contract AND the review checklist)
## Risks / non-goals
## Build record   (builder report digest, review verdict, gate results — filled during build)
```

**Session note**: phases run, contexts covered, accept/reject tallies, build outcomes with SHAs, deltas, and **`next: <the exact resumption instruction for the following session>`**.

Vault hygiene: slugs are stable; **update notes, never duplicate**. Subagents may fail to write files in some harnesses — after any parallel phase the Director MUST `ls` the target dir and **backfill missing notes from the agents' returned content** before trusting "written".

## The loop — a vault-driven state machine

Every invocation starts the same way; the vault decides which phase runs.

### Phase 0 — Recall & register
1. Read `Perfect.md` (+ last session's `next:` pointer). If missing → run **init** (below).
2. Read `context-map.json`; diff against `contexts/*` — new contexts get notes + a queue slot, removed ones get archived (`status: retired` in frontmatter).
3. Repo rituals: scan MEMORY.md signals that veto or steer directions (e.g. "already polished — verify before upgrading", marketing-stream descopes). If `.claude/active-runs.md` exists, surface overlaps and append this session's entry; otherwise skip.
4. Announce the resumption point in one sentence, then go where the state machine points: pool < 10 → **Propose**; pool ≥ 10 (or user said `build`) → **Build**.

### Init (first run only)
1. Scaffold the vault tree + `config.md` (record: gates = `npm run typecheck`, `npm run lint`, `npm run test:unit`, plus `npm run check:i18n-encoding` when any `src/i18n/*` file is touched; `npm run build` before ending a build session; wave size = 3; cooldown = 2 rounds).
2. Score every context 0-10 for **opportunity** = user-facing reach × headroom (distance from "perfect", judged from context-map metadata, `docs/features/*`, and memory) × strategic fit (active arcs in memory — e.g. web/desktop parity, live-roadmap contract). Write the ranked **queue** into `Perfect.md` with the cursor at the top. Don't deep-read code yet — scoring is refined per-context at proposal time. Remember the "already polished" memory: this repo over-reports gaps at a distance; score headroom conservatively for showcase/motion contexts.
3. Write session note; proceed straight into Propose.

### Phase P — Propose (context by context, until the pool holds 10)
Loop while `pool < 10` and the user hasn't said stop:

1. **Cursor** = highest-opportunity context not on cooldown. **Prefetch**: before presenting context *k*, launch the scout for context *k+1* in the background.
2. **Scout** (Explore, "very thorough", read-only): given the context's `filePaths` and its `docs/features/*` doc → return a current-state brief: what exists, what's rough, dead ends, UX seams, perf smells, with `file:line` evidence. The feature doc's "Conventions & gotchas" section is pre-scouted evidence — feed it to the scout and have them verify it still holds.
3. **Draft 5 directions** — one per lens by default: **feature** (new user value), **ux** (design/flow elevation), **optimization** (perf/cost/significant simplification), **robustness** (failure modes, observability, architecture), **wildcard** (the non-obvious idea a great PM would pitch). Each sized to ONE builder session; a bigger vision ships as its phase-1 slice.
   **Weight the slate by `config.md → ## User taste`** — the lens spread is a starting point, not a quota. This repo is a marketing site + demo dashboard: the "engine" here is often the demo-data realism, the motion system, information architecture, and page performance rather than backend algorithms. For contexts with real logic (voting API, orchestrator client, i18n plumbing, search index), most directions should be substance-level; for pure showcase contexts, lean on the user's recorded taste: **illustration-first "wow" design** — art as the whole component, metric expressed through the medium — not plain bars and generic cards.
4. **Challenge before presenting** (the Director argues against itself; a direction that fails any check is replaced, not presented):
   - Does it already exist in code? (scout evidence, not assumption — this repo is *already polished*; verify the actual component)
   - Was it already proposed/rejected/shipped? (check `contexts/<name>.md` history + memory)
   - Does it conflict with an active arc or a "descoped, don't re-suggest" memory (e.g. Stream-1 i18n descope)?
   - Is the value claim concrete — can I name the user moment it improves?
   - Can one Opus session genuinely ship it behind the acceptance criteria (i18n hand-translation into 13 locales included)?
5. **Present** the 5 in chat — numbered, each: title · lens · size · one-paragraph why · evidence · acceptance criteria. Then gate with **AskUserQuestion (multiSelect)** — the tool caps options at 4 per question, so use TWO questions in one call: Q1 = directions 1–3, Q2 = directions 4–5 (labels = `N · short title`, description = one-line value claim + size). The user can annotate via "Other" (e.g. `edit 2: …`, `stop`); selecting nothing in both = none accepted.
6. Record outcomes in the vault (rejected ones too, with the user's implied reason — rejections steer future proposals). Accepted → `directions/<slug>.md` with `status: accepted`, pool counter++, context gets `cooldown_until`. Update `Perfect.md` after every context, not at session end — a killed session must lose nothing.
7. **A `none` gate that carries a steer** (the user says what they wanted instead) is a re-scout order, not a rejection of the context: promote the steer to `config.md → ## User taste` if it generalizes, re-scout at the steered depth/angle, and re-propose the SAME context once before advancing the cursor. Never re-present any rejected direction.

### Phase B — Build (one Opus builder per context, Fable decides everything)
1. **Wave plan**: group the pool's accepted directions by context → one builder per context, ≤ `config.wave_size` (default 3) concurrent, and **≤ 3 directions per builder brief** (a 4-direction brief exceeded one agent-session budget in the desktop loop — split a bigger context into two sequential builders). Present the wave plan in one screen; on user go (or when invoked as `/perfect build`), execute.
2. **Worktree per builder** — prepared by the Director, NOT via Agent-tool isolation (those worktrees lack `node_modules`):
   ```bash
   git worktree add .claude/worktrees/perfect-<ctx> -b worktree-perfect-<ctx>
   cmd //c mklink //J ".claude\\worktrees\\perfect-<ctx>\\node_modules" "..\\..\\..\\node_modules"   # junction, NOT copy
   ```
3. **Brief** each builder (see template below); launch with `model: "opus"`, `subagent_type: "general-purpose"`, all briefs in one message so they run concurrently.
4. **Mid-flight decisions**: a builder returning `DECISION NEEDED: …` gets an answer from the Director via `SendMessage` — product calls, trade-offs, and scope cuts are Fable's alone. A builder that stops without its final report gets one `SendMessage` nudge.
   **Builder-death recovery (session limits WILL kill builders):** the instant a builder dies, `git add -A && git commit --no-verify` a `wip(…)` snapshot **inside its worktree** (isolated tree — add-all is safe there; never-lose-work beats commit hygiene). Then the Director either finishes the work inline (review the WIP diff, complete gaps, split into per-direction commits along file boundaries — same-file hunks may share a commit if the message says so) or re-briefs a fresh builder after the limit resets with "continue from the WIP commit".
5. **Review — the Director earns its title here.** Per builder branch: `git diff master...worktree-perfect-<ctx>` and review against each direction's acceptance criteria, repo conventions (semantic Tailwind tokens, `useReducedMotion` gating, React 19 purity rules, i18n completeness across all 14 locales, Sentry-PII scrubbing, Supabase guards), and taste. Verdict per direction: **merge** / **redo with notes** (SendMessage, builder fixes in place) / **drop** (`status: failed`, reason recorded). Never merge on "tests pass" alone — read the diff.
   **Docs-vs-code check:** when a diff documents a behavior (contract text, formula, doc comment, `docs/features/*` claim), grep for the code that implements it before merging — a contract describing behavior the code doesn't have is worse than nothing.
   **i18n review calibration:** hand-translation into all 13 non-en locales is part of the acceptance bar (no English placeholders — see memory). Anchor locale-file review on bytes, not console rendering: PowerShell renders non-ASCII as `�` without the file being corrupted; `npm run check:i18n-encoding` is the arbiter.
6. **Merge serially**: per direction, `git merge --squash` (or cherry-pick) → ONE atomic commit on master, message format per repo convention:
   ```
   perfect/<context-slug>: <direction title>

   Why: <the user value in one line>
   Risk: <low|med|high + rationale>
   Verified: <tsc|lint|test:unit|build|playwright>
   ```
   plus the `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` footer. Stage per-file with `git commit --only -- <paths>` (concurrent sessions share this working tree — see memory; never sweep), verify `git diff --cached --stat` matches intent (foreign pre-staged files → `git restore --staged` them). Run the config gates on master after each merge; a red gate is fixed inline before the next merge.
   **Concurrent-session dirty files blocking a pick:** never stash, never wait — commit around them. (a) Dirty locale file: stage `HEAD + your keys` directly into the index (`git hash-object -w` + `git update-index --cacheinfo`), and write `their-working-copy + your keys` to disk — their uncommitted work stays theirs, and their later commit can't revert your keys. (b) Dirty source file: same index trick, content built by `git merge-file` (base=branch-fork, ours=HEAD, theirs=branch), plus a second merge-file for the working copy. (c) **Shared append-files** (e.g. `src/i18n/index.ts` exports, locale files under sequential picks): NEVER wholesale-`checkout` a branch's version across sequential picks — it clobbers earlier picks' additions. Patch-union (`git diff branch~..branch -- file | git apply --3way`) or re-apply key adds/removes programmatically, always. Anchor any locale Edit on ASCII context (mojibake memory).
7. **Doc-sync in the same commit**: user-visible changes update the mapped `docs/features/*` doc, and if a context's file ownership changed, `context-map.json` — CLAUDE.md demands both.
8. **Cleanup**: per worktree — `cmd //c rmdir` the node_modules **junction FIRST**, then `git worktree remove`, then delete the branch once its commits are on master.

### Phase W — Wrap (every session, even interrupted ones)
1. Update every touched vault note; write the session note with the **`next:` pointer** (e.g. `next: propose — cursor at guided-product-tour, pool 7/10` or `next: build wave 2 — feature-voting + guide-search remain`).
2. `Perfect.md` headline refreshed: pool count, queue cursor, shipped-total, last-session link.
3. If an active-runs ledger exists, move this session's entry to Recently completed with SHAs.
4. **Reflect on the skill itself**: 2-4 bullets in `config.md → ## Skill improvement log` — what dragged, what the user overrode, what the next round should change. This log is the input for the between-rounds skill revision.

## Direction quality bar (what earns a slot in the 5)

- **Value-first**: names the user moment it improves; "nice refactor" is not a direction unless it unlocks something.
- **Evidence-backed**: cites today's code (`file:line`), not vibes.
- **One-session-shippable**: ≲15 files, no cross-context schema breaks; else slice it. i18n cost counts — a string-heavy feature is bigger than it looks (×14 locales).
- **Novel to the vault**: not shipped, not pending, not previously rejected (unless the world changed — say so).
- **Lens-diverse**: default one per lens; substituting a second entry in one lens requires the Director to say why.

## Builder brief template

```
You are an Opus builder for the `<context>` context of personas-web
(Next.js 16 App Router + React 19 + TS + Tailwind 4 + Zustand 5; marketing site
+ demo dashboard on mocks; i18n = 14-locale local bundle).
Work ONLY in this worktree: <abs path>. Your scope is this context's files:
<filePaths from context-map.json>. Touching other contexts requires DECISION NEEDED.

Implement these accepted directions, one atomic commit each, message
`perfect/<context-slug>: <title>` with Why/Risk/Verified footer lines:
<per direction: What & why · Acceptance criteria · Evidence file:line · Risks/non-goals>

COMMIT EACH DIRECTION THE MOMENT IT IS DONE AND VERIFIED — never batch commits
for the end of the session. An interrupted session must lose at most the
direction in progress, not everything.

FOREGROUND ONLY: run every compile/test as a blocking foreground command and
wait for it — NEVER spawn a background run and "wait for the notification"
(you will idle forever and the Director has to nudge you).

Repo law (non-negotiable — .claude/CLAUDE.md is binding in full):
- Every user-facing string: add the key to src/i18n/en.ts first, then HAND-TRANSLATE
  into all 13 other locales (ar, bn, cs, de, es, fr, hi, id, ja, ko, ru, vi, zh) in the
  same commit — English placeholders are forbidden. Never hardcode English in JSX,
  aria-label, alt, or page metadata. Anchor Edit old_string on ASCII context in locale
  files (they contain non-ASCII that consoles render as �). Run
  npm run check:i18n-encoding after touching any locale file.
- Semantic Tailwind tokens only (text-foreground, bg-surface, border-glass,
  text-brand-cyan, …) — never text-white/bg-black/raw hex. Text opacity below /60
  is a lint warning (WCAG AA).
- Any requestAnimationFrame / canvas / GPU-intensive motion MUST gate on
  useReducedMotion from framer-motion (custom lint rule enforces it).
- React 19 purity: no sync setState in useEffect bodies (use the prev-state pattern);
  no Math.random/Date.now/new Date() in render or useMemo — lazy useState(() => …).
- Sentry: new breadcrumb/extra data must pass the src/lib/sentry-pii.ts scrubber shapes.
- Supabase: anon key only; guard every call on URL+key presence, fall back to mocks/no-ops.
- Dashboard routes are demo-only: extend src/lib/mockApi.ts / mock-dashboard-data.ts,
  never call the orchestrator directly.
- Read .claude/design.md before any UI work; follow the established SVG-motion pattern
  (reduced-motion gating, transform-box/view-box, brand CSS vars, components < 200 LOC).
- Update the mapped docs/features/*.md in the same commit as the feature change.
- Verify before claiming done: npm run typecheck, npm run lint, npm run test:unit
  (all foreground), and drive the actual flow when a dev server is available;
  report what you COULD NOT verify honestly.

If a product decision is ambiguous, STOP that direction and return `DECISION NEEDED: <question>`
with your recommendation — never guess. Final report format:
per direction → status (done|blocked|decision-needed), commits, files, verification evidence, open risks.
```

## Modes

- **`/perfect`** — resume the loop wherever the vault says it stopped (the default; covers init on first run).
- **`/perfect propose [context]`** — force a proposal pass (optionally jump the cursor to a named context).
- **`/perfect build`** — build now with the current pool even if < 10.
- **`/perfect status`** — read-only: queue, cursor, pool, in-flight builds, shipped ledger, last session. No agents.
- **`/perfect reflect`** — read `config.md → Skill improvement log` + last sessions and propose concrete edits to THIS skill file.

## Guardrails

- **Never stash, never `git add -A` on the main tree** — per-file staging (`git commit --only -- <paths>`), staged-count check before every commit; other sessions share this working tree and their work is sacred. (Inside a builder's isolated worktree, add-all WIP snapshots are fine.)
- **Cost discipline**: scouts are Explore-tier; Opus is spent only on accepted work; the Director never re-runs a scout whose brief is < 1 round old (it's in the context note).
- **Honest ledger**: a direction only reaches `shipped` with gates green AND the Director having read the diff; anything else is `failed` with a reason. No silent drops — every accepted direction's fate is recorded.
- **Interruptibility is a feature**: write the vault incrementally (after every context in P, after every merge in B) so a killed session resumes losslessly.
- **The user is the product owner**: the gate is theirs; the Director challenges but never overrides a rejection, and repeated rejections of a lens/context recalibrate the queue scores.
- **Out-of-scope walls from CLAUDE.md hold**: no route-path changes without confirmation, no Supabase schema/RLS changes, no new runners/bundlers, no `.env*` commits, no edits to `.claude/commands/goal-analysis-*.md`.
