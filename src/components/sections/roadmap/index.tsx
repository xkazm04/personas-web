"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Compass } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { BRAND_VAR, tint, brandShadow } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { RoadmapItem } from "./types";
import { FALLBACK_ITEMS } from "./data";
import RoadmapCard from "./components/RoadmapCard";
import RoadmapProgress from "./components/RoadmapProgress";

interface RoadmapResponse {
  items?: RoadmapItem[];
  source?: "supabase" | "none" | "error";
}

export default function Roadmap() {
  const { t } = useTranslation();
  const [items, setItems] = useState<RoadmapItem[]>(FALLBACK_ITEMS);
  // True only when Supabase intentionally returned an empty list — distinct
  // from "no Supabase configured" (we keep FALLBACK_ITEMS visible) and from
  // "request failed" (also fallback). Lets us render a clear "nothing
  // planned" empty state that doubles as a canary for accidental DELETE
  // FROM roadmap_items rather than silently showing stale fallback copy.
  const [emptyFromSource, setEmptyFromSource] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AbortController so unmount / fast-refresh / strict-mode double-invoke
    // actually tears down the request, plus an 8s timeout so a hung Supabase
    // pool can't dangle the socket for the full edge timeout.
    const controller = new AbortController();
    let unmounted = false;
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch("/api/roadmap", { signal: controller.signal })
      .then((r) => r.json())
      .then((data: RoadmapResponse) => {
        if (unmounted) return;
        if (data.items?.length) {
          setItems(data.items);
          setEmptyFromSource(false);
        } else if (data.source === "supabase") {
          // Supabase responded successfully with an empty array — surface
          // the empty state instead of silently keeping stale fallback copy.
          setEmptyFromSource(true);
        }
      })
      .catch(() => {
        // AbortError on unmount / timeout is expected; other errors fall
        // back to FALLBACK_ITEMS already in state.
      })
      .finally(() => {
        clearTimeout(timeoutId);
        // Always release the spinner. The previous gate was
        // `!controller.signal.aborted`, but the 8s timeout also aborts
        // the controller — which left the loader spinning forever above
        // the FALLBACK_ITEMS content on slow Supabase. The unmount path
        // separately suppresses the setState via the `unmounted` flag.
        if (!unmounted) setLoading(false);
      });

    return () => {
      unmounted = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const inProgressCount = items.filter((i) => i.status === "in_progress").length;
  const nextCount = items.filter((i) => i.status === "next").length;

  return (
    <SectionWrapper id="roadmap">
      <SectionIntro
        heading="Product"
        gradient="Roadmap"
        description="What we're building now and what comes next."
      />
      {loading && (
        <div className="text-center -mt-6 mb-6">
          <Loader2 className="inline-block h-4 w-4 animate-spin" style={{ color: tint("cyan", 50) }} />
        </div>
      )}

      {/* Progress bar — most informative element first */}
      <RoadmapProgress />

      {emptyFromSource ? (
        <motion.div
          variants={fadeUp}
          className="mt-12 mx-auto max-w-md flex flex-col items-center text-center"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border"
            style={{
              borderColor: tint("cyan", 20),
              backgroundColor: tint("cyan", 6),
              color: BRAND_VAR.cyan,
            }}
          >
            <Compass className="h-5 w-5" />
          </div>
          <p className="mt-4 text-lg font-medium text-foreground">
            {t.roadmapSection.empty}
          </p>
          <p className="mt-1 text-base text-muted-dark">
            {t.roadmapSection.emptyHint}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Summary pills */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <div
              className="flex items-center gap-2 rounded-full border px-4 py-2"
              style={{ borderColor: tint("cyan", 20), backgroundColor: tint("cyan", 5) }}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 6, 60) }} />
              <span className="text-base font-mono font-medium" style={{ color: BRAND_VAR.cyan }}>
                {inProgressCount} {t.roadmapSection.inProgress}
              </span>
            </div>
            <div
              className="flex items-center gap-2 rounded-full border px-4 py-2"
              style={{ borderColor: tint("purple", 20), backgroundColor: tint("purple", 5) }}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tint("purple", 60) }} />
              <span className="text-base font-mono font-medium" style={{ color: tint("purple", 70) }}>
                {nextCount} {t.roadmapSection.next}
              </span>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={staggerContainer} className="mt-16 mx-auto max-w-4xl">
            {items.map((item, i) => (
              <RoadmapCard key={item.id} item={item} index={i} total={items.length} />
            ))}
          </motion.div>
        </>
      )}
    </SectionWrapper>
  );
}
