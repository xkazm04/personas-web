import type { DateRangePreset } from "@/stores/dashboardFilterStore";

/**
 * The dashboard scope as one pure predicate: does a row fall inside the
 * persona and the time window the scope bar chose?
 *
 * Plane-agnostic on purpose: real rows and demo rows go through the same
 * function, and only the caller's `now` differs (the demo passes its seed
 * clock, real mode the time the view mounted). It never adds a row, it only
 * keeps or drops the ones it is given.
 */

export interface ScopeFilter {
  /** The chosen persona, or null for all personas. */
  personaId: string | null;
  /**
   * That persona's display name, for rows that carry a name instead of an id
   * (SLA, knowledge, messages). Null when the roster does not know it yet.
   */
  personaName?: string | null;
  dateRange: DateRangePreset;
  customStart?: string | null;
  customEnd?: string | null;
}

/**
 * A row as the scope sees it. A field left undefined means the row has no such
 * dimension, so the scope does not filter it on that dimension; `null` means
 * the dimension exists and is empty (an event aimed at no persona).
 */
export interface ScopeRow {
  personaId?: string | null;
  personaName?: string | null;
  /** When it happened (ISO string or epoch ms). */
  at?: string | number | null;
  /** For a row that spans time (an SLA breach): when it ended, null while still open. */
  until?: string | number | null;
}

export interface Scope {
  filter: ScopeFilter;
  /** The instant the window is measured back from. */
  now: number;
}

export interface ScopeWindow {
  start: number;
  /** Infinity for a preset: a row newer than `now` (a run started this session) is inside "the last 24 hours". */
  end: number;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const PRESET_SPAN_MS: Record<Exclude<DateRangePreset, "custom">, number> = {
  "24h": DAY,
  "7d": 7 * DAY,
  "30d": 30 * DAY,
  "90d": 90 * DAY,
};

/** The store's first-paint scope: every persona, the last 7 days. */
export const DEFAULT_SCOPE_FILTER: ScopeFilter = { personaId: null, dateRange: "7d" };

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function toMs(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const ms = typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

/** A date-only custom end means "through that whole day". */
function customEndMs(value: string | null | undefined): number | null {
  if (!value) return null;
  if (DATE_ONLY.test(value)) {
    const start = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(start) ? start + DAY - 1 : null;
  }
  return toMs(value);
}

/** The window the filter names, or null when it names none (a custom range with no bounds). */
export function scopeWindow(filter: ScopeFilter, now: number): ScopeWindow | null {
  if (filter.dateRange !== "custom") {
    return { start: now - PRESET_SPAN_MS[filter.dateRange], end: Infinity };
  }
  const start = toMs(filter.customStart);
  const end = customEndMs(filter.customEnd);
  if (start === null && end === null) return null;
  return { start: start ?? -Infinity, end: end ?? Infinity };
}

/** The start (UTC midnight) of a daily series row's `YYYY-MM-DD` date. */
export function dayStartMs(date: string): number | null {
  return toMs(`${date.slice(0, 10)}T00:00:00Z`);
}

export function inScope(row: ScopeRow, filter: ScopeFilter, now: number): boolean {
  if (filter.personaId !== null) {
    if (row.personaId !== undefined) {
      if (row.personaId !== filter.personaId) return false;
    } else if (row.personaName !== undefined) {
      if (!filter.personaName || row.personaName !== filter.personaName) return false;
    }
  }
  if (row.at !== undefined) {
    const window = scopeWindow(filter, now);
    const at = toMs(row.at);
    // A row with no readable time cannot be placed, so the window does not hide it.
    if (window && at !== null) {
      const until = row.until === undefined ? at : row.until === null ? Infinity : (toMs(row.until) ?? at);
      // Kept when [at, until] overlaps the window (a point row: at is inside it).
      if (until < window.start || at > window.end) return false;
    }
  }
  return true;
}

/**
 * Keep the rows in scope, in their order. `keepId` names a row that stays
 * whatever the scope says: a `?focus=` deep link must land on its row.
 */
export function scopeRows<T>(
  rows: readonly T[],
  toRow: (row: T) => ScopeRow,
  scope: Scope,
  keepId?: { id: string | null; of: (row: T) => string },
): T[] {
  return rows.filter(
    (row) => (keepId?.id != null && keepId.of(row) === keepId.id) || inScope(toRow(row), scope.filter, scope.now),
  );
}

/**
 * The store's choice as a filter: the persona's name joins from the roster,
 * and a remembered persona the loaded roster does not have (another account,
 * a deleted agent) reads as all personas, which is what the scope bar shows
 * for it. An empty roster (not loaded yet) keeps the id as chosen.
 */
export function resolveScopeFilter(
  choice: Pick<ScopeFilter, "personaId" | "dateRange" | "customStart" | "customEnd">,
  roster: readonly { id: string; name: string }[],
): ScopeFilter {
  const known = choice.personaId === null ? undefined : roster.find((persona) => persona.id === choice.personaId);
  const personaId = choice.personaId !== null && roster.length > 0 && !known ? null : choice.personaId;
  return {
    personaId,
    personaName: known?.name ?? null,
    dateRange: choice.dateRange,
    customStart: choice.customStart ?? null,
    customEnd: choice.customEnd ?? null,
  };
}

/** The scope hid every row there was: say "nothing in this window", not "nothing at all". */
export function scopeHidAll(all: readonly unknown[], kept: readonly unknown[]): boolean {
  return all.length > 0 && kept.length === 0;
}
