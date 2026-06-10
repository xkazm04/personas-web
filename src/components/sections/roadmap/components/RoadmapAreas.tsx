"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { AREAS, type AreaBarDef, type BarMotif } from "../areas";
import AreaCardShell from "./AreaCardShell";
import FlagArt from "./FlagArt";

/**
 * The roadmap as a fulfillment overview — the "Reveal" treatment: the
 * illustration IS the bar. Each slice is a tall tile whose art sits dim and
 * grayscale; a full-color copy is clipped to the completion width behind a
 * glowing seam, so the picture literally develops as the work lands.
 * Typography lives on its own bottom scrim — it never fights the art.
 */
export default function RoadmapAreas() {
  return (
    <div className="mt-12 mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
      {AREAS.map((area) => (
        <AreaCardShell key={area.key} area={area}>
          <div className={`mt-4 grid gap-3 ${area.wide ? "sm:grid-cols-2" : ""}`}>
            {area.bars.map((bar, i) => (
              <RevealTile
                key={bar.label}
                bar={bar}
                brand={area.brand}
                index={i}
                size={area.wide ? "sm" : "md"}
              />
            ))}
          </div>
        </AreaCardShell>
      ))}
    </div>
  );
}

/** The tile's full-bleed artwork, by motif kind. */
function TileArt({ motif, brand }: { motif?: BarMotif; brand: BrandKey }) {
  if (motif?.kind === "flag") {
    return <FlagArt flag={motif.flag} className="h-full w-full" />;
  }
  if (motif?.kind === "image") {
    return (
      <>
        <Image src={motif.dark} alt="" fill sizes="480px" className="hidden object-cover dark:block" />
        <Image src={motif.light} alt="" fill sizes="480px" className="block object-cover dark:hidden" />
      </>
    );
  }
  return (
    <div
      className="h-full w-full"
      style={{
        background: `linear-gradient(115deg, ${tint(brand, 30)} 0%, ${tint(brand, 8)} 55%, transparent 100%)`,
      }}
    >
      {motif?.kind === "icon" && (
        <motif.icon
          className="absolute right-5 top-1/2 h-10 w-10 -translate-y-1/2"
          style={{ color: BRAND_VAR[brand] }}
        />
      )}
    </div>
  );
}

function RevealTile({
  bar,
  brand,
  index,
  size,
}: {
  bar: AreaBarDef;
  brand: BrandKey;
  index: number;
  size: "md" | "sm";
}) {
  const reduced = useReducedMotion() ?? false;
  const pct = Math.round(bar.value * 100);
  const revealClip = `inset(0 ${100 - pct}% 0 0)`;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={`${bar.label}: ${pct}%`}
      className={`relative overflow-hidden rounded-xl border border-glass bg-white/[0.02] ${
        size === "md" ? "h-24" : "h-20"
      }`}
    >
      {/* Undeveloped art — dim, colorless */}
      <div className="absolute inset-0 opacity-25 grayscale" aria-hidden="true">
        <TileArt motif={bar.motif} brand={brand} />
      </div>

      {/* Developed art — full color, clipped to completion */}
      <motion.div
        className="absolute inset-0"
        aria-hidden="true"
        style={reduced ? { clipPath: revealClip } : undefined}
        initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
        whileInView={reduced ? undefined : { clipPath: revealClip }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 + index * 0.1 }}
      >
        <TileArt motif={bar.motif} brand={brand} />
      </motion.div>

      {/* The developing seam */}
      <motion.div
        className="absolute inset-y-0 w-[2px] -translate-x-1/2"
        aria-hidden="true"
        style={{
          background: BRAND_VAR[brand],
          boxShadow: `0 0 12px ${tint(brand, 80)}, 0 0 28px ${tint(brand, 40)}`,
          ...(reduced ? { left: `${pct}%` } : null),
        }}
        initial={reduced ? false : { left: "0%" }}
        whileInView={reduced ? undefined : { left: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 + index * 0.1 }}
      />

      {/* Caption scrim — typography owns this zone */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-2 pt-7">
        <span className="min-w-0 truncate font-mono text-sm font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {bar.label}
        </span>
        <span className="flex shrink-0 items-baseline gap-1.5 font-mono text-xs text-white/80">
          {bar.detail}
          <span className="text-sm font-bold tabular-nums" style={{ color: BRAND_VAR[brand] }}>
            {pct}%
          </span>
        </span>
      </div>
    </div>
  );
}
