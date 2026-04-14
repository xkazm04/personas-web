"use client";

import { motion } from "framer-motion";
import { hexToBrand } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import { ThemedChip } from "@/components/primitives";
import { BLOG_CATEGORIES, type BlogCategory } from "@/data/blog";

interface CategoryFilterProps {
  active: BlogCategory | "all";
  onChange: (id: BlogCategory | "all") => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-wrap gap-2 justify-center mb-12"
    >
      <ThemedChip active={active === "all"} onClick={() => onChange("all")}>
        All posts
      </ThemedChip>
      {BLOG_CATEGORIES.map((cat) => (
        <ThemedChip
          key={cat.id}
          brand={hexToBrand(cat.color)}
          active={active === cat.id}
          onClick={() => onChange(cat.id)}
        >
          {cat.label}
        </ThemedChip>
      ))}
    </motion.div>
  );
}
