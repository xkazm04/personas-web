"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plug, Download, Plus } from "lucide-react";
import Image from "next/image";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import PrimaryCTA from "@/components/PrimaryCTA";
import { fadeUp } from "@/lib/animations";
import { connectors, categories, type Connector } from "@/data/connectors";

/* ── Human-friendly auth-type labels ── */

const authTypeLabels: Record<string, string> = {
  PAT: "Personal Access Token",
};

/** Return a friendly label for raw authType values (e.g. "PAT" → "Personal Access Token") */
function friendlyAuthType(raw: string): string {
  return authTypeLabels[raw] ?? raw;
}

/* ── Accent color mappings ── */

const accentStyles = {
  cyan: {
    active: "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.12)]",
    dot: "bg-brand-cyan",
  },
  purple: {
    active: "border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-[0_0_12px_rgba(168,85,247,0.12)]",
    dot: "bg-brand-purple",
  },
  emerald: {
    active: "border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald shadow-[0_0_12px_rgba(52,211,153,0.12)]",
    dot: "bg-brand-emerald",
  },
  amber: {
    active: "border-brand-amber/30 bg-brand-amber/10 text-brand-amber shadow-[0_0_12px_rgba(251,191,36,0.12)]",
    dot: "bg-brand-amber",
  },
} as const;

/* ── Connector Card ── */

