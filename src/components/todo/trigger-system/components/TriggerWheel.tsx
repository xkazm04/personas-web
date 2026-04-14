"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { tint } from "@/lib/brand-theme";
import type { Trigger } from "../types";

interface TriggerWheelProps {
  triggers: Trigger[];
  activeTrigger: number;
  firing: number | null;
  onSelect: (i: number) => void;
}

export default function TriggerWheel({
  triggers,
  activeTrigger,
  firing,
  onSelect,
}: TriggerWheelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto lg:mx-0"
      style={{ width: 400, height: 400 }}
    >
      {/* Orbit ring */}
      <div
        className="absolute rounded-full border border-dashed border-foreground/8"
        style={{
          width: 280,
          height: 280,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Center hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={
            firing !== null
              ? {
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    "0 0 0px rgba(6,182,212,0)",
                    `0 0 30px ${tint(triggers[firing ?? 0].brand, 25)}`,
                    "0 0 0px rgba(6,182,212,0)",
                  ],
                }
              : {}
          }
          transition={{ duration: 0.6 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border border-foreground/10 bg-background/60 backdrop-blur-xl z-10"
        >
          <Zap className="h-8 w-8 text-brand-cyan/70" />
        </motion.div>
      </div>

      {/* Trigger nodes */}
      {triggers.map((t, i) => {
        const angle = (i / triggers.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const RADIUS = 140;
        const cx = 200 + RADIUS * Math.cos(rad);
        const cy = 200 + RADIUS * Math.sin(rad);
        const isActive = activeTrigger === i;
        const isFiring = firing === i;

        return (
          <motion.button
            key={t.name}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: "spring", bounce: 0.4 }}
            onClick={() => onSelect(i)}
            className={`absolute flex items-center justify-center rounded-xl border transition-all duration-400 cursor-pointer ${
              isActive
                ? "border-foreground/25 bg-foreground/8 z-20 shadow-lg"
                : "border-foreground/10 bg-foreground/3 hover:border-foreground/20 hover:bg-foreground/6 z-10"
            }`}
            style={{
              width: isActive ? 56 : 44,
              height: isActive ? 56 : 44,
              left: cx,
              top: cy,
              transform: "translate(-50%, -50%)",
              boxShadow: isActive ? `0 0 25px ${tint(t.brand, 20)}` : undefined,
            }}
          >
            <t.icon
              className={`transition-all duration-300 ${isActive ? "h-6 w-6" : "h-5 w-5"}`}
              style={{
                color: isActive ? t.color : "rgba(255,255,255,0.55)",
                filter: isActive ? `drop-shadow(0 0 6px ${tint(t.brand, 50)})` : undefined,
              }}
            />
            {isFiring && (
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 rounded-xl border-2"
                style={{ borderColor: t.color }}
              />
            )}
          </motion.button>
        );
      })}

      {/* Label ring */}
      {triggers.map((t, i) => {
        const angle = (i / triggers.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const LABEL_RADIUS = 182;
        const lx = 200 + LABEL_RADIUS * Math.cos(rad);
        const ly = 200 + LABEL_RADIUS * Math.sin(rad);
        const isActive = activeTrigger === i;
        return (
          <span
            key={`label-${t.name}`}
            className={`absolute text-base font-mono uppercase tracking-wider transition-colors duration-300 pointer-events-none whitespace-nowrap ${
              isActive ? "text-foreground font-semibold" : "text-muted-dark"
            }`}
            style={{
              left: lx,
              top: ly,
              transform: "translate(-50%, -50%)",
            }}
          >
            {t.name}
          </span>
        );
      })}
    </motion.div>
  );
}
