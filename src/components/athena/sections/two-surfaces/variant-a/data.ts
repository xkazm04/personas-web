// PROTOTYPE COPY — extract to src/i18n at assembly
//
// All user-facing strings for section 2 variant A, "The Migration Ledger".
// The three MIGRATIONS dramatize the doctrine's own removal table: each
// deleted notification surface and where its content went. Facts follow the
// written doctrine (chapter "Two dimensions: chat and orb"); keep verbatim
// when extracting.

export const COPY = {
  eyebrow: "Design doctrine · notification surfaces",
  headline: "Two surfaces. Nothing else.",
  sub: "Every other notification surface was deleted. By written doctrine.",
  doctrineWhisper:
    "doctrine — “Two dimensions: chat and orb” · the orb is a real dimension, so the decision queue is always on",
  ledgerAria:
    "Migration ledger — each removed notification surface and where its content went",
  survivorsAria: "The two surviving surfaces: the orb and chat",
  survivorsStamp: "surviving surfaces · 2",
  orbLabel: "orb",
  orbState: "state glow · queue always on",
  chatTitle: "chat",
  chatIdle: "Quiet. Nothing needed saying.",
  tileButton: "Restart “Ranger”",
  deletedStamp: "deleted by doctrine · 3 surfaces",
} as const;

/**
 * The migration table, one row per deleted surface. `id` keys into the
 * flight geometry (same order, same ids) in ledger-geometry.ts.
 *  - title/body: the obnoxious mini-UI as it used to look,
 *  - entry: the changelog annotation traced along the flight path,
 *  - landing: what appears on the destination surface when it arrives.
 */
export const MIGRATIONS = [
  {
    id: "popover",
    kind: "notice",
    title: "Footer notice",
    body: "3 personas idle — click to review",
    entry: "footer popover → orb state · deleted",
    landing: "state shifts. no popover.",
  },
  {
    id: "fleet",
    kind: "auto",
    title: "Athena auto-decided",
    body: "Fleet scaled to 4 workers",
    entry: "fleet toast → orb pulse + chat ledger · deleted",
    landing: "☰ auto-decided · fleet → 4 workers",
  },
  {
    id: "failure",
    kind: "error",
    title: "✕ Task failed",
    body: "Persona “Ranger” crashed",
    entry: "failure toast → in place, where you clicked · deleted",
    landing: "failed — retry?",
  },
] as const;

export type MigrationId = (typeof MIGRATIONS)[number]["id"];
export type MigrationKind = (typeof MIGRATIONS)[number]["kind"];
