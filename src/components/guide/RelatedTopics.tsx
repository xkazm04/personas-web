"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { RelatedTopic } from "@/lib/guide-utils";

interface RelatedTopicsProps {
  related: RelatedTopic[];
}

export default function RelatedTopics({ related }: RelatedTopicsProps) {
  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <hr className="mb-6 border-white/[0.06]" />
      <h2 className="mb-4 text-lg font-semibold text-foreground">Related Topics</h2>

      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {related.map(({ topic, category, sharedTags }) => (
          <motion.div key={topic.id} variants={fadeUp}>
            <Link
              href={`/guide/${category.id}/${topic.id}`}
              className="group flex h-full flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  {category.name}
                </span>
                <ArrowRight className="h-4 w-4 translate-x-0 text-muted-dark opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </div>

              <p className="text-base font-semibold text-foreground">{topic.title}</p>
              <p className="line-clamp-2 text-sm text-muted-dark">{topic.description}</p>

              <div className="mt-auto flex flex-wrap gap-1 pt-2">
                {sharedTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-muted-dark"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
