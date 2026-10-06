"use client";

import { useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ChevronsUpDown } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import type { Frame } from "../shared/art";
import { LINE_MAX, LINE_MIN } from "./data";
import type { V3Layout } from "./layout";

/**
 * The visitor's hand on the line.
 *
 * The handle is a real slider (role="slider", arrow keys, Home/End) sitting on
 * the line's right end; dragging it - or, with a mouse, dragging anywhere in
 * the field - moves the line, and every piece of work changes hands on the
 * spot. Touch drags only from the handle, so the field never traps a phone's
 * scroll. When the loop settles the handle wakes with one slow ring: the
 * scene's last word is an invitation, not a caption.
 */
const clamp = (v: number) => Math.min(Math.max(v, LINE_MIN), LINE_MAX);

export default function Handle({
  line,
  setLine,
  drawn,
  invite,
  g,
  f,
  reduced,
}: {
  line: number;
  setLine: (v: number) => void;
  drawn: boolean;
  invite: boolean;
  g: V3Layout;
  f: Frame;
  reduced: boolean;
}) {
  const c = useTranslation().t.athenaLab.workshop.v3;
  const field = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const { x, y, w, h } = g.field;

  const follow = (e: PointerEvent) => {
    const r = field.current?.getBoundingClientRect();
    if (r && r.height > 0) setLine(clamp(1 - (e.clientY - r.top) / r.height));
  };
  const start = (e: PointerEvent<HTMLElement>, anywhere: boolean) => {
    if (anywhere && e.pointerType !== "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    follow(e);
  };
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (dragging) follow(e);
  };
  const stop = () => setDragging(false);
  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05 }[e.key];
    if (step !== undefined) setLine(clamp(line + step));
    else if (e.key === "Home") setLine(LINE_MIN);
    else if (e.key === "End") setLine(LINE_MAX);
    else return;
    e.preventDefault();
  };

  return (
    <>
      <div
        ref={field}
        className={`absolute ${dragging ? "cursor-grabbing" : "cursor-ns-resize"}`}
        style={f.box(x, y, w, h)}
        onPointerDown={(e) => start(e, true)}
        onPointerMove={onMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        aria-hidden="true"
      />
      <motion.button
        type="button"
        role="slider"
        aria-label={c.lineAria}
        aria-valuemin={Math.round(LINE_MIN * 100)}
        aria-valuemax={Math.round(LINE_MAX * 100)}
        aria-valuenow={Math.round(line * 100)}
        onKeyDown={onKey}
        onPointerDown={(e) => start(e, false)}
        onPointerMove={onMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        className="absolute flex -translate-x-full -translate-y-1/2 touch-none select-none items-center whitespace-nowrap rounded-full border bg-background font-mono uppercase tracking-[0.14em] text-brand-cyan outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
        style={{
          ...f.at(x + w - 14, y + h - line * h),
          ...f.fs(14, 12),
          gap: f.len(8, 6),
          paddingInline: f.len(14, 10),
          paddingBlock: f.len(9, 8),
          borderColor: tint("cyan", 60),
          boxShadow: brandShadow("cyan", 18, 30),
          cursor: dragging ? "grabbing" : "grab",
        }}
        initial={false}
        animate={{ opacity: drawn ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.8 }}
      >
        <ChevronsUpDown aria-hidden="true" style={{ width: f.len(17, 14), height: f.len(17, 14) }} />
        {c.line}
        <motion.span
          className="pointer-events-none absolute -inset-1 rounded-full border-2"
          style={{ borderColor: BRAND_VAR.cyan }}
          initial={false}
          animate={invite && !reduced ? { opacity: [0, 0.8, 0], scale: [1, 1.25, 1.35] } : { opacity: 0, scale: 1 }}
          transition={invite && !reduced ? { duration: 2.2, repeat: Infinity, repeatDelay: 0.6 } : { duration: 0.3 }}
          aria-hidden="true"
        />
      </motion.button>
    </>
  );
}
