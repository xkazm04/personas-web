"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { Tool } from "../types";
import ConnectorIcon from "./ConnectorIcon";

interface Props {
  tool: Tool;
  index: number;
  isActive: boolean;
  autoplay: boolean;
  progress: number;
  onClick: () => void;
  variant: "desktop" | "mobile";
}

const ToolButton = forwardRef<HTMLButtonElement, Props>(function ToolButton(
  { tool, index, isActive, autoplay, progress, onClick, variant },
  ref,
) {
  const baseClass =
    variant === "desktop"
      ? "relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-sm transition-all duration-500 cursor-pointer"
      : "relative flex shrink-0 snap-start flex-col items-center gap-2 overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-sm transition-all duration-500 cursor-pointer";

  const activeClass =
    variant === "desktop"
      ? "border-brand-cyan/30 bg-brand-cyan/8 shadow-[0_0_40px_rgba(6,182,212,0.10)] scale-110 z-10"
      : "border-brand-cyan/30 bg-brand-cyan/8 shadow-[0_0_40px_rgba(6,182,212,0.10)]";

  return (
    <motion.button
      ref={ref}
      tabIndex={isActive ? 0 : -1}
      aria-pressed={isActive}
      onClick={onClick}
      className={`${baseClass} ${isActive ? activeClass : "border-white/5 bg-white/1.5 hover:border-white/10 hover:bg-white/3"}`}
      style={{ boxShadow: isActive ? `0 0 40px ${tool.color}30` : undefined }}
      whileHover={variant === "desktop" ? { scale: isActive ? 1.1 : 1.06 } : undefined}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * (variant === "desktop" ? 0.06 : 0.04),
        duration: variant === "desktop" ? 0.4 : 0.3,
      }}
    >
      {isActive && autoplay && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 bg-white/6">
          <div
            className="h-full bg-linear-to-r from-brand-cyan to-brand-purple transition-none"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-shadow duration-500 ${
          isActive ? "shadow-[0_0_20px_rgba(6,182,212,0.15)]" : ""
        }`}
        style={{ backgroundColor: `${tool.color}15` }}
      >
        <ConnectorIcon src={tool.icon.src} />
      </div>
      <span
        className={`text-base font-medium transition-colors duration-300 ${
          isActive ? "text-foreground" : "text-muted"
        } ${variant === "mobile" ? "whitespace-nowrap" : ""}`}
      >
        {tool.name}
      </span>
    </motion.button>
  );
});

export default ToolButton;
