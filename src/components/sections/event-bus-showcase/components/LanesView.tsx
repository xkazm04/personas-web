"use client";

import { motion } from "framer-motion";

interface LaneMetric {
  id: string;
  producer: string;
  consumer: string;
  queueDepth: number;
  latencyMs: number;
  eps: number;
  color: string;
}

export default function LanesView({ laneMetrics, inView }: { laneMetrics: LaneMetric[]; inView: boolean }) {
  return (
    <div className="space-y-3">
      {laneMetrics.map((lane, i) => {
        const depthRatio = Math.min(lane.queueDepth / 50, 1);
        const latencyRatio = Math.min(lane.latencyMs / 600, 1);
        return (
          <motion.div
            key={lane.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="rounded-xl border border-white/8 bg-white/2 px-3 py-3 md:px-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-base font-mono text-foreground/80">
                <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.producer}</span>
                <span className="text-muted">→</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.consumer}</span>
              </div>
              <div className="flex items-center gap-2 text-base font-mono text-muted">
                <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.eps} msgs/s</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">{lane.latencyMs} ms</span>
              </div>
            </div>

            <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-white/4">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.max(depthRatio * 100, 8)}%`,
                  background: `linear-gradient(90deg, ${lane.color}66, color-mix(in srgb, var(--brand-cyan) 60%, transparent))`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(depthRatio * 100, 8)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.div
                className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: lane.color, boxShadow: `0 0 10px ${lane.color}` }}
                animate={inView ? { x: ["0%", "2600%"] } : { x: "0%" }}
                transition={{ duration: 2.8 + i * 0.35, repeat: inView ? Infinity : 0, ease: "linear" }}
              />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-base font-mono text-muted">
              <div className="rounded-lg border border-white/8 bg-white/2 px-2 py-1">
                Waiting: <span className="text-foreground/80">{lane.queueDepth}</span>
              </div>
              <div className="rounded-lg border border-white/8 bg-white/2 px-2 py-1">
                Delivery time: <span className="text-foreground/80">{Math.round(latencyRatio * 100)}%</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
