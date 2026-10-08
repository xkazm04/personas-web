/**
 * The desktop Notepad's goals as the web sees them (`synced_notes`,
 * docs/concepts/mobile-revival/PHASE2-SPEC.md 5.1). Pure: no React, no stores,
 * no clock, so the zone partition and the reading order are pinned by tests.
 *
 * The order mirrors the desktop Quest Log (`questlogModel.ts` there): zones are
 * projects in alphabetical order with the unmapped bucket last, and a goal's
 * place inside its zone comes from its rail and the pad's own `order_index`.
 * Nothing re-sorts by urgency, so a project keeps its seat between visits.
 */

/** Every status a synced note can carry. `archived` is never synced. */
export const NOTE_STATUSES = [
  "draft",
  "published",
  "in_progress",
  "completed",
  "scoped",
  "cut",
  "shipped",
] as const;

export type NoteStatus = (typeof NOTE_STATUSES)[number];

/** Where a published note was handed: the Fleet runner or Athena's goals. */
export type NoteDispatchTarget = "fleet" | "athena_goals";

/** One row of `synced_notes`, camelCased. Read-only on the web (spec 5.1, v1). */
export interface SyncedNote {
  id: string;
  deviceId: string;
  /** The desktop project's name; null when the note has no project. */
  projectName: string | null;
  title: string;
  /** Markdown, secret-masked and size-capped by the desktop before it leaves. */
  bodyMd: string;
  status: NoteStatus;
  orderIndex: number;
  dispatchTarget: NoteDispatchTarget | null;
  /** The run's summary line (from `result_json.summary`), if the note was run. */
  resultSummary: string | null;
  /** Pending Athena/agent reviews on the note's thread: "needs review". */
  openReviews: number;
  unreadComments: number;
  publishedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function isNoteStatus(value: unknown): value is NoteStatus {
  return typeof value === "string" && (NOTE_STATUSES as readonly string[]).includes(value);
}

/**
 * The two rails, sharing only `draft` (desktop `notepad/CONTEXT.md`):
 * brainstorm hands the note to a runner; plan moves with a milestone's scope.
 */
export const BRAINSTORM_RAIL = ["draft", "published", "in_progress", "completed"] as const satisfies readonly NoteStatus[];
export const PLAN_RAIL = ["draft", "scoped", "cut", "shipped"] as const satisfies readonly NoteStatus[];

export type NoteRail = "brainstorm" | "plan" | "shared";

export function railOf(status: NoteStatus): NoteRail {
  if (status === "draft") return "shared";
  return (PLAN_RAIL as readonly NoteStatus[]).includes(status) ? "plan" : "brainstorm";
}

/** Where a status sits on its rail: the glyph fills `index + 1` of `steps` segments. */
export function railPosition(status: NoteStatus): { rail: NoteRail; steps: readonly NoteStatus[]; index: number } {
  const rail = railOf(status);
  const steps: readonly NoteStatus[] = rail === "plan" ? PLAN_RAIL : BRAINSTORM_RAIL;
  return { rail, steps, index: Math.max(0, steps.indexOf(status)) };
}

/**
 * Reading order inside a zone, as on the desktop: the plan rail first (the
 * committed work), then drafts, then the brainstorm rail; within one status
 * the pad's own `orderIndex`, then the title so equal rows never swap.
 */
const RAIL_ORDER: readonly NoteStatus[] = ["scoped", "cut", "shipped", "draft", "published", "in_progress", "completed"];

export function compareInZone(a: SyncedNote, b: SyncedNote): number {
  const byStatus = RAIL_ORDER.indexOf(a.status) - RAIL_ORDER.indexOf(b.status);
  if (byStatus !== 0) return byStatus;
  if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
  return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
}

export interface NoteZone {
  /** The project name as synced (trimmed), or `NO_PROJECT_KEY`. */
  key: string;
  /** Null for the "no project" bucket; the caller supplies its label. */
  name: string | null;
  notes: SyncedNote[];
  /** Pending reviews across the zone's notes. */
  openReviews: number;
  unreadComments: number;
}

export const NO_PROJECT_KEY = "__none";

/**
 * Zones in reading order: projects alphabetically (case-insensitive), the
 * unmapped bucket last. Only `projectName` is synced (never the local path),
 * so a project is its name; two desktop projects with one name share a zone.
 */
export function buildNoteZones(notes: readonly SyncedNote[]): NoteZone[] {
  const byKey = new Map<string, SyncedNote[]>();
  for (const note of notes) {
    const name = note.projectName?.trim();
    const key = name ? name : NO_PROJECT_KEY;
    const list = byKey.get(key);
    if (list) list.push(note);
    else byKey.set(key, [note]);
  }

  const zone = (key: string, list: SyncedNote[]): NoteZone => ({
    key,
    name: key === NO_PROJECT_KEY ? null : key,
    notes: [...list].sort(compareInZone),
    openReviews: list.reduce((n, note) => n + note.openReviews, 0),
    unreadComments: list.reduce((n, note) => n + note.unreadComments, 0),
  });

  const zones: NoteZone[] = [];
  for (const [key, list] of byKey) if (key !== NO_PROJECT_KEY) zones.push(zone(key, list));
  zones.sort((a, b) => a.key.localeCompare(b.key, undefined, { sensitivity: "base" }) || a.key.localeCompare(b.key));
  const none = byKey.get(NO_PROJECT_KEY);
  if (none) zones.push(zone(NO_PROJECT_KEY, none));
  return zones;
}

/** A `synced_notes` row as PostgREST returns it (scripts/setup-sync-db.sql). */
export interface SyncedNoteRow {
  id: string;
  device_id: string;
  project_name: string | null;
  title: string;
  body_md: string | null;
  status: string;
  order_index: number | null;
  dispatch_target: string | null;
  result_summary: string | null;
  open_reviews: number | null;
  unread_comments: number | null;
  published_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** The columns the web reads: everything but `user_id` (RLS) and `synced_at` (the desktop's reconcile key). */
export const SYNCED_NOTE_COLUMNS =
  "id,device_id,project_name,title,body_md,status,order_index,dispatch_target,result_summary,open_reviews,unread_comments,published_at,started_at,completed_at,created_at,updated_at";

function count(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

/**
 * Map a row to the web type, or null for a row this client cannot draw (a
 * status outside the CHECK, i.e. schema drift): dropping it beats inventing a
 * status for it.
 */
export function mapNoteRow(row: SyncedNoteRow): SyncedNote | null {
  if (!isNoteStatus(row.status)) return null;
  const target = row.dispatch_target;
  return {
    id: row.id,
    deviceId: row.device_id,
    projectName: row.project_name,
    title: row.title,
    bodyMd: row.body_md ?? "",
    status: row.status,
    orderIndex: typeof row.order_index === "number" ? row.order_index : 0,
    dispatchTarget: target === "fleet" || target === "athena_goals" ? target : null,
    resultSummary: row.result_summary?.trim() ? row.result_summary : null,
    openReviews: count(row.open_reviews),
    unreadComments: count(row.unread_comments),
    publishedAt: row.published_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface NoteTotals {
  notes: number;
  /** Notes with at least one pending review. */
  needsReview: number;
  openReviews: number;
  unreadComments: number;
}

export function noteTotals(notes: readonly SyncedNote[]): NoteTotals {
  let needsReview = 0;
  let openReviews = 0;
  let unreadComments = 0;
  for (const note of notes) {
    if (note.openReviews > 0) needsReview++;
    openReviews += note.openReviews;
    unreadComments += note.unreadComments;
  }
  return { notes: notes.length, needsReview, openReviews, unreadComments };
}
