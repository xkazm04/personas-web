"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import { formatDateShort } from "@/lib/format-date";
import type { BlogPost } from "@/data/blog";
import { categoryOf } from "./category-meta";

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const meta = categoryOf(post.category);
  const bv = BRAND_VAR[meta.brand];

  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/blog/${post.slug}`}
        className="group relative flex flex-col h-full overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.01]"
        style={{
          borderColor: "rgba(var(--surface-overlay), 0.08)",
          backgroundColor: "rgba(var(--surface-overlay), 0.02)",
          backgroundImage: `linear-gradient(180deg, ${tint(meta.brand, 8)} 0%, transparent 70%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: tint(meta.brand, 22) }}
        />
        <div className="relative flex items-center gap-2 mb-4">
          <span
            className="rounded-full px-2.5 py-0.5 text-base font-semibold uppercase tracking-wider"
            style={{ backgroundColor: tint(meta.brand, 14), color: bv }}
          >
            {meta.label}
          </span>
          <span className="text-base text-muted-dark">
            {formatDateShort(post.date)}
          </span>
        </div>
        <h3
          className="relative text-xl font-extrabold tracking-tight leading-snug mb-3 transition-colors"
          style={{
            color: bv,
            textShadow: `0 0 20px ${tint(meta.brand, 25)}`,
          }}
        >
          {post.title}
        </h3>
        <p className="relative text-base text-foreground/75 leading-relaxed flex-1 mb-5">
          {post.description}
        </p>
        <div
          className="relative flex items-center justify-between gap-3 pt-4 border-t"
          style={{ borderColor: "rgba(var(--surface-overlay), 0.06)" }}
        >
          <div className="flex items-center gap-3 text-base text-muted-dark">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min
            </span>
          </div>
          <span
            className="flex items-center gap-1 text-base font-semibold transition-transform group-hover:translate-x-0.5"
            style={{ color: bv }}
          >
            Read
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
