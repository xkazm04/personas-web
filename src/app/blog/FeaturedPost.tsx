"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles, User } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import { formatDateShort } from "@/lib/format-date";
import type { BlogPost } from "@/data/blog";
import { categoryOf } from "./category-meta";

interface FeaturedPostProps {
  post: BlogPost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const meta = categoryOf(post.category);
  const bv = BRAND_VAR[meta.brand];

  return (
    <motion.div variants={fadeUp} className="mb-12">
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block overflow-hidden rounded-2xl border p-8 sm:p-12 transition-all duration-500 hover:scale-[1.005]"
        style={{
          borderColor: "var(--border-glass-hover)",
          backgroundColor: "rgba(var(--surface-overlay), 0.02)",
          backgroundImage: `linear-gradient(135deg, ${tint(meta.brand, 14)} 0%, transparent 60%)`,
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl opacity-40"
          style={{ backgroundColor: tint(meta.brand, 20) }}
        />
        {/* Featured badge */}
        <div
          className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold uppercase tracking-wider mb-6"
          style={{ backgroundColor: tint(meta.brand, 18), color: bv }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Featured
        </div>

        <div className="relative flex flex-wrap items-center gap-3 mb-4">
          <span
            className="rounded-full px-3 py-1 text-base font-medium uppercase tracking-wider"
            style={{ backgroundColor: tint(meta.brand, 14), color: bv }}
          >
            {meta.label}
          </span>
          <span className="flex items-center gap-1.5 text-base text-muted-dark">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
          <span className="text-base text-muted-dark">·</span>
          <span className="text-base text-muted-dark">
            {formatDateShort(post.date)}
          </span>
          <span className="flex items-center gap-1.5 text-base text-muted-dark">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} min read
          </span>
        </div>

        <h2
          className="relative text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4 max-w-4xl"
          style={{
            color: bv,
            textShadow: `0 0 40px ${tint(meta.brand, 25)}`,
          }}
        >
          {post.title}
        </h2>
        <p className="relative text-lg text-muted-dark leading-relaxed max-w-3xl">
          {post.description}
        </p>
        <div
          className="relative mt-6 inline-flex items-center gap-2 text-base font-semibold transition-transform group-hover:translate-x-1"
          style={{ color: bv }}
        >
          Read article
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  );
}
