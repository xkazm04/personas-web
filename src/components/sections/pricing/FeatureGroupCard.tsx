"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { BRAND_VAR, tint, brandShadow } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import { BrandCard } from "@/components/primitives";
import type { FeatureGroup } from "./data";

interface FeatureGroupCardProps {
  group: FeatureGroup;
}

export default function FeatureGroupCard({ group }: FeatureGroupCardProps) {
  const Icon = group.icon;
  const bv = BRAND_VAR[group.brand];

  return (
    <motion.div variants={fadeUp}>
      <BrandCard brand={group.brand} className="group flex flex-col p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: tint(group.brand, 16),
              boxShadow: brandShadow(group.brand, 24, 18),
            }}
          >
            <Icon className="h-5 w-5" style={{ color: bv }} />
          </div>
          <div className="min-w-0">
            <h3
              className="text-2xl font-extrabold tracking-tight leading-tight"
              style={{
                color: bv,
                textShadow: `0 0 20px ${tint(group.brand, 35)}`,
              }}
            >
              {group.title}
            </h3>
            <p className="mt-1 text-base text-muted-dark leading-snug">
              {group.tagline}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full mb-4"
          style={{
            backgroundImage: `linear-gradient(90deg, ${tint(group.brand, 45)}, transparent)`,
          }}
        />

        {/* Concepts */}
        <ul className="space-y-2.5 flex-1">
          {group.concepts.map((concept) => (
            <li
              key={concept}
              className="flex items-start gap-2.5 text-base text-foreground/80"
            >
              <Check className="h-4 w-4 mt-1 shrink-0" style={{ color: bv }} />
              <span className="leading-relaxed">{concept}</span>
            </li>
          ))}
        </ul>

        {/* Guide link */}
        <Link
          href={group.guideHref}
          className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold transition-opacity hover:opacity-80"
          style={{ color: bv }}
        >
          Read the guide
          <span aria-hidden="true">→</span>
        </Link>
      </BrandCard>
    </motion.div>
  );
}
