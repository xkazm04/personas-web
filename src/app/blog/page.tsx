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

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">(
    "all",
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return BLOG_POSTS.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeCategory, search]);

  const featured = BLOG_POSTS.find((p) => p.featured);
  const showFeatured = activeCategory === "all" && !search.trim() && featured;

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={[{ label: "BLOG", href: "#blog" }]}>
        <div className="h-24" />

        <SectionWrapper id="blog" aria-label="Blog">
          <SectionIntro
            as="h1"
            eyebrow="Blog"
            heading="Updates &"
            gradient="insights"
            description="Product announcements, engineering deep-dives, tutorials, and real-world use cases from the Personas team."
          />

          <motion.div variants={fadeUp} className="relative mx-auto mb-8 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search blog posts"
              className="w-full rounded-xl border border-glass-hover bg-white/[0.03] py-2.5 pl-10 pr-10 text-base text-foreground placeholder:text-muted-dark outline-none transition-colors focus:border-brand-cyan/40 focus:bg-white/[0.05]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-dark hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>

          <CategoryFilter
            active={activeCategory}
            onChange={setActiveCategory}
          />

          {showFeatured && (
            <FeaturedPost post={featured} />
          )}

          {filtered.length === 0 ? (
            <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center gap-3 text-center">
              <p className="text-lg font-medium text-muted-dark">No posts match your search</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("all"); }}
                className="text-base text-brand-cyan hover:underline"
              >
                Clear all filters
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
                .filter((p) => !showFeatured || !p.featured)
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
