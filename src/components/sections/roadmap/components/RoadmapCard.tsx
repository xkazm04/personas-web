"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { RoadmapItem } from "../types";
import { statusConfig, priorityBrand } from "../data";

function brandColor(key: BrandKey | "muted") {
  return key === "muted" ? "var(--muted)" : BRAND_VAR[key];
}
function brandTint(key: BrandKey | "muted", pct: number) {
  return key === "muted" ? `color-mix(in srgb, var(--muted) ${pct}%, transparent)` : tint(key, pct);
}

const RoadmapCard = memo(function RoadmapCard({
  item,
  index,
  total,
}: {
  item: RoadmapItem;
  index: number;
  total: number;
}) {
  const { t } = useTranslation();
  const status = statusConfig[item.status];
  const statusColor = brandColor(status.brand);
  const priority = priorityBrand[item.priority];

  return (
    <motion.div variants={fadeUp} className="relative flex gap-6 md:gap-8">
      {/* Timeline spine */}
      <div className="relative flex flex-col items-center pt-1">
        <div
          className="relative z-10 h-3.5 w-3.5 rounded-full ring-4 ring-background"
          style={{
            backgroundColor: statusColor,
            boxShadow: status.pulse ? `0 0 8px ${brandTint(status.brand, 50)}` : undefined,
          }}
        >
          {status.pulse && (
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: brandTint(status.brand, 30) }}
            />
          )}
        </div>
        {index < total - 1 && (
          <div className="mt-1 w-px flex-1" style={{ backgroundColor: brandTint(status.brand, 25) }} />
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 pb-10">
        <div className="relative">
          <div className="rounded-2xl border border-glass bg-gradient-to-br from-white/[0.02] to-transparent p-6 transition-all duration-300 hover:border-glass-hover hover:bg-white/[0.025]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] font-mono text-base font-bold text-muted shrink-0">
                  {item.sort_order}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span
                      className="rounded-full border px-2 py-0.5 text-base font-medium tracking-wider uppercase"
                      style={{
                        borderColor: brandTint(status.brand, 20),
                        backgroundColor: brandTint(status.brand, 5),
                        color: statusColor,
                      }}
                    >
                      {t.roadmapSection[status.labelKey]}
                    </span>
                    <span
                      className="rounded-full border px-2 py-0.5 text-base font-medium tracking-wider uppercase"
                      style={{
                        borderColor: brandTint(priority, 20),
                        backgroundColor: brandTint(priority, 5),
                        color: brandColor(priority),
                      }}
                    >
                      {item.priority} priority
                    </span>
                  </div>
                  <p className="text-base text-muted-dark mt-1 max-w-lg">{item.description}</p>
                </div>
              </div>
            </div>
          </div>
          {item.status === "in_progress" && (
            <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl overflow-hidden">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <rect
                  x="1"
                  y="1"
                  width="100%"
                  height="100%"
                  rx="16"
                  ry="16"
                  fill="none"
                  stroke={brandTint("cyan", 20)}
                  strokeWidth="1.5"
                  strokeDasharray="8 8"
                  style={{ animation: "dash-flow 2s linear infinite" }}
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default RoadmapCard;
