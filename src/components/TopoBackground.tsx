"use client";

import { useReducedMotion } from "framer-motion";
import { useQualityTier } from "@/contexts/QualityContext";

/**
 * Topographic background — CSS gradient layers that approximate contour-line
 * aesthetics without SVG rasterisation overhead.
 *
 * Three compositor-friendly layers replace the previous SVG paths:
 *   1. Repeating radial rings (large contour field) — slowest parallax
 *   2. Concentric rings top-left cluster — medium parallax
 *   3. Concentric rings bottom-right + accent (high tier only) — fastest
 *
 * All layers use `will-change: transform` and CSS scroll-driven parallax,
 * identical to the previous implementation but without SVG path rasterisation.
 */
export default function TopoBackground() {
  const prefersReducedMotion = useReducedMotion();
  const tier = useQualityTier();

  if (prefersReducedMotion) return null;
  if (tier === "low") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ contain: "layout style paint" }}
    >
      {/* Layer 1: Large contour field — repeating radial rings */}
      <div
        className="absolute -inset-[10%] parallax-shape"
        style={{ "--parallax-offset": "-50px" } as React.CSSProperties}
      >
        <div
          className="topo-bg h-full w-full opacity-[0.05]"
          style={{
            backgroundImage: [
              /* Outer contour ring with cyan→purple gradient feel */
              "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 38%, rgba(6,182,212,0.6) 39%, transparent 40%)",
              "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 43%, rgba(168,85,247,0.4) 44%, transparent 45%)",
              "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 48%, rgba(255,255,255,0.5) 49%, transparent 50%)",
              "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 54%, rgba(255,255,255,0.35) 55%, transparent 56%)",
              "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 60%, rgba(255,255,255,0.25) 61%, transparent 62%)",
              /* Small detail contours — bottom area */
              "radial-gradient(ellipse 15% 5% at 48% 81%, transparent 48%, rgba(255,255,255,0.3) 50%, transparent 52%)",
              /* Small detail contours — top-left area */
              "radial-gradient(ellipse 12% 4% at 15% 38%, transparent 48%, rgba(255,255,255,0.3) 50%, transparent 52%)",
            ].join(", "),
          }}
        />
      </div>

      {/* Layer 2: Top-left concentric ring cluster */}
      <div
        className="absolute -inset-[10%] parallax-shape"
        style={{ "--parallax-offset": "-110px" } as React.CSSProperties}
      >
        <div
          className="topo-bg h-full w-full opacity-[0.05]"
          style={{
            backgroundImage: [
              "radial-gradient(circle at 21% 28%, transparent 68px, rgba(6,182,212,0.8) 69px, transparent 71px)",
              "radial-gradient(circle at 21% 28%, transparent 48px, rgba(255,255,255,0.5) 49px, transparent 51px)",
              "radial-gradient(circle at 21% 28%, transparent 28px, rgba(255,255,255,0.4) 29px, transparent 31px)",
            ].join(", "),
          }}
        />
      </div>

      {/* Layer 3: Bottom-right + accent clusters (high tier only) */}
      {tier === "high" && (
        <div
          className="absolute -inset-[10%] parallax-shape"
          style={{ "--parallax-offset": "-170px" } as React.CSSProperties}
        >
          <div
            className="topo-bg h-full w-full opacity-[0.05]"
            style={{
              backgroundImage: [
                /* Bottom-right circles */
                "radial-gradient(circle at 77% 73%, transparent 58px, rgba(168,85,247,0.7) 59px, transparent 61px)",
                "radial-gradient(circle at 77% 73%, transparent 38px, rgba(255,255,255,0.5) 39px, transparent 41px)",
                "radial-gradient(circle at 77% 73%, transparent 18px, rgba(255,255,255,0.4) 19px, transparent 21px)",
                /* Accent ellipse cluster */
                "radial-gradient(ellipse 50px 70px at 71% 38%, transparent 70%, rgba(52,211,153,0.6) 72%, transparent 74%)",
                "radial-gradient(ellipse 30px 45px at 71% 38%, transparent 70%, rgba(255,255,255,0.4) 72%, transparent 74%)",
              ].join(", "),
            }}
          />
        </div>
      )}
    </div>
  );
}
