"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY } from "../data";
import { BURIED_INDEX, CARD, PILE_CARDS, PILE_VIEWBOX } from "../pile-geometry";

/*
 * The before beat — a generic assistant's aftermath: 47 indistinct
 * notification cards teetering in one pile, every one of them shouting
 * (rose urgency dot), the single decision that matters tinted amber and
 * buried mid-pile. The one micro-interaction lives here: hover/focus the
 * buried card and it struggles to surface but can't — while the calm
 * card in the after beat lifts instantly (wired via `onEngage`).
 *
 * Reduced motion: cards render composed (no drop-in, no struggle);
 * `animate` props are gated, elements never dropped.
 */
export default function NoisePile({
  engaged,
  onEngage,
}: {
  engaged: boolean;
  onEngage: (v: boolean) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const buriedFill = `${uid}-buried`;

  /** Staggered spring drop-in per card; replays on viewport re-entry. */
  const drop = (i: number, rotate: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: -26, rotate: rotate - 5 },
          whileInView: { opacity: 1, y: 0, rotate: 0 },
          viewport: REPLAY,
          transition: { ...SPRING_POP, delay: 0.1 + i * 0.012 },
        };

  return (
    <div className="relative">
      <span className={`${ANNOTATION_DIM} absolute right-1 top-0`}>{COPY.beforeCount}</span>
      <svg
        viewBox={`0 0 ${PILE_VIEWBOX.w} ${PILE_VIEWBOX.h}`}
        className="w-full"
        role="img"
        aria-label={COPY.beforeLabel}
      >
        <defs>
          <linearGradient id={buriedFill} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: tint("amber", 22) }} />
            <stop offset="1" style={{ stopColor: tint("amber", 8) }} />
          </linearGradient>
        </defs>

        {PILE_CARDS.map((c) => {
          const pressed = !reduced && engaged && (c.i === BURIED_INDEX + 1 || c.i === BURIED_INDEX + 2);
          return (
            <motion.g key={c.i} {...drop(c.i, c.rotate)}>
              <motion.g
                transform={`rotate(${c.rotate} ${c.x + CARD.w / 2} ${c.y + CARD.h / 2})`}
                animate={reduced ? undefined : { y: pressed ? 3 : 0 }}
                transition={SPRING_POP}
              >
                {c.buried ? (
                  <motion.g
                    tabIndex={0}
                    role="button"
                    aria-label={COPY.buriedAria}
                    className="cursor-pointer outline-none"
                    onMouseEnter={() => onEngage(true)}
                    onMouseLeave={() => onEngage(false)}
                    onFocus={() => onEngage(true)}
                    onBlur={() => onEngage(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onEngage(!engaged);
                      }
                    }}
                    animate={
                      reduced
                        ? undefined
                        : engaged
                          ? { y: [0, -9, -3, -10, -4, 0], rotate: [0, -1.2, 0.8, -1, 0] }
                          : { y: 0, rotate: 0 }
                    }
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                  >
                    <rect
                      x={c.x}
                      y={c.y}
                      width={CARD.w}
                      height={CARD.h}
                      rx={5}
                      fill={`url(#${buriedFill})`}
                      stroke={engaged ? BRAND_VAR.amber : tint("amber", 55)}
                      strokeWidth={1.2}
                    />
                    <circle cx={c.x + 13} cy={c.y + CARD.h / 2} r={3} fill={BRAND_VAR.amber} />
                    <text
                      x={c.x + 24}
                      y={c.y + CARD.h / 2 + 3.5}
                      fontSize={10}
                      className="font-mono"
                      fill={BRAND_VAR.amber}
                    >
                      {COPY.buriedLine}
                    </text>
                  </motion.g>
                ) : (
                  <g>
                    <rect
                      x={c.x}
                      y={c.y}
                      width={CARD.w}
                      height={CARD.h}
                      rx={5}
                      fill="rgba(var(--surface-overlay), 0.07)"
                      stroke="rgba(var(--surface-overlay), 0.15)"
                    />
                    {/* every card shouts — urgency dot + indistinct text bars */}
                    <circle cx={c.x + 13} cy={c.y + CARD.h / 2} r={3} fill={tint("rose", 45)} />
                    <rect
                      x={c.x + 24}
                      y={c.y + 8}
                      width={CARD.w * 0.45}
                      height={3.5}
                      rx={1.75}
                      fill="rgba(var(--surface-overlay), 0.2)"
                    />
                    <rect
                      x={c.x + 24}
                      y={c.y + 14.5}
                      width={CARD.w * 0.62}
                      height={3.5}
                      rx={1.75}
                      fill="rgba(var(--surface-overlay), 0.12)"
                    />
                  </g>
                )}
              </motion.g>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
