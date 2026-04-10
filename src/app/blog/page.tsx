"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";
import GradientText from "@/components/GradientText";
import { fadeUp } from "@/lib/animations";
import { BLOG_POSTS, BLOG_CATEGORIES, type BlogCategory } from "@/data/blog";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">("all");

  const filtered =
    activeCategory === "all"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === activeCategory);

  const featured = BLOG_POSTS.find((p) => p.featured);

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={[{ label: "BLOG", href: "#blog" }]}>
        <div className="h-24" />

        <SectionWrapper id="blog" aria-label="Blog">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-cyan/70">
              Blog
            </p>
            <SectionHeading>
              Updates &{" "}
              <GradientText className="drop-shadow-lg">insights</GradientText>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted leading-relaxed font-light">
              Product announcements, engineering deep-dives, tutorials, and
              real-world use cases from the Personas team.
            </p>
          </motion.div>

          {/* Category filters */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center mb-12">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === "all"
                  ? "border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan"
                  : "border border-white/6 bg-white/2 text-muted hover:border-white/10 hover:text-foreground"
              }`}
            >
              All
            </button>
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "border border-white/15 bg-white/8 text-foreground"
                    : "border border-white/6 bg-white/2 text-muted hover:border-white/10 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Featured post */}
          {activeCategory === "all" && featured && (
            <motion.div variants={fadeUp} className="mb-12">
              <Link
                href={`/blog/${featured.slug}`}
                className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 sm:p-10 transition-colors hover:border-white/[0.1]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor: `${BLOG_CATEGORIES.find((c) => c.id === featured.category)?.color}15`,
                      color: BLOG_CATEGORIES.find((c) => c.id === featured.category)?.color,
                    }}
                  >
                    {BLOG_CATEGORIES.find((c) => c.id === featured.category)?.label}
                  </span>
                  <span className="text-xs text-muted">{formatDate(featured.date)}</span>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3 w-3" />
                    {featured.readingTime} min read
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 group-hover:text-brand-cyan transition-colors">
                  {featured.title}
                </h2>
                <p className="text-base text-muted leading-relaxed max-w-3xl">
                  {featured.description}
                </p>
                <div className="mt-6 flex items-center gap-1.5 text-sm text-brand-cyan/70 group-hover:text-brand-cyan transition-colors">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* Post grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered
              .filter((p) => activeCategory !== "all" || !p.featured)
              .map((post) => (
                <motion.div key={post.slug} variants={fadeUp}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col h-full rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 transition-colors hover:border-white/[0.1]"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                        style={{
                          backgroundColor: `${BLOG_CATEGORIES.find((c) => c.id === post.category)?.color}15`,
                          color: BLOG_CATEGORIES.find((c) => c.id === post.category)?.color,
                        }}
                      >
                        {BLOG_CATEGORIES.find((c) => c.id === post.category)?.label}
                      </span>
                      <span className="text-[10px] text-muted">{formatDate(post.date)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-brand-cyan transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      {post.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                      <Clock className="h-3 w-3" />
                      {post.readingTime} min read
                      <span className="ml-auto text-brand-cyan/60 group-hover:text-brand-cyan transition-colors flex items-center gap-1">
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
