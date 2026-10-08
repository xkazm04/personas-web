"use client";

import { forwardRef, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { useAnimationPauseRegister } from "@/hooks/useAnimationPause";

const SectionWrapper = forwardRef<
  HTMLElement,
  {
    id?: string;
    children: React.ReactNode;
    className?: string;
    dotGrid?: boolean;
    /** Desktop stage fit (styles/stage.css): "fill" = exactly one viewport
     *  high, the dominant visual goes in a `data-stage-slot`; "min" = at least
     *  one viewport high, content centred. Omit for natural flow. */
    fit?: "fill" | "min";
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-roledescription"?: string;
  }
>(function SectionWrapper(
  {
    id,
    children,
    className = "",
    dotGrid = false,
    fit,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-roledescription": ariaRoleDescription,
  },
  ref,
) {
  const pauseRef = useRef<HTMLElement | null>(null);
  useAnimationPauseRegister(pauseRef);

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      pauseRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );

  return (
    <motion.section
      ref={mergedRef}
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className={`relative px-4 py-20 sm:px-6 sm:py-28 md:py-36 ${dotGrid ? "dot-grid" : ""} ${className}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-roledescription={ariaRoleDescription}
      data-animate-when-visible
      data-stage={fit}
      // useAnimationPause toggles .animations-paused via classList; lazy
      // sections can be mutated by the observer before client hydration completes
      suppressHydrationWarning
    >
      <div className="mx-auto w-full max-w-6xl" data-stage-inner={fit ? "" : undefined}>
        {children}
      </div>
    </motion.section>
  );
});

export default SectionWrapper;
