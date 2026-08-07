/**
 * Compact relative-time labels for the home instruments (`6m`, `1h`, `1d`).
 *
 * These are the narrow, column-width variants used by the routines and vault
 * cards and by the status ticker — `lib/format.ts#relativeTime` produces the
 * wider "4m ago" phrasing the activity stream needs. Every function takes the
 * current time as an argument so callers stay pure (see `useLiveClock`).
 */

/** `deltaMs` → `0m` / `42m` / `3h` / `2d`. Negative deltas clamp to `0m`. */
function compact(deltaMs: number): string {
  const mins = Math.max(0, Math.round(deltaMs / 60_000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

/**
 * The effective next-run time in epoch-ms.
 *
 * When a demo fixture carries a cadence (`everyMinutes`) and its seeded run
 * time has already passed, roll forward by whole cadences so a long-open demo
 * keeps counting down instead of freezing at "0m". Without a cadence — the real
 * supabase path, where `nextTriggerAt` is authoritative — the timestamp is used
 * as-is.
 */
export function effectiveNextRunMs(
  iso: string,
  everyMinutes: number | undefined,
  now: number,
): number {
  const base = new Date(iso).getTime();
  if (!Number.isFinite(base)) return Number.NaN;
  if (!everyMinutes || everyMinutes <= 0 || base >= now) return base;
  const period = everyMinutes * 60_000;
  return base + Math.ceil((now - base) / period) * period;
}

/** Countdown to a future timestamp, e.g. `6m`. Empty string if unparseable. */
export function untilLabel(targetMs: number, now: number): string {
  if (!Number.isFinite(targetMs)) return "";
  return compact(targetMs - now);
}

/** Elapsed time since an ISO timestamp, e.g. `4m`. Empty if unparseable. */
export function sinceLabel(iso: string, now: number): string {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return "";
  return compact(now - ts);
}
