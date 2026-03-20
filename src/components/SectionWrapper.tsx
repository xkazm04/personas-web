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
      className={`relative px-6 py-32 md:py-40 ${dotGrid ? "dot-grid" : ""} ${className}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-roledescription={ariaRoleDescription}
      data-animate-when-visible
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
});

export default SectionWrapper;
