# Commit conventions: personas-web

The history should show where each change came from and why it was made.

## Format

The format is the Commits rule in [`.claude/CLAUDE.md`](../.claude/CLAUDE.md), under Conventions:
one atomic change per commit, with `Why:`, `Risk:` and `Verified:` lines in the body. That file is
the source of the rule, so this page does not copy it.

## Who wrote the change

- A commit that an AI agent wrote carries a `Co-Authored-By:` trailer naming the model, for example
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- A commit from Ascent's runner also carries one `Ascent-Resolves: <id>` trailer per follow-up it
  claims. A claim is not a verdict: the follow-up closes only when the next scan confirms it.
- A template install from Ascent's runner (`chore: add ... starter (via Ascent)`) carries no AI
  trailer, because no model wrote it.

## Known gaps

- Runner lane commits use a `fix:` or `chore:` subject, not the format above.
- Runner lane commits landed before 2026-10-13 (the first `/infinite` wave) carry no
  `Co-Authored-By:` trailer. Every one of them was written by Claude through Ascent, and the merge
  commit that brought them in says so.
