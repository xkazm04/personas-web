"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { CellDef, CellStatus } from "../../designMatrixShared";
import { CELL_IMAGE, CELL_HEIGHT_CLASS, FLUID_DIMENSION } from "../data";
import TileValue from "./TileValue";

export default function MatrixTile({
  def,
  status,
}: {
  def: CellDef;
  status: CellStatus;
}) {
  const isActive = status.state !== "pending";
  const isAsking = status.state === "asking";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-col rounded-2xl border backdrop-blur-sm overflow-hidden ${CELL_HEIGHT_CLASS}`}
      style={{
        borderColor: isActive ? `${def.color}55` : "rgba(255,255,255,0.08)",
        boxShadow: isActive ? `0 0 36px ${def.color}25` : undefined,
      }}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"
        }`}
      >
        <Image
          src={CELL_IMAGE[def.key]}
          alt=""
          fill
          sizes="(min-width: 1024px) 280px, 50vw"
          className="object-cover"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background: isActive
              ? `linear-gradient(180deg, rgba(8,8,14,0.15) 0%, rgba(8,8,14,0.6) 55%, rgba(8,8,14,0.92) 100%)`
              : `linear-gradient(180deg, rgba(8,8,14,0.45) 0%, rgba(8,8,14,0.78) 55%, rgba(8,8,14,0.96) 100%)`,
          }}
        />
        {isActive && (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 45% at 50% 45%, ${def.color}20, transparent)`,
            }}
          />
        )}
      </div>

      <div className="relative z-10 flex items-start justify-between px-5 pt-5">
        <div
          className={`${FLUID_DIMENSION} font-mono uppercase tracking-widest font-bold leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]`}
          style={{
            color: isActive ? def.color : "rgba(255,255,255,0.75)",
          }}
        >
          {def.label}
        </div>
        <div className="shrink-0">
          {status.state === "thinking" && (
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: def.color }} />
          )}
          {status.state === "filled" && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex h-6 w-6 items-center justify-center rounded-full shadow-lg"
              style={{ backgroundColor: def.color }}
            >
              <Check className="h-4 w-4 text-black" strokeWidth={3} />
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex-1" />

      <TileValue def={def} status={status} />

      {isAsking && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 pointer-events-none z-20"
          style={{ borderColor: def.color }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
