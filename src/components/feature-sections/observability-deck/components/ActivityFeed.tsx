"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ActivityRow } from "../types";

export default function ActivityFeed({
  activity,
  newRow,
}: {
  activity: ActivityRow[];
  newRow: string | null;
}) {
  return (
    <div className="px-5 py-3 space-y-1 h-[180px] overflow-y-auto scrollbar-hide">
      <AnimatePresence mode="popLayout" initial={false}>
        {activity.map((row) => (
          <motion.div
            key={row.time + row.agent + row.event}
            layout
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className={`flex items-center justify-between text-base font-mono py-1 rounded px-1 transition-colors duration-500 ${
              newRow === row.time ? "bg-brand-cyan/5" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-foreground/60 w-14">{row.time}</span>
              <span className="text-foreground/90 w-24 truncate font-medium">
                {row.agent}
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span style={{ color: `${row.color}cc` }}>{row.event}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-foreground/60">
              <span className="w-10 text-right">{row.duration}</span>
              <span className="w-10 text-right">{row.cost}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
