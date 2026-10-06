"use client";

import { motion } from "framer-motion";
import ToolMark from "../shared/ToolMark";
import { VB_W, pct } from "./geometry";

/** A real tool plugged into an end of the hub: where the chain starts or lands. */
export default function Endpoint({
  x,
  y,
  tool,
  label,
  lit,
  pulse,
  run,
  tone,
}: {
  x: number;
  y: number;
  tool: string;
  label: string;
  lit: boolean;
  pulse: boolean;
  run: boolean;
  tone: string;
}) {
  const size = `${(116 / VB_W) * 100}cqw`;
  return (
    <div className="absolute flex -translate-x-1/2 flex-col items-center" style={{ ...pct(x, y), marginTop: `calc(${size} / -2)` }}>
      <div className="relative" style={{ width: size, height: size }}>
        <motion.span
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: tone }}
          initial={false}
          animate={pulse && run ? { scale: [1, 1.7], opacity: [0.8, 0] } : { scale: 1, opacity: 0 }}
          transition={{ duration: pulse && run ? 0.9 : 0, ease: "easeOut" }}
        />
        <div
          className="flex h-full w-full items-center justify-center rounded-full border-2 transition-[border-color,box-shadow,background-color] duration-500"
          style={{
            borderColor: lit ? tone : "color-mix(in srgb, var(--foreground) 25%, transparent)",
            backgroundColor: lit ? `color-mix(in srgb, ${tone} 16%, var(--background))` : "var(--background)",
            boxShadow: lit ? `0 0 2.6cqw color-mix(in srgb, ${tone} 50%, transparent)` : "none",
          }}
        >
          <ToolMark id={tool} className="h-[46%] w-[46%]" />
        </div>
      </div>
      <span
        className="mt-[0.8cqw] whitespace-nowrap text-center text-[clamp(13px,1.4cqw,26px)] font-semibold transition-colors duration-500"
        style={{ color: lit ? "var(--foreground)" : "var(--muted-dark)" }}
      >
        {label}
      </span>
    </div>
  );
}
