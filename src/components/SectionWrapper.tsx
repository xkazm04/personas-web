"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";

export default function SectionWrapper({
  id,
  children,
  className = "",
  dotGrid = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  dotGrid?: boolean;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className={`relative px-6 py-24 md:py-32 ${dotGrid ? "dot-grid" : ""} ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
}
