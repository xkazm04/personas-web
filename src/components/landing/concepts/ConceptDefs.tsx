import type { CSSProperties } from "react";

const v = (name: string): CSSProperties => ({ stopColor: `var(--ln-${name})` });
const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, var(--ln-${a}) ${pct}%, var(--ln-${b}))`;
const mixStop = (a: string, pct: number, b: string): CSSProperties => ({ stopColor: mix(a, pct, b) });
const alpha = (name: string, pct: number) => `color-mix(in srgb, var(--ln-${name}) ${pct}%, transparent)`;

/**
 * Gradients, filters, patterns and symbols shared by all six concept figures.
 * Rendered once, zero-sized; the figures reference them by id (`url(#ci-g-body)`).
 * Colours are `--ln-*` tokens, so every figure re-tints with the skin.
 */
export default function ConceptDefs() {
  return (
    <svg className="ln-ci-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ci-g-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={v("plastic-hi")} />
          <stop offset=".55" style={v("plastic")} />
          <stop offset="1" style={v("plastic-lo")} />
        </linearGradient>
        <linearGradient id="ci-g-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={v("cap")} />
          <stop offset="1" style={mixStop("cap", 80, "cap-edge")} />
        </linearGradient>
        <linearGradient id="ci-g-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={v("hl")} stopOpacity=".5" />
          <stop offset=".2" style={v("hl")} stopOpacity="0" />
          <stop offset=".68" style={v("shade")} stopOpacity="0" />
          <stop offset="1" style={v("shade")} stopOpacity=".22" />
        </linearGradient>
        <linearGradient id="ci-g-win" x1="0" y1="0" x2=".35" y2="1">
          <stop offset="0" style={mixStop("well", 78, "plastic-lo")} />
          <stop offset=".6" style={v("well")} />
        </linearGradient>
        <linearGradient id="ci-g-lcd" x1="0" y1="0" x2=".5" y2="1">
          <stop offset="0" style={mixStop("lcd-bg", 88, "lcd")} />
          <stop offset=".7" style={v("lcd-bg")} />
        </linearGradient>
        <linearGradient id="ci-g-knobtop" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" style={v("plastic-hi")} />
          <stop offset="1" style={v("plastic-lo")} />
        </linearGradient>
        <linearGradient id="ci-g-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={v("cap-edge")} />
          <stop offset=".42" style={v("cap")} />
          <stop offset="1" style={mixStop("cap-edge", 78, "well")} />
        </linearGradient>
        <radialGradient id="ci-g-knob" cx=".38" cy=".3" r=".78">
          <stop offset="0" style={v("cap")} />
          <stop offset=".62" style={mixStop("cap", 72, "cap-edge")} />
          <stop offset="1" style={v("cap-edge")} />
        </radialGradient>
        <radialGradient id="ci-g-metal-r" cx=".4" cy=".32" r=".75">
          <stop offset="0" style={v("plastic-hi")} />
          <stop offset=".7" style={v("cap-edge")} />
          <stop offset="1" style={mixStop("cap-edge", 70, "well")} />
        </radialGradient>
        <radialGradient id="ci-g-dark" cx=".38" cy=".3" r=".8">
          <stop offset="0" style={mixStop("c-graphite", 70, "plastic-hi")} />
          <stop offset=".7" style={v("c-graphite")} />
          <stop offset="1" style={v("well")} />
        </radialGradient>
        <radialGradient id="ci-g-screw" cx=".4" cy=".35" r=".7">
          <stop offset="0" style={v("plastic-hi")} />
          <stop offset="1" style={v("cap-edge")} />
        </radialGradient>
        <radialGradient id="ci-g-contact">
          <stop offset="0" style={v("shade")} stopOpacity=".42" />
          <stop offset=".6" style={v("shade")} stopOpacity=".14" />
          <stop offset="1" style={v("shade")} stopOpacity="0" />
        </radialGradient>
        <pattern id="ci-p-scan" width="4" height="3" patternUnits="userSpaceOnUse">
          <rect width="4" height="1" style={{ fill: "var(--ln-well)", opacity: 0.4 }} />
        </pattern>
        <pattern id="ci-p-slat" width="12" height="9" patternUnits="userSpaceOnUse">
          <rect width="12" height="9" style={{ fill: "var(--ln-cap)" }} />
          <rect y="6.6" width="12" height="2.4" style={{ fill: "var(--ln-cap-edge)" }} />
          <rect width="12" height="1" style={{ fill: alpha("hl", 45) }} />
        </pattern>
        <pattern id="ci-p-hazard" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" style={{ fill: "var(--ln-well)" }} />
          <rect width="5" height="10" style={{ fill: "var(--ln-signal)" }} />
        </pattern>
        <filter id="ci-f-glow" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="1.3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ci-f-led" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ci-f-drop" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="1.8" style={{ floodColor: alpha("shade", 40) }} />
        </filter>
        <filter id="ci-f-lift" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="1" dy="5" stdDeviation="3.6" style={{ floodColor: alpha("shade", 38) }} />
        </filter>
        <symbol id="ci-s-hub" viewBox="-10 -10 20 20">
          <circle r="9.6" style={{ fill: "var(--ln-paper)" }} />
          <circle r="9.1" style={{ fill: "none", stroke: alpha("shade", 30), strokeWidth: 0.8 }} />
          <circle cx="0" cy="-6.9" r="1.2" style={{ fill: alpha("shade", 35) }} />
          <circle cx="5.98" cy="3.45" r="1.2" style={{ fill: alpha("shade", 35) }} />
          <circle cx="-5.98" cy="3.45" r="1.2" style={{ fill: alpha("shade", 35) }} />
          <circle r="4.4" style={{ fill: "var(--ln-well)" }} />
          <path d="M0-4.4v2.3M3.81 2.2l-2 -1.15M-3.81 2.2l2-1.15" style={{ stroke: "var(--ln-paper)", strokeWidth: 1.9 }} />
        </symbol>
        <symbol id="ci-s-screw" viewBox="-5 -5 10 10">
          <circle r="4.4" style={{ fill: "url(#ci-g-screw)", stroke: alpha("shade", 32), strokeWidth: 0.5 }} />
          <path d="M-2.6-1.1L2.6 1.1" style={{ stroke: alpha("shade", 55), strokeWidth: 1.1, strokeLinecap: "round" }} />
        </symbol>
      </defs>
    </svg>
  );
}
