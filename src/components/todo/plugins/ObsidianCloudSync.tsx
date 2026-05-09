"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Cloud,
  ArrowUpFromLine,
  ArrowDownToLine,
  HardDrive,
  CheckCircle2,
} from "lucide-react";

/* ── Variant B: Cloud Sync Dashboard — mirrors sub_cloud ── */

interface LogEntry {
  time: string;
  kind: "push" | "pull" | "idle";
  text: string;
}

const BASE_LOG: LogEntry[] = [
  { time: "09:14:22", kind: "push", text: "pushed 12 notes · daily/" },
  { time: "09:14:18", kind: "push", text: "pushed 3 notes · projects/" },
  { time: "09:12:01", kind: "pull", text: "pulled 1 note · reading/agentic-ui.md" },
  { time: "09:10:44", kind: "push", text: "pushed 8 notes · people/" },
  { time: "09:08:17", kind: "idle", text: "idle — no changes detected" },
];

const KIND_COLOR: Record<LogEntry["kind"], string> = {
  push: "#34d399",
  pull: "#06b6d4",
  idle: "#64748b",
};

export default function ObsidianCloudSync() {
  const reduced = useReducedMotion() ?? false;
  const [pushPulse, setPushPulse] = useState(false);

  /* Gently pulse the push button to show it's "live" */
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setPushPulse((v) => !v);
    }, 3200);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="p-5 grid md:grid-cols-[1.3fr_1fr] gap-4">
      {/* Left: sync actions + stats */}
      <div className="space-y-3">
        {/* Primary sync card */}
        <div className="rounded-xl border border-purple-400/30 bg-purple-500/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20">
                <Cloud className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <div className="text-base font-semibold text-foreground leading-tight">
                  Google Drive
                </div>
                <div className="flex items-center gap-1.5 text-base font-mono text-foreground/65">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald animate-pulse" />
                  connected · alex@acme.co
                </div>
              </div>
            </div>
            <span className="text-base font-mono text-foreground/60">
              last sync · 32s ago
            </span>
          </div>

          {/* Push / Pull buttons */}
          <div className="grid grid-cols-2 gap-2">
            <motion.div
              animate={
                pushPulse
                  ? {
                      boxShadow: [
                        "0 0 0 rgba(168,85,247,0)",
                        "0 0 24px rgba(168,85,247,0.35)",
                        "0 0 0 rgba(168,85,247,0)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 2.4, ease: "easeInOut" }}
              className="flex items-center justify-center gap-2 rounded-lg border border-purple-400/40 bg-purple-500/15 px-3 py-2.5"
            >
              <ArrowUpFromLine className="h-4 w-4 text-purple-200" />
              <span className="text-base font-mono font-bold text-purple-200 uppercase tracking-widest">
                Push
              </span>
            </motion.div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-2.5">
              <ArrowDownToLine className="h-4 w-4 text-cyan-200" />
              <span className="text-base font-mono font-bold text-cyan-200 uppercase tracking-widest">
                Pull
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Storage", value: "142 MB", color: "#a855f7" },
            { label: "Synced", value: "4,281", color: "#06b6d4" },
            { label: "Conflicts", value: "0", color: "#34d399" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2.5 text-center"
            >
              <HardDrive
                className="h-4 w-4 mx-auto mb-1"
                style={{ color: s.color }}
              />
              <div
                className="text-xl font-mono font-bold tabular-nums"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-base font-mono uppercase tracking-widest text-foreground/60">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: sync log */}
      <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] overflow-hidden flex flex-col">
        <div className="border-b border-foreground/[0.08] px-3 py-2 flex items-center justify-between">
          <span className="text-base font-mono uppercase tracking-widest text-foreground/70 font-semibold">
            sync.log
          </span>
          <span className="flex items-center gap-1.5 text-base font-mono text-brand-emerald">
            <CheckCircle2 className="h-3.5 w-3.5" />
            healthy
          </span>
        </div>
        <div className="p-3 flex-1 space-y-1 font-mono text-base">
          {BASE_LOG.map((entry, i) => {
            const color = KIND_COLOR[entry.kind];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-start gap-2"
              >
                <span className="text-foreground/60 shrink-0">
                  {entry.time}
                </span>
                <span
                  className="shrink-0 uppercase tracking-widest font-bold"
                  style={{ color }}
                >
                  {entry.kind}
                </span>
                <span className="text-foreground/75 truncate">
                  {entry.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
