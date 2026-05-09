"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { Tool } from "../types";
import ConnectorIcon from "./ConnectorIcon";

interface Props {
  activeTool: Tool;
  whatCanAutomateLabel: string;
}

const ToolDetailCard = forwardRef<HTMLDivElement, Props>(function ToolDetailCard(
  { activeTool, whatCanAutomateLabel },
  ref,
) {
  return (
    <motion.div
      key={activeTool.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto mt-8 max-w-3xl"
      ref={ref}
    >
      <div className="relative rounded-2xl border border-glass bg-linear-to-br from-white/2.5 to-transparent p-4 sm:p-8 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/imgs/noise.png')] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full blur-3xl"
          style={{ backgroundColor: `${activeTool.color}08` }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand-cyan/10 to-transparent" />

        <div className="relative mb-6 flex flex-wrap items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
            style={{ backgroundColor: `${activeTool.color}12`, boxShadow: `0 4px 20px ${activeTool.color}10` }}
          >
            <ConnectorIcon src={activeTool.icon.src} size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{activeTool.name}</h3>
            <p className="text-base text-muted">{whatCanAutomateLabel}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 items-start">
          {activeTool.useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.4, ease: "easeOut" }}
              className={`group rounded-xl border border-glass bg-white/1.5 p-4 transition-all duration-300 hover:bg-white/2.5 ${
                i === 1 ? "md:-mt-2" : i === 2 ? "md:mt-4" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <h4 className="text-base font-semibold text-foreground transition-colors">
                  {uc.title}
                </h4>
              </div>
              <p className="text-base leading-relaxed text-foreground/70 group-hover:text-foreground transition-colors">
                {uc.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

export default ToolDetailCard;
