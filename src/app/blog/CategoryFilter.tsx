"use client";

import { motion } from "framer-motion";
import { hexToBrand } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import { ThemedChip } from "@/components/primitives";
import { BLOG_CATEGORIES, type BlogCategory } from "@/data/blog";

interface CategoryFilterProps {
  active: BlogCategory | "all";
  onChange: (id: BlogCategory | "all") => void;
  allPostsLabel: string;
  /** Post counts per category (plus an "all" total). When omitted, no badge is rendered. */
  countsByCategory?: Partial<Record<BlogCategory | "all", number>>;
}

function CountBadge({ value }: { value: number | undefined }) {
  if (value === undefined) return null;
  return <span className="ml-1.5 text-sm text-muted-dark/80">{value}</span>;
}

export default function CategoryFilter({ active, onChange, allPostsLabel, countsByCategory }: CategoryFilterProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-wrap gap-2 justify-center mb-12"
    >
      <ThemedChip active={active === "all"} onClick={() => onChange("all")}>
        {allPostsLabel}
        <CountBadge value={countsByCategory?.all} />
      </ThemedChip>
      {BLOG_CATEGORIES.map((cat) => (
        <ThemedChip
          key={cat.id}
          brand={hexToBrand(cat.color)}
          active={active === cat.id}
          onClick={() => onChange(cat.id)}
        >
          {cat.label}
          <CountBadge value={countsByCategory?.[cat.id]} />
        </ThemedChip>
      ))}
    </motion.div>
  );
}
