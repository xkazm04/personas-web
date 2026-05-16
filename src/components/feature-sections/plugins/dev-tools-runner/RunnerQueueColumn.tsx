import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react";

import { INITIAL_QUEUE, type QueueTask } from "./devToolsRunnerData";

function statusColor(status: QueueTask["status"]) {
  if (status === "done") return "#34d399";
  if (status === "running") return "#06b6d4";
  if (status === "failed") return "#f43f5e";
  return "#64748b";
}

function QueueStatusIcon({ task }: { task: QueueTask }) {
  const color = statusColor(task.status);

  if (task.status === "done")
    return <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color }} />;
  if (task.status === "running")
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color }} />;
  if (task.status === "failed")
    return <XCircle className="h-4 w-4 shrink-0" style={{ color }} />;
  return (
    <div
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export function RunnerQueueColumn() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-base font-mono uppercase tracking-widest text-foreground/65">
        <Play className="h-4 w-4" />
        Queue - 5
      </div>
      <div className="space-y-1.5">
        {INITIAL_QUEUE.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-md border border-foreground/[0.08] bg-foreground/[0.02] px-2.5 py-2"
          >
            <div className="flex items-center gap-1.5">
              <QueueStatusIcon task={task} />
              <span className="text-base font-mono text-foreground/90 truncate">
                {task.label}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-base font-mono text-foreground/60">
              <span className="truncate">{task.project}</span>
              {task.durationMs && (
                <span className="tabular-nums">
                  {(task.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
