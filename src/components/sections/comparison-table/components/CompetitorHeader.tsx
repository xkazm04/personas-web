"use client";

import Image from "next/image";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { Competitor } from "@/data/comparison";
import { COMPETITOR_MARKS } from "../data";

export default function CompetitorHeader({
  competitor,
  isPersonas,
}: {
  competitor: Competitor;
  isPersonas: boolean;
}) {
  const Mark = COMPETITOR_MARKS[competitor.id];
  return (
    <div role="columnheader" className="flex flex-col items-center gap-2 min-w-0">
      {isPersonas ? (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl ring-1"
          style={{ backgroundColor: tint("cyan", 10), borderColor: tint("cyan", 30) }}
        >
          <Image src="/imgs/logo.png" alt="Personas" width={22} height={22} className="h-6 w-6 object-contain" />
        </div>
      ) : Mark ? (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl ring-1"
          style={{
            backgroundColor: `${competitor.color}1a`,
            boxShadow: `0 0 20px ${competitor.color}15`,
          }}
        >
          <Mark size={22} style={{ color: competitor.color }} />
        </div>
      ) : (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${competitor.color}1a` }}
        >
          <span className="text-base font-bold" style={{ color: competitor.color }}>
            {competitor.name[0]}
          </span>
        </div>
      )}
      <span className="text-base font-semibold text-foreground truncate max-w-full">{competitor.name}</span>
      <span
        className="rounded-full border px-2 py-0.5 text-base font-medium truncate max-w-full"
        style={
          isPersonas
            ? { borderColor: tint("emerald", 30), backgroundColor: tint("emerald", 10), color: BRAND_VAR.emerald }
            : { borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.05)", color: "var(--muted)" }
        }
      >
        {competitor.pricing}
      </span>
    </div>
  );
}
