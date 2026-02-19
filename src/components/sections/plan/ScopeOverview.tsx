"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";

const scopeData = [
  {
    phase: 12,
    name: "Cloud Integration",
    rust: 800,
    ts: 400,
    files: 10,
    complexity: "High",
    complexityColor: "text-brand-rose",
    accentColor: "from-cyan-500/40 to-cyan-500/15",
    barColor: "bg-brand-cyan",
  },
  {
    phase: 13,
    name: "Web App",
    rust: 0,
    ts: 3000,
    files: 25,
    complexity: "Medium",
    complexityColor: "text-brand-amber",
    accentColor: "from-purple-500/40 to-purple-500/15",
    barColor: "bg-brand-purple",
  },
  {
    phase: 14,
    name: "Cloud Evolution",
    rust: 0,
    ts: 500,
    files: 5,
    complexity: "Medium",
    complexityColor: "text-brand-amber",
    accentColor: "from-emerald-500/40 to-emerald-500/15",
    barColor: "bg-brand-emerald",
  },
  {
    phase: 15,
    name: "Distribution",
    rust: 100,
    ts: 200,
    files: 5,
    complexity: "Low",
    complexityColor: "text-brand-emerald",
    accentColor: "from-amber-500/40 to-amber-500/15",
    barColor: "bg-brand-amber",
  },
];

const maxTs = Math.max(...scopeData.map((d) => d.ts));
const maxRust = Math.max(...scopeData.map((d) => d.rust));
const maxLoc = Math.max(maxTs, maxRust);

const totals = {
  rust: scopeData.reduce((s, d) => s + d.rust, 0),
  ts: scopeData.reduce((s, d) => s + d.ts, 0),
  files: scopeData.reduce((s, d) => s + d.files, 0),
};

export default function ScopeOverview() {
  return (
    <SectionWrapper id="scope">
      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-amber/20 bg-brand-amber/5 px-3.5 py-1 text-[11px] font-medium tracking-wider uppercase text-brand-amber/70 font-mono mb-6">
          Scope
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Estimated <GradientText>effort breakdown</GradientText>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted leading-relaxed">
          Lines of code, file counts, and complexity ratings for each remaining phase.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-brand-amber/15 to-transparent" />
      </motion.div>

      {/* Summary stats */}
      <motion.div variants={fadeUp} className="mt-14 flex items-center justify-center gap-8 md:gap-16">
        {[
          { value: `~${(totals.rust + totals.ts).toLocaleString()}`, label: "Total LOC" },
          { value: `~${totals.files}`, label: "New files" },
          { value: "4", label: "Phases" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold tracking-tight md:text-3xl bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="mt-1 text-[11px] text-muted-dark font-mono tracking-wider uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table with bar visualization */}
      <motion.div variants={fadeUp} className="mt-14 mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.015] to-transparent overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_100px_1fr_80px_80px] gap-4 px-6 py-3 border-b border-white/[0.03] text-[10px] font-mono tracking-wider uppercase text-muted-dark/50">
            <span>Phase</span>
            <span className="text-right">Rust LOC</span>
            <span>TypeScript LOC</span>
            <span className="text-right">Files</span>
            <span className="text-right">Level</span>
          </div>

          {/* Data rows */}
          {scopeData.map((row, i) => (
            <motion.div
              key={row.phase}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="group grid grid-cols-[1fr_100px_1fr_80px_80px] gap-4 items-center px-6 py-4 border-b border-white/[0.02] last:border-0 transition-colors duration-300 hover:bg-white/[0.01]"
            >
              {/* Phase name */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-dark/40 w-5">{row.phase}</span>
                <span className="text-sm font-medium">{row.name}</span>
              </div>

              {/* Rust LOC */}
              <div className="text-right text-xs font-mono text-muted-dark tabular-nums">
                {row.rust > 0 ? `~${row.rust}` : "—"}
              </div>

              {/* TS LOC with bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${row.accentColor}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(row.ts / maxLoc) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-dark tabular-nums w-12 text-right">
                  ~{row.ts.toLocaleString()}
                </span>
              </div>

              {/* Files */}
              <div className="text-right text-xs font-mono text-muted-dark tabular-nums">
                ~{row.files}
              </div>

              {/* Complexity */}
              <div className={`text-right text-xs font-mono ${row.complexityColor}`}>
                {row.complexity}
              </div>
            </motion.div>
          ))}

          {/* Totals row */}
          <div className="grid grid-cols-[1fr_100px_1fr_80px_80px] gap-4 items-center px-6 py-3 bg-white/[0.01] border-t border-white/[0.04]">
            <span className="text-xs font-semibold text-muted">Total</span>
            <span className="text-right text-xs font-mono text-muted tabular-nums">~{totals.rust.toLocaleString()}</span>
            <div className="flex justify-end">
              <span className="text-xs font-mono text-muted tabular-nums">~{totals.ts.toLocaleString()}</span>
            </div>
            <span className="text-right text-xs font-mono text-muted tabular-nums">~{totals.files}</span>
            <span />
          </div>
        </div>
      </motion.div>

      {/* Note */}
      <motion.div variants={fadeUp} className="mt-8 text-center">
        <p className="text-xs text-muted-dark/60 font-mono">
          Phases 12 + 13 can run in parallel — total wall-clock time is shorter than sequential.
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
