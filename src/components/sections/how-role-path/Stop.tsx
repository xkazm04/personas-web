"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { BRAND_VAR, brandShadow } from "@/lib/brand-theme";
import { EASE_CURVE } from "@/lib/animations";
import { STOP_HREFS, type RoleDef } from "./roles";
import { howSectionsCopy } from "@/i18n/pending/howSections";

/* Stage placement on the snake: 1 and 2 along the top row, then 3 under 2 and
 * 4 under 1 (full class strings so Tailwind can see them). */
const CELL = [
  "stage:col-start-1 stage:row-start-1",
  "stage:col-start-2 stage:row-start-1",
  "stage:col-start-2 stage:row-start-2",
  "stage:col-start-1 stage:row-start-2",
];

/** One station on the route: its number on the line, the section it leads to
 *  (the title is the jump link), and the role's reason to care. */
export default function Stop({
  index,
  role,
  animateIn,
}: {
  index: number;
  role: RoleDef;
  /** Fade the role line in: only after the visitor switches role. */
  animateIn: boolean;
}) {
  const c = howSectionsCopy.rolePath;
  const stop = c.stops[index];
  const color = BRAND_VAR[role.brand];
  const cut = stop.title.lastIndexOf(" ") + 1;
  const head = stop.title.slice(0, cut);
  const tail = stop.title.slice(cut);

  return (
    <li className={`relative pl-9 stage:pl-11 stage:pr-[clamp(2.5rem,7cqw,5rem)] stage:pt-[clamp(1.1rem,3.4cqh,2rem)] ${CELL[index]}`}>
      <span
        aria-hidden
        className="absolute left-0 top-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-background font-mono text-sm font-bold transition-[border-color,color,box-shadow] duration-500 stage:h-11 stage:w-11 stage:-translate-y-1/2 stage:text-base"
        style={{ borderColor: color, color, boxShadow: brandShadow(role.brand, 22, 35) }}
      >
        {index + 1}
      </span>
      <h3 className="text-lg font-semibold leading-snug text-foreground stage:text-[1.2rem]">
        <a
          href={STOP_HREFS[index]}
          aria-label={`${c.jump}: ${stop.title}`}
          className="group rounded-md transition-colors duration-300 hover:text-(--acc) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
          style={{ "--acc": color } as React.CSSProperties}
        >
          {head}
          {/* The last word and the arrow wrap together, so the arrow never sits alone. */}
          <span className="whitespace-nowrap">
            {tail}
            <ArrowDown aria-hidden className="ml-1.5 inline-block h-4 w-4 align-[-0.15em] transition-transform duration-300 group-hover:translate-y-0.5" style={{ color }} />
          </span>
        </a>
      </h3>
      <motion.p
        key={role.id}
        initial={animateIn ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: animateIn ? 0.1 * index : 0, ease: EASE_CURVE }}
        className="mt-1.5 max-w-[34rem] text-base leading-relaxed text-muted"
      >
        {stop[role.copy]}
      </motion.p>
    </li>
  );
}
