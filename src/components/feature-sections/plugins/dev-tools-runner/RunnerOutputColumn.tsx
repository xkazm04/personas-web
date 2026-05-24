import { motion } from "framer-motion";
import { Loader2, Terminal } from "lucide-react";

import { OUTPUT_LINES } from "./devToolsRunnerData";

export function RunnerOutputColumn({
  visibleOutputCount,
  tick,
  reduced,
}: {
  visibleOutputCount: number;
  tick: number;
  reduced: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-base font-mono uppercase tracking-widest text-foreground/65">
        <Terminal className="h-4 w-4" />
        Live output - cargo build --release
      </div>
      <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/[0.04] overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-foreground/[0.08] px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-rose-400/60" />
          <div className="h-2 w-2 rounded-full bg-amber-400/60" />
          <div className="h-2 w-2 rounded-full bg-emerald-400/60" />
          <span className="ml-2 text-base font-mono text-foreground/60">
            output.stream
          </span>
          <span className="ml-auto flex items-center gap-1 text-base font-mono text-cyan-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            streaming
          </span>
        </div>
        <div className="p-3 h-[220px] overflow-y-auto scrollbar-hide font-mono text-base space-y-0.5">
          {OUTPUT_LINES.slice(0, visibleOutputCount).map((line, index) => (
            <motion.div
              key={`${tick}-${index}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: line.color }}
            >
              {line.text}
            </motion.div>
          ))}
          {visibleOutputCount > 0 && visibleOutputCount < OUTPUT_LINES.length && (
            <motion.span
              initial={{ opacity: 1 }}
              whileInView={reduced ? undefined : { opacity: [0.55, 1, 0.55] }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block text-cyan-300"
            >
              |
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
