"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { BRAND_VAR, brandShadow, tint, type BrandKey } from "@/lib/brand-theme";
import { MediumIcon, VoiceBar } from "../shared/icons";
import { BIG } from "../shared/type";

/**
 * The two voices in every moment, and the rule that makes the section:
 * YOUR bubble takes the colour of the hour (amber morning, green midday,
 * violet evening) - the world around you changes all day. HER bubble is the
 * same cyan, the same face, the same shape in every moment, at every hour,
 * by keyboard or by voice. Nothing about her changes but what she knows.
 */

export function YouBubble({
  accent,
  spoken,
  live,
  children,
}: {
  accent: BrandKey;
  spoken: boolean;
  /** The voice bar is moving (you are speaking and the clock runs). */
  live: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className="ml-auto flex max-w-[88%] items-center gap-[0.55em] rounded-2xl rounded-br-md border px-[0.8em] py-[0.4em] text-foreground"
      style={{ ...BIG, borderColor: tint(accent, 38), backgroundColor: tint(accent, 12) }}
    >
      {spoken && (
        <span className="flex shrink-0 items-center gap-[0.35em]" style={{ color: BRAND_VAR[accent] }}>
          <MediumIcon medium="spoken" />
          <VoiceBar live={live} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

/** Her: the same small portrait in every moment, and the same glass. */
export function HerBubble({
  before,
  recall,
  after,
  recalled,
}: {
  before: string;
  recall: string;
  after: string;
  /** The phrase she carried here from earlier in the day is lit. */
  recalled: boolean;
}) {
  return (
    <span className="flex max-w-[92%] items-end gap-[0.5em]" style={BIG}>
      <span
        className="relative h-[1.9em] w-[1.9em] shrink-0 overflow-hidden rounded-full border"
        style={{ borderColor: tint("cyan", 50), boxShadow: brandShadow("cyan", 10, 40) }}
      >
        <Image src="/athena/athena_baseline_640.webp" alt="" fill sizes="48px" className="object-cover" />
      </span>
      <span
        className="rounded-2xl rounded-bl-md border px-[0.8em] py-[0.4em] text-foreground"
        style={{ borderColor: tint("cyan", 34), backgroundColor: tint("cyan", 10) }}
      >
        {before && <span>{before}</span>}
        {before && recall && " "}
        {recall && (
          <span
            className="rounded-[0.3em] px-[0.15em] transition-[background-color,box-shadow] duration-500"
            style={{
              backgroundColor: recalled ? tint("cyan", 22) : "transparent",
              boxShadow: recalled ? `0 0 14px ${tint("cyan", 30)}` : "none",
            }}
          >
            {recall}
          </span>
        )}
        {(before || recall) && after && " "}
        {after && <span>{after}</span>}
      </span>
    </span>
  );
}
