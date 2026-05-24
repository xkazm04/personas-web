"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

import Footer from "@/components/sections/Footer";
import Navbar from "@/components/Navbar";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import type { BlogPost } from "@/data/blog";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { formatDateLong as formatDate } from "@/lib/format-date";

import { BlogArticleByline } from "./blog-article/BlogArticleByline";
import { BlogArticleContent } from "./blog-article/BlogArticleContent";
import { BlogArticleCrossLinks } from "./blog-article/BlogArticleCrossLinks";

export default function BlogArticle({
  post,
  categoryLabel,
  categoryColor,
}: {
  post: BlogPost;
  categoryLabel: string;
  categoryColor: string;
}) {
  const { t } = useTranslation();
  const formattedDate = formatDate(post.date);

  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={[{ label: t.blogPage.article.toUpperCase(), href: "#article" }]}>
        <div className="h-24" />

        <SectionWrapper id="article" aria-label={post.title}>
          <motion.article variants={fadeUp} className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-base text-muted hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.blogPage.backToBlog}
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <span
                className="rounded-full px-3 py-1 text-sm font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                }}
              >
                {categoryLabel}
              </span>
              <span className="text-base text-muted">{formattedDate}</span>
              <span className="flex items-center gap-1 text-base text-muted">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime} {t.blogPage.minRead}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-muted leading-relaxed mb-8 pb-8 border-b border-glass">
              {post.description}
            </p>

            <BlogArticleContent content={post.content} />

            <BlogArticleByline
              author={post.author}
              categoryColor={categoryColor}
              publishedLabel={t.blogPage.published}
              publishedDate={formattedDate}
            />
            <BlogArticleCrossLinks
              heading={t.blogPage.continueExploring}
              labels={{
                seeItInAction: t.blogPage.seeItInAction,
                browseTemplates: t.blogPage.browseTemplates,
              }}
            />
          </motion.article>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
