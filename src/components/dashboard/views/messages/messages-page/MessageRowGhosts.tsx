/** Stable keys: ghost rows are fixed regions, never data. */
const GHOST_ROWS = ["g0", "g1", "g2", "g3"];

/**
 * The cold-load placeholder for the message list (desk and phone): four rows
 * with a settled row's geometry — `rounded-xl border p-3`, a 28 px avatar, a
 * subject line and a persona · time line (~68 px each). The rows hold their
 * height at once and only become visible after the ghost delay (`dash-ghost`),
 * so a fast load paints nothing. Shown only while nothing is held; a refetch
 * keeps the last rows on screen.
 */
export function MessageRowGhosts() {
  return (
    <div className="space-y-2" aria-busy="true">
      {GHOST_ROWS.map((key) => (
        <div
          key={key}
          aria-hidden
          className="dash-ghost flex items-center gap-3 rounded-xl border border-glass p-3"
        >
          <span className="h-7 w-7 flex-shrink-0 rounded-lg bg-glass" />
          <span className="min-w-0 flex-1 space-y-2.5 py-1">
            <span className="block h-3.5 w-1/2 rounded bg-glass" />
            <span className="block h-3 w-1/4 rounded bg-glass" />
          </span>
        </div>
      ))}
    </div>
  );
}
