import { AnimatePresence, motion } from "framer-motion";
import { GitBranch, Sparkles, Zap } from "lucide-react";
import type { scenarios } from "../data";
import Track from "./Track";
import ComparisonSummary from "./ComparisonSummary";

type Scenario = (typeof scenarios)[number];

export function TimelineRaceBody({
  scenario,
  isPlaying,
  showResults,
}: {
  scenario: Scenario;
  isPlaying: boolean;
  showResults: boolean;
}) {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <RaceTrack id={`wf-${scenario.id}`} steps={scenario.workflow.steps} result={scenario.workflow.result} totalMs={scenario.workflow.totalMs} isPlaying={isPlaying} showResults={showResults} label="Workflow" icon={GitBranch} isWorkflow />
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-brand-rose/20 via-white/5 to-brand-emerald/20" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-glass-hover bg-background/80">
          <Zap className="h-3.5 w-3.5 text-brand-cyan" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-brand-rose/20 via-white/5 to-brand-emerald/20" />
      </div>
      <RaceTrack id={`ag-${scenario.id}`} steps={scenario.agent.steps} result={scenario.agent.result} totalMs={scenario.agent.totalMs} isPlaying={isPlaying} showResults={showResults} label="Agent" icon={Sparkles} />
      <ComparisonSummary scenario={scenario} showResults={showResults} />
    </div>
  );
}

function RaceTrack({
  id,
  steps,
  result,
  totalMs,
  isPlaying,
  showResults,
  label,
  icon,
  isWorkflow = false,
}: {
  id: string;
  steps: Scenario["workflow"]["steps"];
  result: Scenario["workflow"]["result"];
  totalMs: number;
  isPlaying: boolean;
  showResults: boolean;
  label: string;
  icon: React.ElementType;
  isWorkflow?: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
        <Track steps={steps} isWorkflow={isWorkflow} isActive={isPlaying} result={result} totalMs={totalMs} showResult={showResults} label={label} icon={icon} />
      </motion.div>
    </AnimatePresence>
  );
}
