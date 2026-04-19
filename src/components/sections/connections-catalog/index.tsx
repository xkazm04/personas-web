"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plug, Download } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import PrimaryCTA from "@/components/PrimaryCTA";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { connectors, categories, type Connector } from "@/data/connectors";
import ConnectorCard from "./components/ConnectorCard";
import ExtendCard from "./components/ExtendCard";
import CategorySidebar from "./components/CategorySidebar";
import CatalogFilters from "./components/CatalogFilters";

export default function ConnectionsCatalog({
  activeCategory,
  search,
  onCategoryChange,
  onSearchChange,
  onConnectorClick,
}: {
  activeCategory: string;
  search: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  onConnectorClick?: (connector: Connector) => void;
}) {

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
      <CategorySidebar
        activeCategory={activeCategory}
        onSelect={onCategoryChange}
        categoryCount={categoryCount}
        total={connectors.length}
      />

      <motion.div variants={fadeUp} className="relative text-center">
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none font-mono font-bold text-[7rem] sm:text-[11rem] leading-none text-white/[0.02]">
          {connectors.length}
        </span>

        <SectionIntro
          eyebrow="Integrations"
          heading="Connect to"
          gradient="everything"
          description={`Your agents can talk to ${connectors.length}+ services you already use. Set it up once, and your agents handle the rest — automatically.`}
          className="mb-0"
        />

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-glass-hover bg-white/[0.03] px-4 py-1.5 text-base font-mono text-muted backdrop-blur-sm">
            {connectors.length} services ready
          </span>
          <span className="rounded-full border border-glass-hover bg-white/[0.03] px-4 py-1.5 text-base font-mono text-muted backdrop-blur-sm">
            {categories.length} categories
          </span>
          <span
            className="rounded-full border px-4 py-1.5 text-base font-mono backdrop-blur-sm"
            style={{
              borderColor: tint("emerald", 20),
              backgroundColor: tint("emerald", 8),
              color: BRAND_VAR.emerald,
            }}
          >
            New services added regularly
          </span>
        </div>
      </motion.div>

      <CatalogFilters
        activeCategory={activeCategory}
        setActiveCategory={onCategoryChange}
        search={search}
        setSearch={onSearchChange}
        categoryCount={categoryCount}
        filteredCount={filteredConnectors.length}
      />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredConnectors.map((c, i) => (
            <ConnectorCard key={c.name} connector={c} index={i} onClick={() => onConnectorClick?.(c)} />
          ))}
        </AnimatePresence>

        {activeCategory === "all" && search === "" && (
          <>
            <ExtendCard title="MCP Servers" description="Connect any MCP-compatible AI tool" accent="#06b6d4" />
            <ExtendCard title="Custom APIs" description="Connect to any web service with a custom setup" accent="#a855f7" />
          </>
        )}

        {filteredConnectors.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-16 text-center">
            <Plug className="mx-auto h-8 w-8 text-muted-dark mb-3" />
            <p className="text-muted-dark text-base">No services found. Try a different search.</p>
          </motion.div>
        )}
      </div>

      <motion.div variants={fadeUp} className="mt-24 text-center">
        <p className="text-muted-dark text-base max-w-lg mx-auto leading-relaxed">
          All connections are set up in the Personas desktop app. Your passwords and keys stay on your device, protected by
          bank-grade encryption.
        </p>
        <div className="mt-8">
          <PrimaryCTA href="/#download" icon={Download} label="Download Personas" variant="ghost" />
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
