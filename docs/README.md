# Start here: personas-web docs

The order you read these in shapes what you believe about the repo, so read the first
block in order. Everything else is reference: open it when the work touches it.
`src/lib/docsIndex.test.ts` fails `test:unit` when a doc under `docs/` or a `CLAUDE.md`
is not linked from this page, or when a link here points at nothing.

## Read in this order

1. [.claude/CLAUDE.md](../.claude/CLAUDE.md): the binding repo law every agent session
   loads. Commands, git policy, the numbered conventions, what is out of scope.
2. [AI_HARNESS.md](AI_HARNESS.md): how changes are checked. The gates and where each
   runs, the review gate for AI changes, the harness deny list, provenance, skills.
3. [conventions-enforcement.md](conventions-enforcement.md): for each convention in
   step 1, the lint rule, spec or gate that catches a break, and what is left to you.
4. [threat-model.md](threat-model.md): every API route with its caller gate and the
   secret it may touch. Read before touching `src/app/api/` or `src/lib/server/`.
5. [degraded-dependencies.md](degraded-dependencies.md): what visitors and operators
   see when Supabase or the orchestrator is missing or down.
6. [decisions/README.md](decisions/README.md): recorded decisions and accepted risks.
   A decision here outranks a guess, and an accepted risk is not a finding.

## Folder-scoped guidance

Claude Code loads these pointers when it works in their folder. Each names the sections
of the files above that govern the folder and states no rule of its own.

- [scripts/CLAUDE.md](../scripts/CLAUDE.md): gate and check scripts
- [src/app/api/CLAUDE.md](../src/app/api/CLAUDE.md): API route handlers
- [src/lib/server/CLAUDE.md](../src/lib/server/CLAUDE.md): server-only modules

## Reference

- [features/INDEX.md](features/INDEX.md): one doc per submodule, with key files and
  known gotchas. Read the feature's doc before working on it.
- [api/openapi.json](api/openapi.json): request and response shapes of every API route.
- [testing/e2e-smoke-tier.md](testing/e2e-smoke-tier.md): the Playwright smoke tier
  run on every PR.
- [i18n/style-en.md](i18n/style-en.md) and [i18n/glossary.md](i18n/glossary.md):
  English copy style and translation glossary.
- [translation-handoff.md](translation-handoff.md): handing copy to translators.
- [supabase-auth-setup.md](supabase-auth-setup.md): Supabase auth configuration.
- [visual-identity.md](visual-identity.md) and
  [ui-evolution-playbook.md](ui-evolution-playbook.md): visual language and how the UI
  is allowed to change.
- [tour-journey.md](tour-journey.md): the guided product tour.

## History and backlogs

Context, not instructions. Do not act on these without checking the current code.

- [harness/harness-learnings.md](harness/harness-learnings.md): dated structural facts
  agents learned the hard way; scan and bug-hunt reports sit beside it in `docs/harness/`.
- [concepts/README.md](concepts/README.md): direction-level ideas awaiting an owner
  decision. Nothing there is approved work.
- [parity-backlog/README.md](parity-backlog/README.md): parity work against the desktop app.
- [opus-4.7-oss-release-passes.md](opus-4.7-oss-release-passes.md): the OSS release
  passes and their audit reports.
