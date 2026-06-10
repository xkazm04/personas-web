import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp, CircleDot, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import type { ElementType } from "react";
import { relativeTime } from "@/lib/format";
import type { MockHealthIssue, ObservabilityLabels } from "./performanceViewTypes";

const severityStyles: Record<string, { color: string; bgColor: string; icon: ElementType }> = {
  critical: { color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  high: { color: "text-orange-400", bgColor: "bg-orange-500/10 border-orange-500/20", icon: ShieldAlert },
  medium: { color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20", icon: CircleDot },
  low: { color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", icon: CircleDot },
};

export function PerformanceHealthIssueRow({
  issue,
  labels,
}: {
  issue: MockHealthIssue;
  labels: ObservabilityLabels;
}) {
  const [expanded, setExpanded] = useState(false);
  // Lazy initializer: relativeTime reads Date.now(), which must stay out of render.
  const [age] = useState(() => relativeTime(issue.detectedAt));
  const sev = severityStyles[issue.severity] ?? severityStyles.low;
  const SevIcon = sev.icon;

  return (
    <div className={`rounded-xl border p-3.5 transition-colors ${sev.bgColor}`}>
      <div className="flex items-start gap-3">
        <SevIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${sev.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-medium text-foreground truncate">{issue.title}</p>
            {issue.isCircuitBreaker && <IssuePill icon={<Zap className="h-2.5 w-2.5" />} label={labels.circuitBreaker} tone="text-red-400 border-red-500/20 bg-red-500/10" />}
            {issue.status === "auto_fixed" && <IssuePill icon={<ShieldCheck className="h-2.5 w-2.5" />} label={labels.autoFixed} tone="text-emerald-400 border-emerald-500/20 bg-emerald-500/8" />}
            {issue.status === "resolved" && <IssuePill label={labels.resolved} tone="text-blue-400 border-blue-500/20 bg-blue-500/8" />}
          </div>
          <p className="mt-1 text-sm text-muted-dark line-clamp-2">{issue.description}</p>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-dark">
            <span>{issue.personaName}</span>
            <span>{age}</span>
            <span className={`uppercase font-medium ${sev.color}`}>
              {labels.severity[issue.severity as keyof ObservabilityLabels["severity"]] ?? issue.severity}
            </span>
          </div>
          {issue.autoFixApplied && (
            <div className="mt-2">
              <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-sm text-emerald-400/70 hover:text-emerald-400 transition-colors cursor-pointer">
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {labels.autoFixApplied}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="mt-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-300/80">
                      {issue.autoFixApplied}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IssuePill({ icon, label, tone }: { icon?: React.ReactNode; label: string; tone: string }) {
  return (
    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-medium ${tone}`}>
      {icon}
      {label}
    </span>
  );
}
