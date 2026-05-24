"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { BLOG_POSTS, type BlogCategory } from "@/data/blog";
import CategoryFilter from "./CategoryFilter";
import FeaturedPost from "./FeaturedPost";
import BlogPostCard from "./BlogPostCard";
import { useTranslation } from "@/i18n/useTranslation";

export default function BlogPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">(
    "all",
  );
  const [search, setSearch] = useState("");

  // Hide future-dated posts on every render. Authors stage upcoming
  // articles in the data file; without this filter, merging a post
  // with a future `date` immediately publishes it (the freshness
  // clock is the user's, not the build's). Use UTC midnight cutoff so
  // a post dated "today" reliably appears regardless of TZ.
  const visiblePosts = useMemo(() => {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const cutoff = todayUtc.getTime();
    const dated = BLOG_POSTS.filter((p) => {
      const t = new Date(p.date).getTime();
      return Number.isFinite(t) && t <= cutoff;
    });
    // Sort by date desc — array order in the source file is informal
    // editorial state, not a publish manifest.
    return dated.slice().sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return visiblePosts.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeCategory, search, visiblePosts]);

  const countsByCategory = useMemo(() => {
    const counts: Partial<Record<BlogCategory | "all", number>> = {
      all: visiblePosts.length,
    };
    for (const post of visiblePosts) {
      counts[post.category] = (counts[post.category] ?? 0) + 1;
    }
    return counts;
  }, [visiblePosts]);

  const featured = visiblePosts.find((p) => p.featured);
  const showFeatured = activeCategory === "all" && !search.trim() && featured;

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={[{ label: t.blogPage.eyebrow.toUpperCase(), href: "#blog" }]}>
        <div className="h-24" />

        <SectionWrapper id="blog" aria-label={t.blogPage.eyebrow}>
          <SectionIntro
            as="h1"
            eyebrow={t.blogPage.eyebrow}
            heading={t.blogPage.heading}
            gradient={t.blogPage.headingGradient}
            description={t.blogPage.description}
          />

          <motion.div variants={fadeUp} className="relative mx-auto mb-8 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark" />
            <input
              type="text"
              placeholder={t.blogPage.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t.blogPage.searchAriaLabel}
              className="w-full rounded-xl border border-glass-hover bg-white/[0.03] py-2.5 pl-10 pr-10 text-base text-foreground placeholder:text-muted-dark outline-none transition-colors focus:border-brand-cyan/40 focus:bg-white/[0.05]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label={t.blogPage.clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-dark hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mb-6 text-center text-sm text-muted-dark"
            aria-live="polite"
          >
            {t.blogPage.showing}{" "}
            <motion.span layout className="tabular-nums text-foreground">
              {filtered.length}
            </motion.span>{" "}
            {t.blogPage.of} {visiblePosts.length} {t.blogPage.posts}
          </motion.p>

          <CategoryFilter
            active={activeCategory}
            onChange={setActiveCategory}
            countsByCategory={countsByCategory}
            allPostsLabel={t.blogPage.allPosts}
          />

          {showFeatured && (
            <FeaturedPost post={featured} />
          )}

          {filtered.length === 0 ? (
            <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center gap-3 text-center">
              <p className="text-lg font-medium text-muted-dark">{t.blogPage.noMatches}</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("all"); }}
                className="text-base text-brand-cyan hover:underline"
              >
                {t.blogPage.clearFilters}
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered
                .filter((p) => !showFeatured || p.slug !== featured.slug)
                .map((post) => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
            </motion.div>
          )}
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
