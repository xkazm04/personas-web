/** The "Load more" pager under the executions table. */
export function LoadMoreExecutions({
  label,
  visible,
  total,
  onLoadMore,
}: {
  /** `t.dashboardUi.loadMoreExecutions` - carries `{visible}` / `{total}`. */
  label: string;
  visible: number;
  total: number;
  onLoadMore: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-center">
      <button
        type="button"
        onClick={onLoadMore}
        className="rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm text-muted transition-colors hover:border-glass-strong hover:text-foreground"
      >
        {label.replace("{visible}", String(visible)).replace("{total}", String(total))}
      </button>
    </div>
  );
}