function ConnectorCard({ connector: c, index, onClick }: { connector: Connector; index: number; onClick?: () => void }) {
  const categoryMeta = categories.find((cat) => cat.key === c.category);
  const iconName = c.icon ?? c.name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.03, 0.6), duration: 0.35 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.25 },
      }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-white/[0.008] transition-[border-color] duration-500 hover:border-white/[0.12] cursor-pointer will-change-transform"
    >
      {/* Background icon — covers the whole card */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <Image
          src={`/tools/${iconName}.svg`}
          alt=""
          width={120}
          height={120}
          className="opacity-[0.04] transition-[opacity,transform] duration-500 group-hover:opacity-[0.12] group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Top shine line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Bottom brand accent line */}
      <div
        className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Hover glow — top-right corner */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: `${c.color}15` }}
      />

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Name */}
        <h3 className="text-[15px] font-semibold leading-tight">{c.label}</h3>

        {/* Category */}
        <span className="mt-1 inline-block text-[10px] font-mono uppercase tracking-wider text-muted-dark">
          {categoryMeta?.label ?? c.category}
        </span>

        {/* Summary */}
        <p className="mt-2.5 text-xs leading-relaxed text-muted line-clamp-2">{c.summary}</p>

        {/* Auth type indicator */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full" style={{ backgroundColor: `${c.color}80` }} />
          <span className="text-[10px] text-muted-dark">{friendlyAuthType(c.authType)}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Special "extend" card for MCP / Custom ── */

function ExtendCard({ title, description, accent }: { title: string; description: string; accent: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] p-5 text-center backdrop-blur-sm transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.02]"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300 group-hover:bg-white/[0.03]"
        style={{ borderColor: `${accent}30` }}
      >
        <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" style={{ color: accent }} />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-dark leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ── Category Sidebar (desktop) ── */

function CategorySidebar({
  activeCategory,
  onSelect,
  categoryCount,
  total,
}: {
  activeCategory: string;
  onSelect: (key: string) => void;
  categoryCount: Record<string, number>;
  total: number;
}) {
  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  return (
    <aside className="pointer-events-none fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-start gap-1">
      <div className="pointer-events-auto rounded-full border border-white/6 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-dark backdrop-blur-sm font-mono mb-2">
        Categories
      </div>

      {/* All button */}
      <button
        onClick={() => onSelect("all")}
        className={`pointer-events-auto flex items-center gap-2 text-left text-[10px] font-mono tracking-wider transition-all duration-300 py-1 ${
          activeCategory === "all"
            ? "text-brand-cyan scale-105"
            : "text-muted-dark hover:text-muted"
        }`}
      >
        <div
          className={`h-px transition-all duration-300 ${
            activeCategory === "all"
              ? "w-6 bg-gradient-to-r from-brand-cyan/80 to-transparent"
              : "w-4 bg-gradient-to-r from-brand-cyan/35 to-transparent"
          }`}
        />
        All ({total})
      </button>

      {sorted.map((cat) => {
        const count = categoryCount[cat.key] || 0;
        if (count === 0) return null;
        const isActive = activeCategory === cat.key;
        const styles = accentStyles[cat.accent];
        return (
          <button
            key={cat.key}
            onClick={() => onSelect(cat.key)}
            className={`pointer-events-auto flex items-center gap-2 text-left text-[10px] font-mono tracking-wider transition-all duration-300 py-1 ${
              isActive ? "text-brand-cyan scale-105" : "text-muted-dark hover:text-muted"
            }`}
          >
            <div
              className={`h-px transition-all duration-300 ${
                isActive
                  ? "w-6 bg-gradient-to-r from-brand-cyan/80 to-transparent"
                  : "w-4 bg-gradient-to-r from-brand-cyan/35 to-transparent"
              }`}
            />
            <span className={`inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300 ${isActive ? styles.dot : "bg-white/20"}`} />
            {cat.label} ({count})
          </button>
        );
      })}
    </aside>
  );
}

/* ── Main Catalog Section ── */

export default function ConnectionsCatalog({ onConnectorClick }: { onConnectorClick?: (connector: Connector) => void }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of connectors) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }, []);

  const filteredConnectors = useMemo(() => {
    return connectors.filter((c) => {
      const matchesCategory = activeCategory === "all" || c.category === activeCategory;
      const s = search.toLowerCase();
      const matchesSearch =
        s === "" ||
        c.label.toLowerCase().includes(s) ||
        c.summary.toLowerCase().includes(s) ||
        c.category.toLowerCase().includes(s);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <SectionWrapper id="connections-catalog" aria-label="Connections catalog">
      {/* Category sidebar — fixed left, desktop only */}
      <CategorySidebar
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        categoryCount={categoryCount}
        total={connectors.length}
      />

      {/* ── Hero heading ── */}
      <motion.div variants={fadeUp} className="relative text-center">
        {/* Ghost watermark */}
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none font-mono font-bold text-[7rem] sm:text-[11rem] leading-none text-white/[0.02]">
          {connectors.length}
        </span>

        <span className="inline-block rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)] font-mono mb-6">
          Integrations
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
          Connect to{" "}
          <GradientText className="drop-shadow-lg">everything</GradientText>
        </h1>

        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Your agents can talk to {connectors.length}+ services you already use.
          Set it up once, and your agents handle the rest — automatically.
        </p>

        {/* Stat badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5 text-xs font-mono text-muted backdrop-blur-sm">
            {connectors.length} services ready
          </span>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5 text-xs font-mono text-muted backdrop-blur-sm">
            {categories.length} categories
          </span>
          <span className="rounded-full border border-brand-emerald/20 bg-brand-emerald/8 px-4 py-1.5 text-xs font-mono text-brand-emerald backdrop-blur-sm">
            New services added regularly
          </span>
        </div>
      </motion.div>

      {/* ── Search + category filter ── */}
      <motion.div variants={fadeUp} className="mt-16 relative">
        {/* Search bar */}
        <div className="relative mx-auto max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark pointer-events-none" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/6 bg-white/[0.03] pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-dark backdrop-blur-sm transition-all duration-300 focus:border-brand-cyan/30 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-brand-cyan/20"
          />
        </div>

        {/* Category pills — mobile only */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:hidden">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 cursor-pointer ${
              activeCategory === "all"
                ? "border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.12)]"
                : "border border-white/6 bg-white/[0.03] text-muted hover:text-foreground hover:bg-white/[0.05]"
            }`}
          >
            All ({connectors.length})
          </button>
          {categories.map((cat) => {
            const count = categoryCount[cat.key] || 0;
            if (count === 0) return null;
            const styles = accentStyles[cat.accent];
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`group/pill flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? `border ${styles.active}`
                    : "border border-white/6 bg-white/[0.03] text-muted hover:text-foreground hover:bg-white/[0.05]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                    isActive ? styles.dot : "bg-white/20"
                  }`}
                />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Active filter count */}
        {(activeCategory !== "all" || search !== "") && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-xs text-muted-dark"
          >
            Showing {filteredConnectors.length} of {connectors.length} connectors
            {search && (
              <button
                onClick={() => { setSearch(""); setActiveCategory("all"); }}
                className="ml-2 text-brand-cyan hover:text-brand-cyan/80 transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </motion.p>
        )}
      </motion.div>

      {/* ── Connector grid ── */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredConnectors.map((c, i) => (
            <ConnectorCard key={c.name} connector={c} index={i} onClick={() => onConnectorClick?.(c)} />
          ))}
        </AnimatePresence>

        {/* Extend cards — show only when viewing "all" with no search */}
        {activeCategory === "all" && search === "" && (
          <>
            <ExtendCard
              title="MCP Servers"
              description="Connect any MCP-compatible AI tool"
              accent="#06b6d4"
            />
            <ExtendCard
              title="Custom APIs"
              description="Connect to any web service with a custom setup"
              accent="#a855f7"
            />
          </>
        )}

        {/* Empty state */}
        {filteredConnectors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-16 text-center"
          >
            <Plug className="mx-auto h-8 w-8 text-muted-dark mb-3" />
            <p className="text-muted-dark text-sm">No services found. Try a different search.</p>
          </motion.div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <motion.div variants={fadeUp} className="mt-24 text-center">
        <p className="text-muted-dark text-sm max-w-lg mx-auto leading-relaxed">
          All connections are set up in the Personas desktop app.
          Your passwords and keys stay on your device, protected by bank-grade encryption.
        </p>
        <div className="mt-8">
          <PrimaryCTA href="/#download" icon={Download} label="Download Personas" variant="ghost" />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
