"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Connector } from "@/data/connectors";
import { categories } from "@/data/connectors";
import { friendlyAuthType } from "../data";

export default function ConnectorCard({
  connector: c,
  index,
  onClick,
}: {
  connector: Connector;
  index: number;
  onClick?: () => void;
}) {
  const categoryMeta = categories.find((cat) => cat.key === c.category);
  const iconName = c.icon ?? c.name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.03, 0.6), duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-glass bg-gradient-to-br from-white/[0.035] to-white/[0.008] transition-[border-color] duration-500 hover:border-glass-strong cursor-pointer will-change-transform"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <Image
          src={`/tools/${iconName}.svg`}
          alt=""
          width={120}
          height={120}
          className="opacity-[0.04] transition-[opacity,transform] duration-500 group-hover:opacity-[0.12] group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div
        className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div
        className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: `${c.color}15` }}
      />

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${c.color}18` }}
          >
            <Image
              src={`/tools/${iconName}.svg`}
              alt={`${c.label} logo`}
              width={28}
              height={28}
              className="h-[28px] w-[28px] object-contain drop-shadow-[0_0_1px_rgba(255,255,255,0.15)]"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-tight">{c.label}</h3>
            <span className="mt-0.5 inline-block text-base font-mono uppercase tracking-wider text-muted-dark">
              {categoryMeta?.label ?? c.category}
            </span>
          </div>
        </div>
        <p className="mt-2.5 text-base leading-relaxed text-muted line-clamp-2">{c.summary}</p>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full" style={{ backgroundColor: `${c.color}80` }} />
          <span className="text-base text-muted-dark">{friendlyAuthType(c.authType)}</span>
        </div>
      </div>
    </motion.div>
  );
}
