# Runbook: refresh guide translations

**When:** English guide content under `src/data/guide/` changed, or a locale is being
bootstrapped.

**Where it runs:** on a Windows checkout with full git history. CI deliberately does not run
`npm run check:guide-translations`. The stored source hashes include CRLF line endings, and
CRLF is the canonical form by decision, so a Linux runner reports about 100% stale. That
reasoning is recorded in `.github/workflows/ci.yml`.

## Steps

1. `npm run check:guide-content`: the catalog invariant (each listed topic has content).
2. `npm run check:guide-translations`: lists real English changes as stale. Line-ending and
   extractor churn is named and folded into fresh. Exit 3 means no history (a shallow
   clone): fetch the full history first. Do not read a number from that run.
3. For a refresh, write the work order:
   `node scripts/i18n/check-guide-translations.mjs --work-order` (add `--locale=<l>` to
   scope it).
4. Emit the current English hashes with `node scripts/i18n/emit-source-hashes.mjs`.
5. Translate with the template in `scripts/i18n/translate-guide-subagent-prompt.md`. Fill
   its placeholders from steps 3 and 4. Use one subagent per locale.
6. Re-run `npm run check:guide-translations` and expect no content-stale topics, then
   `npm run check:i18n-encoding`.

## Do not

- Normalise the guide content to LF. That invalidates every stored pin at once. The cheap
  route to running this check in CI is a `.gitattributes` that forces `eol=crlf`, which is an
  owner decision.
- Re-implement the extraction or the hashing. Both scripts import `scripts/i18n/guide-source.mjs`.
