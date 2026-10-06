"use client";

import { useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";

/* Below the stage (phones, narrow tablets) the wide compositions would shrink
 * their type under the floor, so each variant hands its story to this stacked
 * list instead. The variants are client-only (ssr: false), so choosing the
 * layout by width never meets a server render. */

const WIDE = "(min-width: 64rem)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True at stage widths, where the composed art is shown. */
export function useWide(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
}

export interface CompactItem {
  key: string;
  brand: BrandKey;
  icon: LucideIcon;
  kicker: string;
  title: string;
  line?: string;
}

export function CompactList({ label, items }: { label: string; items: CompactItem[] }) {
  return (
    <motion.ol variants={fadeUp} aria-label={label} className="mx-auto flex max-w-xl flex-col gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <li
            key={it.key}
            className="flex items-start gap-4 rounded-2xl border p-4"
            style={{ borderColor: tint(it.brand, 35), background: `linear-gradient(120deg, ${tint(it.brand, 12)}, transparent 70%)` }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: tint(it.brand, 55), background: tint(it.brand, 16) }}
            >
              <Icon aria-hidden className="h-5 w-5" style={{ color: BRAND_VAR[it.brand] }} />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: BRAND_VAR[it.brand] }}>
                {it.kicker}
              </span>
              <span className="mt-0.5 block text-lg font-semibold leading-snug text-foreground">{it.title}</span>
              {it.line && <span className="mt-0.5 block text-base leading-snug text-muted">{it.line}</span>}
            </span>
          </li>
        );
      })}
    </motion.ol>
  );
}
