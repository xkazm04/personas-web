"use client";

import { motion } from "framer-motion";
import { Mail, UserRound } from "lucide-react";
import { ANNOTATION } from "@/components/athena/stage/athena-tokens";
import { Part } from "@/components/athena/sections/her-workshop/variant-c/parts";
import { useTranslation } from "@/i18n/useTranslation";
import { brandShadow, tint } from "@/lib/brand-theme";
import type { Frame } from "../shared/art";
import { KEPT_DOOR, type Scene } from "./data";
import type { V2Layout } from "./layout";

/**
 * What comes back to you. The tray waits as an outline on your side of the
 * plan; when she stops at the door you kept, the work slides out from under
 * it as a note - small at the door, full size in your tray - and then names
 * its owner. She never went through; the work still reached you.
 */
const SLIDE = { type: "spring", stiffness: 45, damping: 13 } as const;

export default function Tray({ scene, g, f, reduced }: { scene: Scene; g: V2Layout; f: Frame; reduced: boolean }) {
  const c = useTranslation().t;
  const v2 = c.athenaLab.workshop.v2;
  const t = g.tray;
  const n = t.note;
  const from = g.stations[KEPT_DOOR];
  const dx = ((from.x - (n.x + n.w / 2)) / n.w) * 100;
  const dy = ((from.y - (n.y + n.h / 2)) / n.h) * 100;

  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: scene.named ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.6 }}
    >
      <div
        className="absolute rounded-2xl border bg-surface/70 backdrop-blur-md"
        style={{ ...f.box(t.panel.x, t.panel.y, t.panel.w, t.panel.h), borderColor: tint("cyan", 20), boxShadow: `inset 0 1px 0 ${tint("cyan", 18)}` }}
      />
      <span className={`absolute whitespace-nowrap ${ANNOTATION}`} style={{ ...f.box(t.head.x, t.head.y), ...f.fs(15, 12) }}>
        {v2.tray}
      </span>
      <span
        className="absolute rounded-xl border border-dashed"
        style={{ ...f.box(n.x, n.y, n.w, n.h), borderColor: tint("cyan", 18) }}
        aria-hidden="true"
      />

      <motion.div
        className="absolute flex flex-col justify-center rounded-xl border bg-surface"
        style={{
          ...f.box(n.x, n.y, n.w, n.h),
          gap: f.len(10, 4),
          paddingInline: f.len(20, 12),
          borderColor: tint("cyan", 44),
          boxShadow: `${brandShadow("cyan", 30, 20)}, inset 0 1px 0 ${tint("cyan", 30)}`,
        }}
        initial={false}
        animate={
          scene.note
            ? { x: "0%", y: "0%", scale: 1, opacity: 1, rotate: 0 }
            : { x: `${dx}%`, y: `${dy}%`, scale: 0.2, opacity: 0, rotate: -6 }
        }
        transition={reduced ? { duration: 0 } : scene.note ? SLIDE : { duration: 0.3 }}
      >
        <span className="flex items-start leading-snug text-foreground" style={{ ...f.fs(21, 16), gap: f.len(10, 6) }}>
          <Mail className="mt-[0.15em] shrink-0 text-brand-cyan" style={{ width: f.len(20, 14), height: f.len(20, 14) }} aria-hidden="true" />
          {v2.note}
        </span>
        <Part show={scene.waits} reduced={reduced} className="flex items-center text-brand-cyan" style={{ ...f.fs(19, 16), gap: f.len(8, 6) }}>
          <UserRound className="shrink-0" style={{ width: f.len(20, 14), height: f.len(20, 14) }} aria-hidden="true" />
          {c.athenaPage.workshop.outside.waits}
        </Part>
      </motion.div>
    </motion.div>
  );
}
