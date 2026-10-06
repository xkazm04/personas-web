"use client";

import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { Part } from "@/components/athena/sections/her-workshop/variant-c/parts";
import { tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { Frame } from "../shared/art";
import type { Box } from "./layout";

/**
 * The one piece of work on your side of the line.
 *
 * Exactly the live section's object: the same dashed outline every box in the
 * yard starts as, held one stage back for good - it never solidifies, never
 * dims, never shakes. Nothing on screen refuses her. One beat after she stops
 * at the line it acquires the only words it will ever have, and they name its
 * owner: waits for you.
 */
export default function Outside({
  rect,
  shown,
  waits,
  f,
  reduced,
}: {
  rect: Box;
  shown: boolean;
  waits: boolean;
  f: Frame;
  reduced: boolean;
}) {
  const c = useTranslation().t.athenaPage.workshop.outside;
  return (
    <motion.div
      className="absolute flex flex-col justify-center overflow-hidden rounded-xl border border-dashed"
      style={{
        ...f.box(rect.x, rect.y, rect.w, rect.h),
        gap: f.len(8, 4),
        paddingInline: f.len(20, 12),
        borderColor: tint("cyan", waits ? 34 : 22),
        backgroundColor: tint("cyan", 3),
      }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
    >
      <Part show={shown} reduced={reduced} className="whitespace-nowrap leading-tight text-muted-dark" style={f.fs(21, 16)}>
        {c.name}
      </Part>
      <Part show={waits} i={1} reduced={reduced} className="flex items-center text-brand-cyan" style={{ ...f.fs(19, 16), gap: f.len(8, 6) }}>
        <UserRound className="shrink-0" style={{ width: f.len(20, 16), height: f.len(20, 16) }} aria-hidden="true" />
        {c.waits}
      </Part>
    </motion.div>
  );
}
