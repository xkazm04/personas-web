"use client";

import { motion } from "framer-motion";
import { Layers3, FileText, CheckCircle2, Loader2 } from "lucide-react";

/* ── Variant B: Batch pipeline — queue + structured extraction result ── */

interface BatchItem {
  name: string;
  progress: number;
  status: "done" | "processing" | "queued";
  engine: string;
}

const QUEUE: BatchItem[] = [
  { name: "invoice-2026-0412.pdf", progress: 100, status: "done", engine: "Claude" },
  { name: "receipt-lunch-meeting.jpg", progress: 100, status: "done", engine: "Claude" },
  { name: "contract-nda-v3.pdf", progress: 62, status: "processing", engine: "Gemini" },
  { name: "passport-scan.png", progress: 0, status: "queued", engine: "Claude" },
  { name: "tax-form-W9.pdf", progress: 0, status: "queued", engine: "Claude" },
];

const EXTRACTED = [
  { key: "vendor", value: "Acme Corp" },
  { key: "invoice_number", value: "2026-0412" },
  { key: "date", value: "2026-04-12" },
  { key: "total", value: "$4,280.00", highlight: true },
  { key: "due_date", value: "2026-05-12" },
  { key: "line_items", value: "14 entries" },
];

function statusColor(status: BatchItem["status"]) {
  if (status === "done") return "#34d399";
  if (status === "processing") return "#fbbf24";
  return "#64748b";
}

export default function OcrBatch() {
  return (
    <div className="grid md:grid-cols-[1fr_1fr] gap-4 p-5">
      {/* Queue */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-base font-mono uppercase tracking-widest text-foreground/65">
          <Layers3 className="h-4 w-4" />
          Batch queue · 5 docs
        </div>
        <div className="space-y-2">
          {QUEUE.map((item, i) => {
            const color = statusColor(item.status);
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2.5"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-foreground/60 shrink-0" />
                    <span className="text-base font-mono text-foreground/90 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.status === "done" && (
                      <CheckCircle2
                        className="h-4 w-4"
                        style={{ color }}
                      />
                    )}
                    {item.status === "processing" && (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        style={{ color }}
                      />
                    )}
                    <span
                      className="text-base font-mono uppercase tracking-widest"
                      style={{ color }}
                    >
                      {item.engine}
                    </span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-foreground/[0.05] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Extracted structured data */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-base font-mono uppercase tracking-widest text-foreground/65">
          <FileText className="h-4 w-4" />
          Extracted · invoice-2026-0412
        </div>
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/[0.04] overflow-hidden">
          <div className="border-b border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2 flex items-center justify-between">
            <span className="text-base font-mono text-amber-300">
              structured.json
            </span>
            <span className="text-base font-mono text-brand-emerald">
              98% confident
            </span>
          </div>
          <div className="p-3 font-mono text-base space-y-1">
            {EXTRACTED.map((e, i) => (
              <motion.div
                key={e.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-foreground/55">{e.key}:</span>
                <span
                  className={
                    e.highlight
                      ? "text-amber-300 font-bold"
                      : "text-foreground/90"
                  }
                >
                  {e.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
