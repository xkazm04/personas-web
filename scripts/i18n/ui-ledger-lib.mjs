// Pure logic for the per-key UI catalog ledger (ui-ledger.mjs).
//
// The guide has had per-topic provenance for a while (_meta.json source hashes, drift
// detection). The UI catalog only had a SHAPE check: a changed English value left every
// translation of it in place, and every gate green. The ledger gives each (key, locale)
// pair the same provenance: the hash of the English value that translation was last
// verified against.
//
// Ledger entry for one key:  { en: <hash of current English>, pins: { <locale>: "<pin>:<val>" } }
//   pin = hash of the English value the locale's string was pinned against
//   val = hash of the locale's own string at pin time
//
// Status of a pair, derived (never stored) from ledger + current catalog:
//   pending   the locale file has no string for the key (runtime renders English)
//   unpinned  no ledger entry, or the locale string changed since pinning: `--update`
//             records it against the current English
//   stale     English changed since the pin and the locale string is untouched
//   identical pinned and current, but the string still equals English and is not
//             a non-translatable class (see identical-values-lib.mjs)
//   current   pinned against today's English, and not identical
//
// A pin is only ever written for a string somebody changed (or that is new), so
// `--update` can never launder a stale translation into "current".

import { createHash } from "node:crypto";
import { classifyNonTranslatable } from "./identical-values-lib.mjs";

export const LEDGER_VERSION = 1;
export const STATUSES = Object.freeze(["current", "identical", "stale", "pending", "unpinned"]);

/** Short stable digest of a decoded string (NFC-normalised so equivalent forms agree). */
export function hashValue(value) {
  return createHash("sha256").update(value.normalize("NFC"), "utf8").digest("hex").slice(0, 10);
}

function parsePin(raw) {
  if (typeof raw !== "string") return null;
  const [pin, val] = raw.split(":");
  return pin && val ? { pin, val } : null;
}

/** Status of one (key, locale) pair. `entry` is the ledger entry for the key, if any. */
export function pairStatus({ enValue, localeValue, entry, locale, acceptedTerms }) {
  if (typeof localeValue !== "string") return "pending";
  const pin = parsePin(entry?.pins?.[locale]);
  if (!pin) return "unpinned";
  if (pin.val !== hashValue(localeValue)) return "unpinned";
  if (pin.pin !== hashValue(enValue)) return "stale";
  if (localeValue === enValue && !classifyNonTranslatable(enValue, acceptedTerms)) return "identical";
  return "current";
}

/**
 * Evaluates every pair. Returns per-locale counts, per-locale key lists by status,
 * and ledger keys that no longer exist in English.
 */
export function evaluate({ enLeaves, localeLeaves, ledger, acceptedTerms, pendingKeyCount = 0 }) {
  const locales = Object.keys(localeLeaves);
  const perLocale = {};
  const keysByStatus = {};
  for (const locale of locales) {
    perLocale[locale] = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    keysByStatus[locale] = Object.fromEntries(STATUSES.map((s) => [s, []]));
  }
  for (const [key, enValue] of enLeaves) {
    const entry = ledger?.keys?.[key];
    for (const locale of locales) {
      const status = pairStatus({
        enValue,
        localeValue: localeLeaves[locale].get(key),
        entry,
        locale,
        acceptedTerms,
      });
      perLocale[locale][status] += 1;
      keysByStatus[locale][status].push(key);
    }
  }
  const orphans = Object.keys(ledger?.keys ?? {}).filter((key) => !enLeaves.has(key));
  const totals = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const locale of locales) for (const s of STATUSES) totals[s] += perLocale[locale][s];
  // Namespaces held English-only in src/i18n/pending/ are pending in every locale.
  const pendingNamespacePairs = pendingKeyCount * locales.length;
  return { perLocale, keysByStatus, totals, orphans, pendingNamespacePairs, locales };
}

/** The numbers the ratchet holds: each may only fall. */
export function ratchetCounts(result) {
  return {
    stale: result.totals.stale,
    pending: result.totals.pending + result.pendingNamespacePairs,
    identical: result.totals.identical,
  };
}

/**
 * Builds the next ledger. Existing pins are kept unless the locale string changed
 * (then it is re-pinned against the current English); new pairs are pinned; stale
 * pairs stay stale. Ledger keys gone from English are dropped.
 */
export function buildLedger({ enLeaves, localeLeaves, previous, pendingNamespaces, ratchet }) {
  const locales = Object.keys(localeLeaves).sort();
  const keys = {};
  for (const [key, enValue] of enLeaves) {
    const enHash = hashValue(enValue);
    const prior = previous?.keys?.[key];
    const pins = {};
    for (const locale of locales) {
      const localeValue = localeLeaves[locale].get(key);
      if (typeof localeValue !== "string") continue;
      const priorPin = parsePin(prior?.pins?.[locale]);
      const valHash = hashValue(localeValue);
      pins[locale] =
        priorPin && priorPin.val === valHash ? `${priorPin.pin}:${valHash}` : `${enHash}:${valHash}`;
    }
    keys[key] = { en: enHash, pins };
  }
  return {
    version: LEDGER_VERSION,
    locales,
    ratchet,
    pending: pendingNamespaces,
    keys,
  };
}

/** Ratchet verdict: which counts rose above the ledger's recorded ceiling. */
export function ratchetBreaches(current, recorded) {
  if (!recorded) return [];
  return Object.keys(current).filter((name) => current[name] > (recorded[name] ?? 0));
}
