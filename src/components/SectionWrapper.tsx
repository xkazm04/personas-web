"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";

const SectionWrapper = forwardRef<
  HTMLElement,
  {
    id?: string;
    children: React.ReactNode;
    className?: string;
    dotGrid?: boolean;
    "aria-label"?: string;
    "aria-roledescription"?: string;
  }
>(function SectionWrapper(
  {
    id,
    children,
    className = "",
    dotGrid = false,
    "aria-label": ariaLabel,
    "aria-roledescription": ariaRoleDescription,
  },
  ref,
) {
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className={`relative px-6 py-32 md:py-40 ${dotGrid ? "dot-grid" : ""} ${className}`}
      aria-label={ariaLabel}
      aria-roledescription={ariaRoleDescription}
      data-animate-when-visible
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
});

export default SectionWrapper;
