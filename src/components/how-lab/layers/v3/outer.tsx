"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { loopTransition } from "@/lib/motion/loop-gate";
import { CARD, FLEET_CARD, SCREEN, cardXY, chainInCard, placeAttr } from "./geometry";
import { ChainSketch } from "./inner";

/** The two outer frames, each in its own 1320x500 local units. */

const HEAL = { col: 0, row: 2 };
const FLEET = Array.from({ length: CARD.cols * CARD.rows }, (_, k) => ({ col: k % CARD.cols, row: Math.floor(k / CARD.cols) }));
const TRACE = "M900 80 H990 L1004 80 L1016 46 L1030 112 L1042 80 H1140 L1152 80 L1162 100 L1172 56 L1182 80 H1290";

/** C - A fleet: a dozen chains side by side, watched live, one healing. */
export function FleetScene({ live, title, healed }: { live: boolean; title: string; healed: string }) {
  return (
    <g>
      <rect x="0" y="0" width="1320" height="500" fill="color-mix(in srgb, var(--background) 82%, transparent)" />
      <text x="560" y="96" fontSize="44" fontWeight="700" fill="var(--foreground)">
        {title}
      </text>
      <path d={TRACE} fill="none" stroke={tint("amber", 25)} strokeWidth="4" />
      <motion.path
        d={TRACE}
        fill="none"
        stroke={BRAND_VAR.amber}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={live ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={loopTransition(live, { duration: 2.4, ease: "linear", repeatDelay: 0.4 })}
      />
      {FLEET.map(({ col, row }, k) => {
        const { x, y } = cardXY(col, row);
        const focus = col === FLEET_CARD.col && row === FLEET_CARD.row;
        const heal = col === HEAL.col && row === HEAL.row;
        return (
          <g key={k}>
            <rect
              x={x}
              y={y}
              width={CARD.w}
              height={CARD.h}
              rx="14"
              fill="color-mix(in srgb, var(--surface) 90%, transparent)"
              stroke={focus ? tint("cyan", 70) : "color-mix(in srgb, var(--foreground) 16%, transparent)"}
              strokeWidth={focus ? 2.5 : 1.5}
              vectorEffect="non-scaling-stroke"
            />
            {!focus && (
              <g transform={placeAttr(chainInCard(col, row))}>
                <ChainSketch />
              </g>
            )}
            <circle cx={x + CARD.w - 18} cy={y + 18} r="7" fill={BRAND_VAR.emerald} />
            {heal && (
              <>
                <motion.circle
                  cx={x + CARD.w - 18}
                  cy={y + 18}
                  r="7"
                  fill={BRAND_VAR.rose}
                  initial={false}
                  animate={live ? { opacity: [0, 1, 1, 0, 0] } : { opacity: 0 }}
                  transition={loopTransition(live, { duration: 3.2, ease: "easeInOut", repeatDelay: 0.8 })}
                />
                <text x={x + CARD.w - 32} y={y + 24} fontSize="18" textAnchor="end" fill={BRAND_VAR.emerald} fontWeight="600">
                  {healed}
                </text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** D - Your computer: the fleet is just a window on one laptop; keys stay home. */
export function ComputerScene({ keyring, noServers }: { keyring: string; noServers: string }) {
  const sw = 1320 * SCREEN.s;
  const sh = 500 * SCREEN.s;
  const EM = BRAND_VAR.emerald;
  return (
    <g>
      <ellipse cx={SCREEN.x + sw / 2} cy="372" rx="430" ry="34" fill={tint("emerald", 12)} />
      <rect x={SCREEN.x - 25} y={SCREEN.y - 22} width={sw + 50} height={sh + 46} rx="20" fill="color-mix(in srgb, var(--surface) 95%, transparent)" stroke={tint("emerald", 70)} strokeWidth="3" />
      <rect x={SCREEN.x} y={SCREEN.y} width={sw} height={sh} fill="var(--background)" />
      <path d={`M${SCREEN.x - 90} ${SCREEN.y + sh + 32} H${SCREEN.x + sw + 90} L${SCREEN.x + sw + 50} ${SCREEN.y + sh + 62} H${SCREEN.x - 50} Z`} fill={tint("emerald", 18)} stroke={tint("emerald", 55)} strokeWidth="3" />

      {/* Keys stay on the desk, in your keyring. */}
      <g stroke={EM} strokeWidth="5" fill="none" strokeLinecap="round">
        <circle cx="250" cy="320" r="46" />
        <circle cx="250" cy="320" r="15" />
        <path d="M265 320 H340 M322 320 V338 M336 320 V332" />
      </g>
      <text x="262" y="412" fontSize="21" textAnchor="middle" fill={EM} fontWeight="600" letterSpacing="4" style={{ textTransform: "uppercase" }}>
        {keyring}
      </text>

      {/* And no server anywhere. */}
      <path d="M1130 250 h110 a26 26 0 0 0 -8 -51 a38 38 0 0 0 -72 -8 a28 28 0 0 0 -30 59 z" fill="none" stroke="var(--muted-dark)" strokeWidth="4" strokeDasharray="8 8" />
      <path d="M1116 266 L1260 168" stroke="var(--brand-rose)" strokeWidth="5" strokeLinecap="round" />
      <text x="1190" y="312" fontSize="21" textAnchor="middle" fill="var(--muted)" fontWeight="600" letterSpacing="4" style={{ textTransform: "uppercase" }}>
        {noServers}
      </text>
    </g>
  );
}
