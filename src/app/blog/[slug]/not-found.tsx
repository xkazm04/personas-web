"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { BLOG_POSTS } from "@/data/blog";

// Suggest the featured post plus the two most recent so a mistyped/stale link
// becomes a recovery point instead of a dead end. Computed at module load.
const SUGGESTED_POSTS = [...BLOG_POSTS]
  .sort(
    (a, b) =>
      (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
      new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  .slice(0, 3);

export default function BlogPostNotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-base font-mono font-medium text-brand-cyan/70">
            404
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t.blogPage.postNotFound}
          </h1>
          <p className="mt-4 text-base text-muted leading-relaxed">
            {t.blogPage.postNotFoundDescription}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-6 py-2.5 text-base font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/20"
            >
              <BookOpen className="h-4 w-4" />
              {t.blogPage.browseAllPosts}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-glass-hover bg-white/[0.03] px-6 py-2.5 text-base font-medium text-muted transition-colors hover:text-foreground hover:bg-white/[0.05]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.blogPage.backToHome}
            </Link>
          </div>

          {/* Recovery: suggested posts so a stale/mistyped link isn't a dead end. */}
          <div className="mt-14 w-full text-left">
            <p className="mb-4 text-center text-xs font-mono uppercase tracking-wider text-muted-dark">
              Popular posts
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {SUGGESTED_POSTS.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-glass bg-white/[0.02] p-4 transition-colors hover:border-glass-hover hover:bg-white/[0.04]"
                >
                  <span className="line-clamp-2 text-base font-medium text-foreground transition-colors group-hover:text-brand-cyan">
                    {post.title}
                  </span>
                  <span className="mt-2 block text-xs text-muted-dark">
                    {post.readingTime} {t.blogPage.minRead}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
