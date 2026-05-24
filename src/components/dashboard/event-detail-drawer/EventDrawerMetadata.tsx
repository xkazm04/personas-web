import { Clock, Timer } from "lucide-react";

export function EventDrawerMetadata({
  timestamp,
  durationMs,
  labels,
}: {
  timestamp: string;
  durationMs: number;
  labels: { timestamp: string; duration: string };
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-glass bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-dark">
          <Clock className="h-3 w-3" />
          {labels.timestamp}
        </div>
        <p className="mt-1 text-sm font-mono text-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </p>
        <p className="text-sm text-muted-dark">
          {new Date(timestamp).toLocaleDateString()}
        </p>
      </div>

      <div className="rounded-xl border border-glass bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-dark">
          <Timer className="h-3 w-3" />
          {labels.duration}
        </div>
        <p className="mt-1 text-sm font-mono text-foreground">
          {durationMs.toLocaleString()}{"ms"}
        </p>
        <p className="text-sm text-muted-dark">
          {durationMs < 500 ? "Fast" : durationMs < 2000 ? "Normal" : "Slow"}
        </p>
      </div>
    </div>
  );
}
