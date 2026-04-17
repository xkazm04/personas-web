"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import { SectionIntro } from "@/components/primitives";
import { staggerContainer } from "@/lib/animations";
import { BLOG_POSTS, type BlogCategory } from "@/data/blog";
import CategoryFilter from "./CategoryFilter";
import FeaturedPost from "./FeaturedPost";
import BlogPostCard from "./BlogPostCard";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">(
    "all",
  );

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
          <SectionIntro
            as="h1"
            eyebrow="Blog"
            heading="Updates &"
            gradient="insights"
            description="Product announcements, engineering deep-dives, tutorials, and real-world use cases from the Personas team."
          />

          <CategoryFilter
            active={activeCategory}
            onChange={setActiveCategory}
          />

          {activeCategory === "all" && featured && (
            <FeaturedPost post={featured} />
          )}

          {/* Post grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered
              .filter((p) => activeCategory !== "all" || !p.featured)
              .map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
