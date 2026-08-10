"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import type { Line } from "./copy";
import { Sheen } from "./parts";

/**
 * One message, and the one thing that can ever be remarkable about it.
 *
 * A lit run is either the thing you said, or the part of her answer that
 * could only be right if she still had it. It is the same treatment in both
 * places on purpose — the visitor is meant to recognise the second as the
 * first, without anybody drawing an arrow between them.
 */

/** The highlight carries its padding at all times (transparent when unlit) and
 *  bleeds outside its run (`-mx-1`), so lighting a phrase adds no width — a
 *  message must not re-wrap mid-loop. */
function Lit({
  on,
  pulse,
  reduced,
  children,
}: {
  on: boolean;
  pulse: boolean;
  reduced: boolean;
  children: string;
}) {
  return (
    <span
      className="box-decoration-clone relative -mx-1 rounded-md px-1 duration-500 transition-[background-color,color,box-shadow]"
      style={{
        backgroundColor: on ? tint("cyan", 16) : undefined,
        color: on ? BRAND_VAR.cyan : undefined,
        boxShadow: on ? brandShadow("cyan", 14, 20) : undefined,
      }}
    >
      {/* The words flicker in the conversation you SAID them in, at the moment
          she leans on them somewhere else entirely. Nobody is told this is
          happening; it is there for the second watch. */}
      {pulse && !reduced && (
        <motion.span
          className="pointer-events-none absolute -inset-x-1 -inset-y-0.5 rounded-md"
          style={{ backgroundColor: tint("cyan", 34) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          aria-hidden="true"
        />
      )}
      <span className="relative">{children}</span>
    </span>
  );
}

export default function Bubble({
  line,
  lit,
  pulse,
  sheen,
  reduced,
}: {
  line: Line;
  lit: boolean;
  /** The line currently being leaned on, so its source run can flicker. */
  pulse: number | null;
  sheen: boolean;
  reduced: boolean;
}) {
  const mine = line.who === "you";
  return (
    <span
      className={`relative max-w-[93%] overflow-hidden rounded-2xl border px-2.5 py-1 text-base leading-snug text-foreground md:py-1.5 ${
        mine ? "self-end rounded-br-sm" : "self-start rounded-bl-sm"
      }`}
      style={{
        borderColor: tint("cyan", mine ? 14 : 26),
        backgroundColor: mine ? "rgba(var(--surface-overlay), 0.07)" : tint("cyan", 8),
      }}
    >
      <Sheen on={sheen} reduced={reduced} />
      {line.runs.map((run, i) =>
        run.thread === undefined ? (
          <span key={i} className={run.wideOnly ? "hidden md:inline" : undefined}>
            {run.t}
          </span>
        ) : (
          <Lit key={i} on={lit} pulse={pulse === run.thread} reduced={reduced}>
            {run.t}
          </Lit>
        ),
      )}
    </span>
  );
}
