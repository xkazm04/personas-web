/**
 * What a chart slot shows when it has nothing to plot: a muted line in the
 * chart's reserved height, never axes and gridlines around nothing (which read
 * as a measured zero - data-viz/empty-and-degraded-chart-states). The caller
 * picks the copy that names the fact: nothing in this window, or could not load.
 */
export function ChartEmptyNote({ height, text }: { height: number; text: string }) {
  return (
    <p className="flex items-center justify-center text-center text-sm text-muted-dark" style={{ minHeight: height }}>
      {text}
    </p>
  );
}
