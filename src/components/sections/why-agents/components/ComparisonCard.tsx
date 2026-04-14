"use client";

import { memo, type ElementType, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

export type ComparisonCardColor = {
  orb: string;
  line: string;
  grid: string;
  corner: string;
  iconBg: string;
  iconRing: string;
  iconText: string;
  subtitle: string;
};

type ComparisonCardProps = {
  variant: Variants;
  texture: string;
  className: string;
  color: ComparisonCardColor;
  cornerPosition: "top-left" | "bottom-right";
  extraOrbs?: ReactNode;
  icon: ElementType;
  title: string;
  subtitle: string;
  children: ReactNode;
};

const ComparisonCard = memo(function ComparisonCard({
  variant,
  texture,
  className,
  color,
  cornerPosition,
  extraOrbs,
  icon: Icon,
  title,
  subtitle,
  children,
}: ComparisonCardProps) {
  return (
    <motion.div
      variants={variant}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      className={`${texture} group rounded-2xl p-4 md:p-6 relative overflow-hidden transition-[border-color,opacity] duration-500 will-change-transform ${className}`}
    >
      <div className={`pointer-events-none absolute h-40 w-40 rounded-full blur-3xl ${color.orb}`} />
      {extraOrbs}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${color.line}`}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(${color.grid} 1px, transparent 1px), linear-gradient(90deg, ${color.grid} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      {cornerPosition === "top-left" ? (
        <div className="pointer-events-none absolute top-0 left-0 w-10 h-10">
          <div className={`absolute top-0 left-0 w-full h-px bg-linear-to-r to-transparent ${color.corner}`} />
          <div className={`absolute top-0 left-0 h-full w-px bg-linear-to-b to-transparent ${color.corner}`} />
        </div>
      ) : (
        <div className="pointer-events-none absolute bottom-0 right-0 w-10 h-10">
          <div className={`absolute bottom-0 right-0 w-full h-px bg-linear-to-l to-transparent ${color.corner}`} />
          <div className={`absolute bottom-0 right-0 h-full w-px bg-linear-to-t to-transparent ${color.corner}`} />
        </div>
      )}

      <div className="relative flex items-center gap-3 mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.iconBg} ring-1 ${color.iconRing}`}
        >
          <Icon className={`h-5 w-5 ${color.iconText}`} />
        </motion.div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className={`text-base font-mono uppercase tracking-wider mt-0.5 ${color.subtitle}`}>
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </motion.div>
  );
});

export default ComparisonCard;
