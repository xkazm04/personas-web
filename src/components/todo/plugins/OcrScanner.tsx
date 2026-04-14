"use client";

import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";

/* ── Variant A: Document scan + engine comparison ── */

const ENGINES = [
  { label: "Claude", acc: 98, color: "#D97706" },
  { label: "Gemini", acc: 94, color: "#3B82F6" },
];

export default function OcrScanner() {
  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4 p-5">
      <div className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] p-4 relative overflow-hidden">
        <div className="space-y-1.5">
          {[0.9, 0.7, 0.85, 0.6, 0.75, 0.88, 0.5, 0.7].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-foreground/[0.12]"
              style={{ width: `${w * 100}%` }}
            />
          ))}
        </div>
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 200, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(251,191,36,0.6), transparent)",
            boxShadow: "0 0 12px rgba(251,191,36,0.4)",
          }}
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-base font-mono text-amber-300">
          <ScanLine className="h-4 w-4" /> scanning
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3 text-base font-mono uppercase tracking-widest text-foreground/65">
          <ScanLine className="h-4 w-4" />
          Extracted text · engine comparison
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ENGINES.map((e) => (
            <div
              key={e.label}
              className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-semibold text-foreground">
                  {e.label}
                </span>
                <span
                  className="text-base font-mono tabular-nums font-semibold"
                  style={{ color: e.color }}
                >
                  {e.acc}%
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-foreground/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${e.acc}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: e.color }}
                />
              </div>
              <div className="mt-2 text-base font-mono text-foreground/55 uppercase tracking-widest">
                accuracy
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-foreground/[0.06] bg-background/30 px-3 py-2 font-mono text-base text-foreground/75 leading-relaxed">
          <span className="text-foreground/55">&gt;</span> Invoice #2026-0412 ·
          Acme Corp · Total{" "}
          <span className="text-amber-400">$4,280.00</span> · Due 2026-05-12
        </div>
      </div>
    </div>
  );
}
