"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import { CASE_COLOR, CASE_IDS } from "../shared/cases";
import { FLIGHT_S, TRAVEL, shardPath } from "./geometry";

/** Fraction of a shard's path at which it leaves the prism and takes its fix's colour. */
const DISPERSE = 0.5;

/**
 * One failure in flight: a rose shard along the input beam that comes out of
 * the prism in its fix's colour. Moving, it flies the whole path once (it is
 * keyed by its tick, so each failure is a fresh element); still, it rests at
 * a spot set by its age so the frozen frame shows the stream mid-flow.
 */
export default function Shard({ row, age, running }: { row: number; age: number; running: boolean }) {
  const color = BRAND_VAR[CASE_COLOR[CASE_IDS[row]]];
  const rest = (age + 0.5) / TRAVEL;
  const after = rest > DISPERSE;
  return (
    <motion.g
      style={{ offsetPath: `path("${shardPath(row)}")`, offsetRotate: "auto" }}
      initial={{ offsetDistance: running ? "0%" : `${rest * 100}%` }}
      animate={running ? { offsetDistance: "100%", opacity: [1, 1, 0] } : { offsetDistance: `${rest * 100}%`, opacity: 1 }}
      transition={running ? { duration: FLIGHT_S, ease: "linear", opacity: { duration: FLIGHT_S, times: [0, 0.94, 1] } } : { duration: 0 }}
    >
      {[BRAND_VAR.rose, color].map((fill, k) => {
        const on = k === 0 ? !after : after;
        return (
          <motion.g
            key={k}
            initial={{ opacity: running ? 1 - k : on ? 1 : 0 }}
            animate={running ? { opacity: k === 0 ? [1, 1, 0, 0] : [0, 0, 1, 1] } : { opacity: on ? 1 : 0 }}
            transition={running ? { duration: FLIGHT_S, times: [0, DISPERSE - 0.03, DISPERSE, 1] } : { duration: 0 }}
          >
            <circle r={12} fill={fill} filter="url(#hp-glow)" opacity={0.8} />
            <path d="M -10 0 L 0 -5.5 L 10 0 L 0 5.5 Z" fill={fill} stroke="var(--foreground)" strokeOpacity={0.45} />
          </motion.g>
        );
      })}
    </motion.g>
  );
}
