# Runbook: refresh the UI translation ledger

**When:** after any change to a UI string in `src/i18n/en.ts` or a locale file, or when CI's
`npm run check:i18n-ledger` step is red.

**What the ledger is:** `docs/i18n/ui-ledger.json` pins every (key, locale) pair to the hash
of the English value it was translated from. The model is in `scripts/i18n/ui-ledger-lib.mjs`;
statuses are `current`, `identical`, `stale`, `pending` and `unpinned`. The stale, pending and
identical counts are a ratchet: they may only fall.

## Steps

1. Change English in `src/i18n/en.ts` first, then hand-translate the same key in all 13
   non-en locales in the same change (CLAUDE.md convention 1: no English placeholders).
2. `npm run check:i18n-coverage`: every key present in every locale.
3. `npm run check:i18n-encoding`: no new mojibake. Anchor edits on ASCII; a console shows
   non-ASCII as `?`, which is not corruption. Check the bytes before "fixing" it.
4. `npm run i18n:ledger`: pins new and retranslated strings, drops removed keys, lowers the
   ratchet. It never launders a stale pair: a translation you did not touch stays stale.
5. `npm run check:i18n-ledger`: must pass. Look at the pairs it reports with
   `node scripts/i18n/ui-ledger.mjs --keys=<locale>:stale`.
6. Commit the locale files and `docs/i18n/ui-ledger.json` together.

## Do not

- Run `node scripts/i18n/ui-ledger.mjs --update --accept-ratchet-raise` on your own. A raise
  (a new pending namespace, or stale pairs left on purpose) is the owner's call.
- Edit `docs/i18n/ui-ledger.json` by hand.

## If the ledger logic itself changes

`scripts/i18n/ui-ledger-lib.mjs` is under mutation testing. Run
`node --test "scripts/i18n/*.test.mjs"` and `node scripts/mutation/mutate.mjs`. When a mutant
in `scripts/mutation/ledger-mutants.mjs` no longer matches the source, update its `find`
text. When one survives, add the test that kills it.
