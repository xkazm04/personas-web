"use client";

import { motion } from "framer-motion";
import { BookOpen, Database, ExternalLink, Plus, Tag } from "lucide-react";

/* ── Variant B: Literature sources board — mirrors sub_literature ── */

type SourceStatus = "to_read" | "reading" | "annotated" | "referenced";

interface Source {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  status: SourceStatus;
  citations: number;
  annotations: number;
  tags: string[];
}

const STATUS_STYLE: Record<SourceStatus, { label: string; color: string }> = {
  to_read: { label: "to read", color: "#64748b" },
  reading: { label: "reading", color: "#fbbf24" },
  annotated: { label: "annotated", color: "#06b6d4" },
  referenced: { label: "referenced", color: "#34d399" },
};

const SOURCES: Source[] = [
  {
    id: "1",
    title: "Lost in the middle: how language models use long contexts",
    authors: "Liu et al.",
    year: 2023,
    venue: "arXiv",
    status: "referenced",
    citations: 847,
    annotations: 18,
    tags: ["retrieval", "long-context"],
  },
  {
    id: "2",
    title: "Agentic evaluation benchmarks for LLM tool use",
    authors: "Park, Chen, Rao",
    year: 2024,
    venue: "ICLR",
    status: "annotated",
    citations: 312,
    annotations: 14,
    tags: ["agents", "eval"],
  },
  {
    id: "3",
    title: "Prompt injection taxonomy & defenses in agentic systems",
    authors: "Singh et al.",
    year: 2024,
    venue: "USENIX",
    status: "reading",
    citations: 209,
    annotations: 6,
    tags: ["security"],
  },
  {
    id: "4",
    title: "Self-healing workflows: retry, circuit-break, recover",
    authors: "Nakamura, Holt",
    year: 2023,
    venue: "SOSP",
    status: "to_read",
    citations: 84,
    annotations: 0,
    tags: ["reliability"],
  },
];

export default function ResearchSources() {
  return (
    <div className="p-5 space-y-3">
      {/* Search bar + stats */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2">
          <BookOpen className="h-4 w-4 text-foreground/55" />
          <span className="text-base font-mono text-foreground/55 flex-1">
            Search 101 sources · DOI, arXiv, Semantic Scholar
          </span>
          <button className="flex items-center gap-1.5 rounded-md border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-base font-mono text-blue-300">
            <Plus className="h-3.5 w-3.5" /> add
          </button>
        </div>
        <div className="flex items-center gap-3 text-base font-mono">
          <span className="flex items-center gap-1.5 text-foreground/70">
            <Database className="h-4 w-4" />
            <span className="text-foreground font-semibold tabular-nums">101</span>
            <span className="text-foreground/55">indexed</span>
          </span>
          <span className="flex items-center gap-1.5 text-foreground/70">
            <Tag className="h-4 w-4" />
            <span className="text-foreground font-semibold tabular-nums">42</span>
            <span className="text-foreground/55">annotated</span>
          </span>
        </div>
      </div>

      {/* Source cards — 2×2 grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {SOURCES.map((source, i) => {
          const status = STATUS_STYLE[source.status];
          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="group relative rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-4 overflow-hidden"
              style={{ borderLeft: `3px solid ${status.color}` }}
            >
              {/* Subtle accent wash */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${status.color}12, transparent 60%)`,
                }}
              />
              <div className="relative">
                {/* Status + venue */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="rounded-full border px-2 py-0.5 text-base font-mono uppercase tracking-widest"
                    style={{
                      borderColor: `${status.color}40`,
                      backgroundColor: `${status.color}12`,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </span>
                  <span className="text-base font-mono text-foreground/55">
                    {source.venue} · {source.year}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-base font-semibold text-foreground leading-snug mb-1.5">
                  {source.title}
                </h4>

                {/* Authors */}
                <div className="text-base font-mono text-foreground/65 mb-3">
                  {source.authors}
                </div>

                {/* Metrics + tags */}
                <div className="flex items-center justify-between pt-2 border-t border-foreground/[0.06]">
                  <div className="flex items-center gap-3 text-base font-mono text-foreground/60">
                    <span className="tabular-nums">
                      <span className="text-foreground/90 font-semibold">
                        {source.citations}
                      </span>{" "}
                      cites
                    </span>
                    <span className="tabular-nums">
                      <span className="text-foreground/90 font-semibold">
                        {source.annotations}
                      </span>{" "}
                      notes
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {source.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-base font-mono text-foreground/70"
                      >
                        #{tag}
                      </span>
                    ))}
                    <ExternalLink className="h-3.5 w-3.5 text-foreground/40 ml-1 group-hover:text-foreground/80 transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
