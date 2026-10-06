"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { MediumIcon } from "../shared/icons";
import { Part, rectStyle } from "../shared/parts";
import type { Rect } from "../shared/types";
import { BIG, LABEL, MONO } from "../shared/type";
import type { TileContent } from "./copy";
import { fromTile } from "./layout";

/**
 * A window brought forward: it grows out of its own place in the wall into a
 * card in front of the face's edge (FLIP - it mounts at its final size and is
 * transformed down onto its tile, then released), and goes back the same
 * way. Inside: the one question you ask after time away, and her answer,
 * which is exactly where that conversation stopped.
 *
 * Near-opaque glass and a deep shadow put it a level above the wall; the
 * face stays readable beside it.
 */

const GLASS =
  "color-mix(in srgb, color-mix(in srgb, var(--brand-cyan) 8%, var(--background)) 92%, transparent)";

export default function Forward({
  open,
  tile,
  card,
  content,
  name,
  ask,
  reply,
  label,
  asked,
  answered,
  reduced,
}: {
  open: boolean;
  tile: Rect;
  card: Rect;
  content: TileContent;
  name: string | null;
  ask: string;
  reply: string;
  label: string;
  asked: boolean;
  answered: boolean;
  reduced: boolean;
}) {
  const shut = { ...fromTile(tile, card), opacity: 0.4 };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute z-30 flex flex-col overflow-hidden rounded-2xl border backdrop-blur-md"
          style={{
            ...rectStyle(card),
            ...LABEL,
            borderColor: tint("cyan", 55),
            backgroundColor: GLASS,
            boxShadow: `0 24px 60px -12px color-mix(in srgb, var(--background) 80%, transparent), ${brandShadow("cyan", 40, 22)}`,
          }}
          initial={reduced ? false : shut}
          animate={{ x: "0%", y: "0%", scaleX: 1, scaleY: 1, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : shut}
          transition={{ duration: reduced ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="flex shrink-0 items-center gap-[0.55em] whitespace-nowrap border-b px-[1em] py-[0.6em]"
            style={{ borderColor: tint("cyan", 22) }}
          >
            <span className="text-brand-cyan">
              <MediumIcon medium={content.medium} />
            </span>
            <span className="text-foreground" style={BIG}>
              {name}
            </span>
            <span className={`ml-auto text-brand-cyan ${MONO}`}>{answered ? label : ""}</span>
          </span>

          <span className="flex min-h-0 flex-1 flex-col justify-end gap-[0.8em] px-[1em] py-[1em]" style={BIG}>
            {/* Where it stopped last time - the thread she is picking up */}
            <span className="mb-auto flex flex-col gap-[0.45em] opacity-70" aria-hidden="true">
              {[...content.bars, content.bars[0] - 18].map((w, b) => (
                <span
                  key={b}
                  className={`h-[0.7em] rounded-full ${b % 2 ? "ml-auto" : "ml-[2.5em]"}`}
                  style={{ width: `${w}%`, backgroundColor: tint("cyan", b % 2 ? 12 : 16) }}
                />
              ))}
            </span>
            <Part show={asked} reduced={reduced} className="flex">
              <span
                className="ml-auto rounded-2xl rounded-br-md border px-[0.8em] py-[0.4em] text-foreground"
                style={{ borderColor: tint("cyan", 26), backgroundColor: tint("cyan", 7) }}
              >
                {ask}
              </span>
            </Part>
            <Part show={answered} reduced={reduced} className="flex items-end gap-[0.5em]">
              <span
                className="relative h-[2em] w-[2em] shrink-0 overflow-hidden rounded-full border"
                style={{ borderColor: tint("cyan", 55), boxShadow: brandShadow("cyan", 12, 45) }}
              >
                <Image src="/athena/athena_baseline_640.webp" alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span
                className="rounded-2xl rounded-bl-md border px-[0.8em] py-[0.45em] text-foreground"
                style={{ borderColor: tint("cyan", 40), backgroundColor: tint("cyan", 13) }}
              >
                {reply}
              </span>
            </Part>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
