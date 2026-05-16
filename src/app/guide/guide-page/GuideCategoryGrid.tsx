import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { GUIDE_CATEGORIES } from "@/data/guide/categories";
import { GUIDE_ILLUSTRATIONS } from "@/data/guide/illustrations";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { BRAND_VAR, hexToBrand, tint } from "@/lib/brand-theme";

type VisibleCategory = (typeof GUIDE_CATEGORIES)[number];

export function GuideCategoryGrid({
  categories,
  topicCounts,
  labels,
}: {
  categories: VisibleCategory[];
  topicCounts: Record<string, number>;
  labels: {
    categories: Record<string, string>;
    categoryDescriptions: Record<string, string>;
    learnMore: string;
  };
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerContainer}
      className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {categories.map((category) => {
        const illustration = GUIDE_ILLUSTRATIONS[category.id];
        const brand = hexToBrand(category.color);
        const brandVar = BRAND_VAR[brand];

        return (
          <motion.div key={category.id} variants={fadeUp}>
            <Link
              href={`/guide/${category.id}`}
              className="group relative block overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.01] outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              style={{
                borderColor: "var(--border-glass-hover)",
                backgroundColor: "rgba(var(--surface-overlay), 0.02)",
                backgroundImage: `linear-gradient(180deg, transparent 0%, ${tint(brand, 8)} 100%)`,
              }}
            >
              {illustration && (
                <div
                  className="relative aspect-video w-full overflow-hidden"
                  style={{ backgroundColor: tint(brand, 6) }}
                >
                  <Image
                    src={illustration.dark}
                    alt={labels.categories[category.id]}
                    width={800}
                    height={400}
                    aria-hidden="true"
                    className="hidden dark:block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Image
                    src={illustration.light}
                    alt={labels.categories[category.id]}
                    width={800}
                    height={400}
                    className="block dark:hidden h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/2"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, transparent 0%, rgba(var(--background-rgb, 10,10,18), 0.85) 100%)",
                    }}
                  />
                </div>
              )}

              <div className="relative p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3
                    className="text-xl font-extrabold tracking-tight leading-tight"
                    style={{
                      color: brandVar,
                      textShadow: `0 0 24px ${tint(brand, 30)}`,
                    }}
                  >
                    {labels.categories[category.id]}
                  </h3>
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-base font-semibold tabular-nums"
                    style={{
                      backgroundColor: tint(brand, 16),
                      color: brandVar,
                    }}
                  >
                    {topicCounts[category.id] ?? 0}
                  </span>
                </div>
                <p className="text-base text-foreground/75 leading-relaxed line-clamp-2 mb-4">
                  {labels.categoryDescriptions[category.id]}
                </p>
                <div
                  className="inline-flex items-center gap-1.5 text-base font-semibold transition-transform group-hover:translate-x-0.5"
                  style={{ color: brandVar }}
                >
                  {labels.learnMore}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
