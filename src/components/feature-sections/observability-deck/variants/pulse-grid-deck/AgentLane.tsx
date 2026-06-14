import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity } from "lucide-react";

import { EVENT_META } from "./pulseEventMeta";
import { buildSparkline, Sparkline } from "./Sparkline";
import type { Stats } from "./pulseGridTypes";

export function AgentLane({
  agent,
  color,
  stats,
  filterPrefix,
}: {
  agent: string;
  color: string;
  stats: Stats[string] | undefined;
  filterPrefix: string | null;
}) {
  const reduced = useReducedMotion() ?? false;
  const pulses = useMemo(() => {
    const raw = stats?.pulses ?? [];
    return filterPrefix
      ? raw.filter((pulse) => pulse.eventType.startsWith(filterPrefix))
      : raw;
  }, [stats, filterPrefix]);

  const spark = useMemo(() => buildSparkline(stats?.durations ?? []), [stats]);
  const totalCost = stats?.totalCost ?? 0;
  const pulseCount = stats?.pulseCount ?? 0;
  const latest = pulses[0];
  const LatestIcon = latest ? EVENT_META[latest.eventType].icon : Activity;
  const latestMeta = latest ? EVENT_META[latest.eventType] : null;

  return (
    <div className="grid grid-cols-[132px_auto_1fr_auto] items-center gap-3 px-5 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <motion.span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
          animate={
            latest && !reduced
              ? { opacity: [0.4, 1, 0.4], scale: [0.85, 1.15, 0.85] }
              : { opacity: latest ? 1 : 0.35, scale: 1 }
          }
          transition={{ duration: 1.2, repeat: latest && !reduced ? Infinity : 0 }}
        />
        <span className="truncate text-base font-mono font-semibold text-foreground">
          {agent}
        </span>
      </div>

      <div
        className="flex h-7 min-w-[60px] items-center justify-center gap-1.5 rounded-full border px-2 text-base font-mono uppercase tracking-widest font-semibold"
        style={{
          borderColor: latestMeta ? latestMeta.color : "rgba(127,127,127,0.3)",
          backgroundColor: latestMeta ? `${latestMeta.color}28` : "transparent",
          color: latestMeta ? latestMeta.color : "var(--muted-foreground, #888)",
        }}
      >
        <LatestIcon className="h-3.5 w-3.5" />
        {latestMeta?.short ?? "idle"}
      </div>

      <div className="relative h-7 flex items-center gap-1.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {pulses.map((pulse, index) => {
            const meta = EVENT_META[pulse.eventType];
            const Icon = meta.icon;
            return (
              <motion.span
                key={pulse.id}
                initial={{ opacity: 0, scale: 0.4, x: 14 }}
                animate={{ opacity: 1 - index * 0.12, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.3 }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border"
                style={{
                  borderColor: meta.color,
                  backgroundColor: `${meta.color}25`,
                  color: meta.color,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        <Sparkline values={spark} color={color} />
        <div className="flex flex-col items-end text-base font-mono leading-tight">
          <span className="tabular-nums text-foreground/90">{pulseCount}</span>
          <span className="tabular-nums text-foreground/60">
            ${totalCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
