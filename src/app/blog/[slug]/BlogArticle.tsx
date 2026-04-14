"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import PageShell from "@/components/PageShell";
import SectionWrapper from "@/components/SectionWrapper";
import { fadeUp } from "@/lib/animations";
import type { BlogPost } from "@/data/blog";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-foreground mt-8 mb-3">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-foreground mt-10 mb-4">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2 pl-4">
          {items.map((item, j) => (
            <li key={j} className="text-muted leading-relaxed flex gap-2">
              <span className="text-brand-cyan/50 shrink-0 mt-1.5">&#x2022;</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    } else if (line.startsWith("1. ")) {
      const items: string[] = [];
      let idx = i;
      while (idx < lines.length && /^\d+\. /.test(lines[idx])) {
        items.push(lines[idx].replace(/^\d+\. /, ""));
        idx++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2 pl-4 list-decimal list-inside">
          {items.map((item, j) => (
            <li key={j} className="text-muted leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      );
      i = idx;
      continue;
    } else if (line.trim() === "") {
      // skip empty lines
    } else if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      elements.push(
        <p key={i} className="text-muted leading-relaxed my-4 italic border-l-2 border-brand-cyan/20 pl-4">
          {line.slice(1, -1)}
        </p>,
      );
    } else {
      elements.push(
        <p key={i} className="text-muted leading-relaxed my-4">
          {renderInline(line)}
        </p>,
      );
    }
    i++;
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground font-medium">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function BlogArticle({
  post,
  categoryLabel,
  categoryColor,
}: {
  post: BlogPost;
  categoryLabel: string;
  categoryColor: string;
}) {
  return (
    <>
      <Navbar />
      <PageShell scrollMapItems={[{ label: "ARTICLE", href: "#article" }]}>
        <div className="h-24" />

        <SectionWrapper id="article" aria-label={post.title}>
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-base text-muted hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>

            {/* Meta */}
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
              <span className="text-base text-muted">{formatDate(post.date)}</span>
              <span className="flex items-center gap-1 text-base text-muted">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-muted leading-relaxed mb-8 pb-8 border-b border-white/[0.06]">
              {post.description}
            </p>

            {/* Content */}
            <div className="prose-custom">{renderContent(post.content)}</div>

            {/* Author */}
            <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan text-base font-bold">
                {post.author[0]}
              </div>
              <div>
                <p className="text-base font-medium text-foreground">{post.author}</p>
                <p className="text-sm text-muted">{formatDate(post.date)}</p>
              </div>
            </div>
            {/* Cross-links */}
            <div className="mt-12 pt-8 border-t border-white/[0.06]">
              <h3 className="text-base font-semibold text-foreground uppercase tracking-wider mb-4">
                Continue exploring
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href="/#get-started"
                  className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-base text-muted hover:border-white/[0.1] hover:text-foreground transition-colors"
                >
                  See it in action
                  <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  href="/use-cases"
                  className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-base text-muted hover:border-white/[0.1] hover:text-foreground transition-colors"
                >
                  Explore use cases
                  <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  href="/compare"
                  className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-base text-muted hover:border-white/[0.1] hover:text-foreground transition-colors"
                >
                  Compare platforms
                  <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </motion.div>
        </SectionWrapper>
      </PageShell>
      <Footer />
    </>
  );
}
