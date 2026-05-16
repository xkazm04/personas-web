import { AnimatePresence, motion } from "framer-motion";

export function ScenarioTrigger({ id, trigger }: { id: string; trigger: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-3xl rounded-xl border border-glass bg-white/[0.02] px-4 py-3 text-center backdrop-blur-sm"
      >
        <span className="text-base font-mono uppercase tracking-wider text-muted-dark/60">
          Scenario trigger
        </span>
        <p className="mt-1 text-base text-muted leading-relaxed">{trigger}</p>
      </motion.div>
    </AnimatePresence>
  );
}
