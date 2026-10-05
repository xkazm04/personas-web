"use client";

import { tokenizePrompt } from "@/components/sections/playground-split/components/SyntaxPrompt";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/**
 * The prompt with its keywords picked out, as the live editor does - plus a
 * highlighter stroke that sweeps under each keyword, one after another, once
 * the agent has `lit` (read) them. The sweep is a CSS background-size
 * transition, so reduced motion simply drops the transition.
 */
export default function PromptText({
  text,
  lit,
  reduced,
  brand = "cyan",
  className = "",
  plainClassName = "text-foreground",
}: {
  text: string;
  lit: boolean;
  reduced: boolean;
  brand?: BrandKey;
  className?: string;
  plainClassName?: string;
}) {
  let k = 0;
  return (
    <p className={className}>
      {tokenizePrompt(text).map((part, i) => {
        if (!part.keyword) return <span key={i} className={plainClassName}>{part.text}</span>;
        const order = k++;
        return (
          <span
            key={i}
            className="rounded-[0.2em] font-semibold"
            style={{
              color: BRAND_VAR[brand],
              backgroundImage: `linear-gradient(${tint(brand, 22)}, ${tint(brand, 22)})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 100%",
              backgroundSize: lit ? "100% 100%" : "0% 100%",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              transition: reduced ? "none" : `background-size 420ms ease-out ${order * 140}ms`,
            }}
          >
            {part.text}
          </span>
        );
      })}
    </p>
  );
}
