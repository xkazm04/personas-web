"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ChevronDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type {
  CompetitorId,
  Competitor,
  ComparisonCategory,
  ComparisonRow,
} from "@/data/comparison";
import { COMPETITORS, COMPARISON_CATEGORIES } from "@/data/comparison";

/* ── Cell value renderer ──────────────────────────────────────────── */

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-emerald/15">
          <Check className="h-3.5 w-3.5 text-brand-emerald" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
          <X className="h-3.5 w-3.5 text-muted" />
        </div>
      </div>
    );
  }
  return (
    <span className="text-xs sm:text-sm text-muted text-center block leading-tight">
      {value}
    </span>
  );
}

/* ── Competitor column header ─────────────────────────────────────── */

function CompetitorHeader({
  competitor,
  isPersonas,
}: {
  competitor: Competitor;
  isPersonas: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      {isPersonas ? (
        <Image
          src="/imgs/logo.png"
          alt="Personas"
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
        />
      ) : (
        <div
          className="flex h-6 w-6 items-center justify-center rounded"
          style={{ backgroundColor: `${competitor.color}15` }}
        >
          <span
            className="text-xs font-bold"
            style={{ color: competitor.color }}
          >
            {competitor.name[0]}
          </span>
        </div>
      )}
      <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-full">
        {competitor.name}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate max-w-full ${
          isPersonas
            ? "border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald"
            : "border border-white/10 bg-white/5 text-muted"
        }`}
      >
        {competitor.pricing}
      </span>
    </div>
  );
}

/* ── Collapsible category ─────────────────────────────────────────── */

function CategoryBlock({
  category,
  activeCompetitors,
  defaultOpen,
}: {
  category: ComparisonCategory;
  activeCompetitors: Competitor[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colCount = activeCompetitors.length + 1;

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 sm:px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {category.name}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="pb-2">
          {category.features.map((row) => (
            <FeatureRow
              key={row.label}
              row={row}
              activeCompetitors={activeCompetitors}
              colCount={colCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Single feature row ───────────────────────────────────────────── */

function FeatureRow({
  row,
  activeCompetitors,
  colCount,
}: {
  row: ComparisonRow;
  activeCompetitors: Competitor[];
  colCount: number;
}) {
  return (
    <div
      className={`grid items-center gap-2 px-4 sm:px-6 py-3 transition-colors ${
        row.highlight ? "bg-brand-cyan/[0.03]" : "hover:bg-white/[0.015]"
      }`}
      style={{
        gridTemplateColumns: `minmax(140px, 1.5fr) repeat(${colCount - 1}, minmax(80px, 1fr))`,
      }}
    >
      <span
        className={`text-xs sm:text-sm ${
          row.highlight ? "text-foreground font-medium" : "text-muted"
        }`}
      >
        {row.label}
      </span>
      {activeCompetitors.map((comp) => (
        <div
          key={comp.id}
          className={
            comp.id === "personas"
              ? "relative before:absolute before:inset-y-[-12px] before:inset-x-[-8px] before:rounded-md before:bg-brand-cyan/[0.03] before:pointer-events-none"
              : ""
          }
        >
          <CellValue value={row.values[comp.id]} />
        </div>
      ))}
    </div>
  );
}

/* ── Competitor toggle chips ──────────────────────────────────────── */

function CompetitorChips({
  activeIds,
  onToggle,
}: {
  activeIds: Set<CompetitorId>;
  onToggle: (id: CompetitorId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {COMPETITORS.map((comp) => {
        const active = activeIds.has(comp.id);
        const isPersonas = comp.id === "personas";

        return (
          <button
            key={comp.id}
            onClick={() => !isPersonas && onToggle(comp.id)}
            disabled={isPersonas}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isPersonas
                ? "border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan cursor-default"
                : active
                  ? "border border-white/15 bg-white/8 text-foreground hover:bg-white/12"
                  : "border border-white/6 bg-white/2 text-muted hover:border-white/10 hover:text-foreground"
            }`}
          >
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: active || isPersonas ? comp.color : "rgba(255,255,255,0.15)",
              }}
            />
            {comp.name}
            {!isPersonas && (
              <span className="text-xs text-muted">
                {active ? "\u2713" : "+"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Main ComparisonTable ─────────────────────────────────────────── */

export default function ComparisonTable() {
  const [activeIds, setActiveIds] = useState<Set<CompetitorId>>(
    () => new Set<CompetitorId>(["personas", "crewai", "langchain", "n8n", "autogen"]),
  );

  const toggleCompetitor = (id: CompetitorId) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 2) return prev; // keep at least Personas + 1
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const activeCompetitors = COMPETITORS.filter((c) => activeIds.has(c.id));
  const colCount = activeCompetitors.length + 1; // +1 for feature label

  return (
    <motion.div variants={staggerContainer}>
      {/* Competitor toggle chips */}
      <motion.div variants={fadeUp} className="mb-8">
        <CompetitorChips activeIds={activeIds} onToggle={toggleCompetitor} />
      </motion.div>

      {/* Table */}
      <motion.div
        variants={fadeUp}
        className="overflow-x-auto rounded-2xl border border-white/8 bg-black/40 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.3)]"
      >
        {/* Column headers */}
        <div
          className="grid items-center gap-2 px-4 sm:px-6 py-5 border-b border-white/8 bg-white/[0.02]"
          style={{
            gridTemplateColumns: `minmax(140px, 1.5fr) repeat(${colCount - 1}, minmax(80px, 1fr))`,
          }}
        >
          <div className="text-sm font-medium text-muted">Feature</div>
          {activeCompetitors.map((comp) => (
            <CompetitorHeader
              key={comp.id}
              competitor={comp}
              isPersonas={comp.id === "personas"}
            />
          ))}
        </div>

        {/* Category sections */}
        {COMPARISON_CATEGORIES.map((cat, i) => (
          <CategoryBlock
            key={cat.name}
            category={cat}
            activeCompetitors={activeCompetitors}
            defaultOpen={i < 3}
          />
        ))}
      </motion.div>

      {/* Competitor type legend */}
      <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-4 justify-center">
        {activeCompetitors
          .filter((c) => c.id !== "personas")
          .map((comp) => (
            <a
              key={comp.id}
              href={comp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: comp.color }}
              />
              {comp.name}
              <span className="text-muted/60">{comp.type}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
      </motion.div>
    </motion.div>
  );
}
