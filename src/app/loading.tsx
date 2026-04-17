/**
 * Top-level route-segment loading fallback.
 *
 * Shown during navigation between server-rendered routes while the next
 * segment streams in. Intentionally minimal — most public routes are
 * pre-rendered so this rarely appears for long.
 */
export default function RouteLoading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <div className="flex items-center gap-3 text-muted-dark">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-glass-hover border-t-brand-cyan" />
        <span className="text-base font-mono uppercase tracking-wider">
          Loading
        </span>
      </div>
    </div>
  );
}
