# 2026-10-13 PROPOSED: a degrading lane is narrowed before it is paused, and the manifest records its scope

**Governs:** `.ai/manifest.yaml`, `scripts/report-agent-rework.mjs`

Status: proposed. Needs the owner's call; the runbook in "## Provenance" of `docs/AI_HARNESS.md` ("When a lane degrades") is usable today without it.

## Context

The harness catches bad output: the `ai-change` gate fails a commit with a hallucinated anchor, a protected path or scope creep, and the rework meter (`scripts/report-agent-rework.mjs`) flags a lane whose commits keep getting reworked. Nothing said what happens next. The meter's own text stops at "a flagged lane gets a closer review of its recent work, or tasks of that kind go back to a person", and its `--strict` flag (exit 1 on any flag) is wired into nothing.

`.ai/manifest.yaml` has no lane scope. `scope.does` / `scope.does_not` is the repo's product scope, read by the registry's fleet map; it says nothing about which paths a given lane may touch. So a lane can only be on (dispatched) or off (not dispatched), and the off switch lives in the owner's head.

## Options

1. **Pause on any flag.** Simple, but it throws away a lane whose rework is concentrated in one folder while its other work is fine.
2. **Narrow first, then pause.** Take the folder the reworked commits touch away from the lane, then restrict the lane to docs and tests, and pause it only if the rate stays over budget. Needs somewhere to write the narrowed scope down.
3. **Narrow by editing the dispatch prompt only.** Works, but the scope then lives outside the repo, and no reviewer reading this tree can see that a lane is narrowed or why.

## Recommendation

Option 2, with the scope written into `.ai/manifest.yaml` as an optional block. Readers ignore unknown fields (the manifest's header says so), so adding it breaks nothing. An illustration (the numbers are made up):

```yaml
lanes:
  ascent:
    status: narrowed            # active | narrowed | paused
    denyPaths: [src/i18n/]      # folders taken away from the lane
    allowPaths: []              # when set, the only paths the lane may touch
    reason: "rework 38% over the last 300 commits, concentrated in src/i18n/"
    since: 2026-10-13
    revisitAfter: 2026-11-13    # re-run the meter and decide again
```

The lane runner reads the block before dispatching: `paused` dispatches nothing, `narrowed` drops items whose expected files fall in `denyPaths` (or outside `allowPaths`) and hands them to a person. `scripts/check-ai-change.mjs` could later fail a commit carrying `Ascent-Resolves:` that touches a denied path, the same way it fails scope creep today.

## Follow-up (needs a person)

- Decide the block's shape and add it to `.ai/manifest.yaml`. Until then a narrowing is recorded as a dated status line in this record.
- Teach the lane runner to read `lanes:` and to call `node scripts/report-agent-rework.mjs --strict` before a cycle, stopping on exit 1. The runner is outside this repo.
- Decide whether `scripts/check-ai-change.mjs` should enforce `denyPaths`. That is a gate-script edit, pinned by `src/lib/aiChangeGateMutants.test.ts`.
