"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plug, Download, Plus } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import PrimaryCTA from "@/components/PrimaryCTA";
import { fadeUp } from "@/lib/animations";
import { connectors, categories, type Connector } from "@/data/connectors";

/* ── Accent color mappings for category pills ── */

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

function ConnectorCard({ connector: c, index }: { connector: Connector; index: number }) {
  const categoryMeta = categories.find((cat) => cat.key === c.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.03, 0.6), duration: 0.35 }}
      whileHover={{
        y: -4,
        boxShadow: `0 0 40px ${c.color}15`,
        transition: { duration: 0.25 },
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-white/[0.008] backdrop-blur-sm transition-[border-color] duration-500 hover:border-white/[0.12]"
    >
      {/* Top shine line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Bottom brand accent line */}
      <div
        className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }}
      />

      {/* Corner accent — top-left */}
      <div className="pointer-events-none absolute top-0 left-0 w-6 h-6">
        <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(90deg, ${c.color}20, transparent)` }} />
        <div className="absolute top-0 left-0 h-full w-px" style={{ background: `linear-gradient(180deg, ${c.color}20, transparent)` }} />
      </div>

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
        {/* Monogram badge */}
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold tracking-wider border transition-shadow duration-300 group-hover:shadow-lg"
          style={{
            backgroundColor: `${c.color}12`,
            color: c.color,
            borderColor: `${c.color}20`,
          }}
        >
          {c.monogram}
        </div>

        {/* Name */}
        <h3 className="mt-3 text-[15px] font-semibold leading-tight">{c.label}</h3>

        {/* Category */}
        <span className="mt-1 inline-block text-[10px] font-mono uppercase tracking-wider text-muted-dark">
          {categoryMeta?.label ?? c.category}
        </span>

        {/* Summary */}
        <p className="mt-2.5 text-xs leading-relaxed text-muted line-clamp-2">{c.summary}</p>

        {/* Auth type indicator */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full" style={{ backgroundColor: `${c.color}80` }} />
          <span className="text-[10px] text-muted-dark">{c.authType}</span>
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

/* ── Main Catalog Section ── */

export default function ConnectionsCatalog() {
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
      {/* Background accent orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[10%] top-[10%] h-100 w-100 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 60%)" }}
        />
        <div
          className="absolute left-[5%] top-[40%] h-75 w-75 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 60%)" }}
        />
        <div
          className="absolute right-[15%] bottom-[10%] h-80 w-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.03) 0%, transparent 60%)" }}
        />
      </div>

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
          Built-in{" "}
          <GradientText className="drop-shadow-lg">Connections</GradientText>
        </h1>

        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Pre-built connectors for the tools your team already uses.
          Connect once in the Vault, automate forever with agents.
        </p>

        {/* Stat badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5 text-xs font-mono text-muted backdrop-blur-sm">
            {connectors.length} connectors
          </span>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5 text-xs font-mono text-muted backdrop-blur-sm">
            {categories.length} categories
          </span>
          <span className="rounded-full border border-brand-emerald/20 bg-brand-emerald/8 px-4 py-1.5 text-xs font-mono text-brand-emerald backdrop-blur-sm">
            Growing every month
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
            placeholder="Search connectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/6 bg-white/[0.03] pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-dark backdrop-blur-sm transition-all duration-300 focus:border-brand-cyan/30 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-brand-cyan/20"
          />
        </div>

        {/* Category pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {/* "All" pill */}
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

          {/* Category pills */}
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
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredConnectors.map((c, i) => (
            <ConnectorCard key={c.name} connector={c} index={i} />
          ))}
        </AnimatePresence>

        {/* Extend cards — show only when viewing "all" with no search */}
        {activeCategory === "all" && search === "" && (
          <>
            <ExtendCard
              title="MCP Servers"
              description="Connect any Model Context Protocol server"
              accent="#06b6d4"
            />
            <ExtendCard
              title="Custom APIs"
              description="Bring your own REST or GraphQL endpoint"
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
            <p className="text-muted-dark text-sm">No connectors match your search.</p>
          </motion.div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <motion.div variants={fadeUp} className="mt-24 text-center">
        <p className="text-muted-dark text-sm max-w-lg mx-auto leading-relaxed">
          All connectors are configured through the{" "}
          <strong className="text-foreground font-medium">Vault</strong> in the Personas desktop app.
          Your credentials are stored locally and encrypted at rest.
        </p>
        <div className="mt-8">
          <PrimaryCTA href="/#download" icon={Download} label="Download Personas" variant="ghost" />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
