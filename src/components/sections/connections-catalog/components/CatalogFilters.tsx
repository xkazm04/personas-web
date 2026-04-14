"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { categories, connectors } from "@/data/connectors";
import { accentBrandMap } from "../data";

interface Props {
  activeCategory: string;
  setActiveCategory: (k: string) => void;
  search: string;
  setSearch: (s: string) => void;
  categoryCount: Record<string, number>;
  filteredCount: number;
}

export default function CatalogFilters({
  activeCategory,
  setActiveCategory,
  search,
  setSearch,
  categoryCount,
  filteredCount,
}: Props) {
  return (
    <motion.div className="mt-16 relative">
      <div className="relative mx-auto max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark pointer-events-none" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/6 bg-white/[0.03] pl-11 pr-4 py-3 text-base text-foreground placeholder:text-muted-dark backdrop-blur-sm transition-all duration-300 focus:border-brand-cyan/30 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-brand-cyan/20"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:hidden">
        <button
          onClick={() => setActiveCategory("all")}
          className="rounded-full px-4 py-1.5 text-base font-medium transition-all duration-300 cursor-pointer border border-white/6 bg-white/[0.03] text-muted hover:text-foreground hover:bg-white/[0.05]"
          style={
            activeCategory === "all"
              ? { borderColor: tint("cyan", 30), backgroundColor: tint("cyan", 10), color: BRAND_VAR.cyan }
              : undefined
          }
        >
          All ({connectors.length})
        </button>
        {categories.map((cat) => {
          const count = categoryCount[cat.key] || 0;
          if (count === 0) return null;
          const brand = accentBrandMap[cat.accent];
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="group/pill flex items-center gap-1.5 rounded-full px-4 py-1.5 text-base font-medium transition-all duration-300 cursor-pointer border border-white/6 bg-white/[0.03] text-muted hover:text-foreground hover:bg-white/[0.05]"
              style={
                isActive
                  ? { borderColor: tint(brand, 30), backgroundColor: tint(brand, 10), color: BRAND_VAR[brand] }
                  : undefined
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                style={{ backgroundColor: isActive ? BRAND_VAR[brand] : "rgba(255,255,255,0.20)" }}
              />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {(activeCategory !== "all" || search !== "") && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-base text-muted-dark"
        >
          Showing {filteredCount} of {connectors.length} connectors
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="ml-2 transition-colors cursor-pointer"
              style={{ color: BRAND_VAR.cyan }}
            >
              Clear filters
            </button>
          )}
        </motion.p>
      )}
    </motion.div>
  );
}
