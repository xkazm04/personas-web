"use client";

import Image from "next/image";
import { useQualityTier } from "@/contexts/QualityContext";

/**
 * Decorative cinematic illustration behind the top-left of the hero.
 *
 * Purely ambient (`aria-hidden`), so it is gated the same way as the other
 * decorative layers (`AmbientOrbs`, `TopoBackground`): the low quality tier
 * drops it entirely rather than paying for a 325 KB texture plus the two
 * effects that force it onto its own compositor layer — `mix-blend-lighten`
 * (blends against everything painted beneath it) and the radial `maskImage`.
 *
 * It is also deliberately NOT `priority`: it is not the LCP element — the
 * hero `h1` is — and preloading it stole bandwidth from the text that
 * actually gets measured.
 */
export default function HeroAmbientIllustration() {
  const tier = useQualityTier();

  if (tier === "low") return null;

  const mask =
    "radial-gradient(ellipse 90% 85% at 15% 25%, black 0%, rgba(0,0,0,0.5) 35%, transparent 65%)";

  return (
    <div className="pointer-events-none absolute left-0 top-0 z-0 h-[360px] w-full max-w-[560px] overflow-hidden md:h-[540px] md:max-w-[720px]">
      {/* `fill` (not width/height) — the parent's aspect ratio varies with the
          viewport, so fixed width/height + `h-full w-full` tripped the browser's
          "one dimension modified, not the other" aspect-ratio warning. */}
      <Image
        src="/imgs/illustration_cyber_cinematic.png"
        alt=""
        fill
        sizes="(max-width: 768px) 560px, 720px"
        className="object-cover opacity-[0.98] mix-blend-lighten"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        aria-hidden="true"
      />
    </div>
  );
}
