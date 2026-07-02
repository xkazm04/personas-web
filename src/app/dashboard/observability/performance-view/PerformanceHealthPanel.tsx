import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, Loader2, Search, ShieldAlert } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import HealthyShieldIllustration from "@/components/illustrations/HealthyShieldIllustration";
import { fadeUp } from "@/lib/animations";
import type { MockHealthIssue, ObservabilityLabels, SeverityFilter } from "./performanceViewTypes";
import { PerformanceHealthIssueRow } from "./PerformanceHealthIssueRow";
import { SeverityFilterChips } from "./SeverityFilterChips";

export function PerformanceHealthPanel({
  openIssues,
  filteredHealthIssues,
  severityFilter,
  setSeverityFilter,
  severityCounts,
  healingActive,
  onRunAnalysis,
  labels,
}: {
  openIssues: MockHealthIssue[];
  filteredHealthIssues: MockHealthIssue[];
  severityFilter: SeverityFilter;
  setSeverityFilter: (filter: SeverityFilter) => void;
  severityCounts: Record<SeverityFilter, number>;
  healingActive: boolean;
  onRunAnalysis: () => void;
  labels: ObservabilityLabels;
}) {
  return (
    <motion.div variants={fadeUp} className="lg:col-span-3">
      <GlowCard accent={openIssues.length > 0 ? "amber" : "emerald"} className="p-5 h-full">
        <PerformanceHealthHeader openIssues={openIssues} healingActive={healingActive} onRunAnalysis={onRunAnalysis} labels={labels} />
        <div className="mb-3">
          <SeverityFilterChips active={severityFilter} onSelect={setSeverityFilter} counts={severityCounts} labels={labels.severity} />
        </div>
        <HealingAnalysisBanner active={healingActive} label={labels.runningAnalysis} />
        <PerformanceHealthContent filteredHealthIssues={filteredHealthIssues} severityFilter={severityFilter} labels={labels} />
      </GlowCard>
    </motion.div>
  );
}

function PerformanceHealthHeader({ openIssues, healingActive, onRunAnalysis, labels }: { openIssues: MockHealthIssue[]; healingActive: boolean; onRunAnalysis: () => void; labels: ObservabilityLabels }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400" />
        {labels.healthIssues}
      </h3>
      <div className="flex items-center gap-2">
        {openIssues.length > 0 && <span className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-sm font-medium text-amber-400">{openIssues.length} {labels.open}</span>}
        <button onClick={onRunAnalysis} disabled={healingActive} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-all cursor-pointer ${healingActive ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" : "border-glass-hover bg-white/[0.03] text-muted-dark hover:border-glass-strong hover:text-muted"}`}>
          {healingActive ? <><Loader2 className="h-3 w-3 animate-spin" />{labels.analyzing}</> : <><Search className="h-3 w-3" />{labels.runAnalysis}</>}
        </button>
      </div>
    </div>
  );
}

function HealingAnalysisBanner({ active, label }: { active: boolean; label: string }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {active && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
          <motion.div animate={reduced ? undefined : { rotate: 360 }} transition={reduced ? undefined : { duration: 1.5, repeat: Infinity, ease: "linear" }}>
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
          </motion.div>
          <p className="text-sm text-cyan-300/80">{label}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PerformanceHealthContent({ filteredHealthIssues, severityFilter, labels }: { filteredHealthIssues: MockHealthIssue[]; severityFilter: SeverityFilter; labels: ObservabilityLabels }) {
  if (filteredHealthIssues.length === 0 && severityFilter === "all") {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <HealthyShieldIllustration />
        <p className="mt-3 text-sm font-medium text-emerald-400/70">{labels.allSystemsHealthy}</p>
        <p className="mt-0.5 text-sm text-muted-dark">{labels.noIssuesDetected}</p>
      </div>
    );
  }
  if (filteredHealthIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-sm text-muted-dark">{labels.noSeverityIssues.replace("{severity}", labels.severity[severityFilter])}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
      <AnimatePresence mode="popLayout">
        {filteredHealthIssues.map((issue) => (
          <motion.div key={issue.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} layout>
            <PerformanceHealthIssueRow issue={issue} labels={labels} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
