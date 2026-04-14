"use client";

import { motion } from "framer-motion";
import {
  Folder,
  FileText,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

/* ── Variant A: Vault Browser — mirrors sub_browse ── */
/* Left: folder tree · Right: markdown preview */

interface TreeItem {
  name: string;
  isDir: boolean;
  depth: number;
  open?: boolean;
  active?: boolean;
}

const TREE: TreeItem[] = [
  { name: "daily", isDir: true, depth: 0, open: true },
  { name: "2026-04-12.md", isDir: false, depth: 1, active: true },
  { name: "2026-04-11.md", isDir: false, depth: 1 },
  { name: "2026-04-10.md", isDir: false, depth: 1 },
  { name: "projects", isDir: true, depth: 0, open: true },
  { name: "personas-web.md", isDir: false, depth: 1 },
  { name: "dashboard.md", isDir: false, depth: 1 },
  { name: "people", isDir: true, depth: 0 },
  { name: "reading", isDir: true, depth: 0 },
];

export default function ObsidianBrowser() {
  return (
    <div className="p-5">
      <div className="grid md:grid-cols-[240px_1fr] gap-3">
        {/* Tree pane */}
        <div className="rounded-xl border border-purple-400/20 bg-purple-500/[0.04] overflow-hidden">
          <div className="border-b border-foreground/[0.08] px-3 py-2 flex items-center gap-2">
            <Folder className="h-4 w-4 text-purple-300" />
            <span className="text-base font-mono uppercase tracking-widest text-foreground/70 font-semibold">
              ~/obsidian/work
            </span>
          </div>
          <div className="p-2">
            <div className="flex items-center gap-1.5 rounded-md bg-foreground/[0.02] px-2 py-1.5 mb-2">
              <Search className="h-4 w-4 text-foreground/55" />
              <span className="text-base font-mono text-foreground/55">
                Filter files…
              </span>
            </div>
            <div className="space-y-0.5">
              {TREE.map((item, i) => (
                <motion.div
                  key={`${item.depth}-${item.name}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 cursor-default ${
                    item.active
                      ? "bg-purple-500/15 text-purple-200"
                      : "text-foreground/80 hover:bg-foreground/[0.04]"
                  }`}
                  style={{ paddingLeft: 8 + item.depth * 14 }}
                >
                  {item.isDir ? (
                    <>
                      {item.open ? (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground/55" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground/55" />
                      )}
                      <Folder className="h-4 w-4 shrink-0 text-foreground/60" />
                    </>
                  ) : (
                    <>
                      <span className="w-3.5" />
                      <FileText
                        className="h-4 w-4 shrink-0"
                        style={{
                          color: item.active ? "#c084fc" : "rgba(255,255,255,0.55)",
                        }}
                      />
                    </>
                  )}
                  <span className="text-base font-mono truncate">
                    {item.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Markdown preview pane */}
        <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.015] overflow-hidden">
          <div className="border-b border-foreground/[0.08] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-300" />
              <span className="text-base font-mono text-foreground/85">
                daily/2026-04-12.md
              </span>
            </div>
            <span className="text-base font-mono text-foreground/55">
              12 backlinks
            </span>
          </div>
          <div className="p-5 space-y-3">
            <motion.h3
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-foreground"
            >
              2026-04-12
            </motion.h3>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-base font-mono text-foreground/85 leading-relaxed space-y-2"
            >
              <p>
                Shipped the persona matrix redesign today.{" "}
                <span className="text-purple-300 underline decoration-purple-400/40 decoration-dashed">
                  [[personas-web]]
                </span>{" "}
                now uses a 3×3 layout with Leonardo illustrations.
              </p>
              <p className="text-foreground/70">
                Next up: plugins section needs work — especially{" "}
                <span className="text-purple-300 underline decoration-purple-400/40 decoration-dashed">
                  [[dev-tools]]
                </span>{" "}
                and{" "}
                <span className="text-purple-300 underline decoration-purple-400/40 decoration-dashed">
                  [[research-lab]]
                </span>
                .
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="rounded-lg border border-purple-400/25 bg-purple-500/[0.06] px-3 py-2"
            >
              <div className="text-base font-mono uppercase tracking-widest text-purple-300/80 mb-1 font-bold">
                checklist
              </div>
              <div className="space-y-1 font-mono text-base">
                <div className="flex items-center gap-2 text-foreground/85">
                  <span className="text-brand-emerald">✓</span> Matrix redesign
                </div>
                <div className="flex items-center gap-2 text-foreground/85">
                  <span className="text-brand-emerald">✓</span> Leonardo tiles
                </div>
                <div className="flex items-center gap-2 text-foreground/60">
                  <span className="text-foreground/40">○</span> Plugins redesign
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-1.5 pt-2"
            >
              {["#daily", "#shipping", "#personas"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-purple-500/10 border border-purple-400/25 px-2 py-0.5 text-base font-mono text-purple-200"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="mt-4 pt-3 border-t border-foreground/[0.06] flex items-center justify-between text-base font-mono uppercase tracking-widest text-foreground/60">
        <span>
          Vault:{" "}
          <span className="text-purple-300 font-semibold">~/obsidian/work</span>
        </span>
        <span>
          <span className="text-purple-300 font-semibold tabular-nums">
            4,281
          </span>{" "}
          notes ·{" "}
          <span className="text-purple-300 font-semibold tabular-nums">
            18,904
          </span>{" "}
          backlinks
        </span>
      </div>
    </div>
  );
}
