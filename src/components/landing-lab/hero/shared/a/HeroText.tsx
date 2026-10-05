"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import HoneycombMark from "@/components/HoneycombMark";
import { useTranslation } from "@/i18n/useTranslation";
import HeroCtas from "./HeroCtas";

/** Display scale follows the smaller of width and height so a laptop gets a shorter, not a wrapped, headline. */
const DISPLAY = "clamp(2.75rem, min(7.4vw, 11.5svh), 7.75rem)";

const rise = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.15 + i * 0.12, ease: "easeOut" as const } }),
};

/**
 * The hero's typography zone: eyebrow, two-line display headline, one-line
 * sub, the real CTAs and the trust line. Motion only gates through `still`
 * (props, never markup) so server and client render the same shape.
 */
export default function HeroText({
  line1,
  line2,
  sub,
  still,
  align = "start",
  scale = 1,
  inline = false,
  eyebrow = true,
  children,
}: {
  line1: string;
  line2: string;
  sub: string;
  still: boolean;
  align?: "start" | "center";
  /** Multiplier on the display size, for longer headlines. */
  scale?: number;
  /** Both headline lines on one row (wraps naturally when narrow). */
  inline?: boolean;
  /** Show the product badge above the headline. */
  eyebrow?: boolean;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const center = align === "center";
  const item = (i: number) => ({
    custom: i,
    variants: rise,
    initial: still ? "visible" : "hidden",
    animate: "visible",
  });
  return (
    <div className={`flex flex-col gap-[clamp(0.75rem,2.4svh,1.75rem)] ${center ? "items-center text-center" : "items-center text-center lg:items-start lg:text-left"}`}>
      {eyebrow && (
        <motion.span
          {...item(0)}
          className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/60 bg-brand-cyan/10 px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-wider text-brand-cyan backdrop-blur-sm"
        >
          <HoneycombMark className="shrink-0" />
          {t.hero.badge}
        </motion.span>
      )}
      <motion.h1
        {...item(1)}
        id="hero-heading"
        className="font-extrabold leading-[1.0] tracking-tight text-balance"
        style={{ fontSize: scale === 1 ? DISPLAY : `calc(${DISPLAY} * ${scale})` }}
      >
        <span className={inline ? "text-foreground" : "block text-foreground"}>{line1}</span>{inline && " "}
        <span className={`${inline ? "" : "block "}bg-linear-to-r from-brand-cyan via-accent to-brand-purple bg-clip-text text-transparent`}>{line2}</span>
      </motion.h1>
      <motion.p {...item(2)} className={`max-w-xl text-lg font-light leading-snug text-muted md:text-xl lg:text-2xl ${center ? "" : "lg:max-w-lg"}`}>
        {sub}
      </motion.p>
      {children}
      <motion.div {...item(3)} className="w-full">
        <HeroCtas align={align} />
      </motion.div>
      <motion.p {...item(4)} className="text-sm font-light text-muted-dark">
        {t.hero.trustLine}
      </motion.p>
    </div>
  );
}
