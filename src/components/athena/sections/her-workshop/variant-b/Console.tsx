"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import { PAIR_CODE } from "./copy";
import type { FieldLayout } from "./layout";
import { Slot } from "./parts";

/**
 * The one place all of it answers to — the desk, and her at it.
 *
 * She does not travel in this section and nothing about her is the event. Every
 * bench on the floor is wired here, and the only thing the desk ever does is
 * TAKE what arrives: one soft ring, and it is absorbed. That understatement is
 * the argument. A workshop where each new kind of work needed its own ceremony
 * would be five things to keep track of; a workshop where a scheduled order and
 * a tripped watcher land on the same desk in the same undramatic way is one.
 *
 * The code on her screen is the other half of the pairing beat: the same six
 * digits come up here and on the bench at the edge of the field at the same
 * instant, which is exactly how two machines are introduced to each other.
 */

const BREATH = { duration: 4.6, repeat: Infinity, ease: "easeInOut" } as const;

export default function Console({
  layout,
  awake,
  taking,
  paired,
  reduced,
}: {
  layout: FieldLayout;
  awake: boolean;
  taking: boolean;
  paired: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  return (
    <Slot
      rect={layout.desk}
      solid={awake}
      waiting
      reduced={reduced}
      round="rounded-2xl"
      // She and her screen sit side by side where the desk is wide and stack
      // where it is deep — the desk is the same object either way.
      className="flex flex-row items-center justify-center gap-2 px-2 py-1.5 md:flex-col md:gap-1.5 md:py-2"
      style={{
        borderColor: tint("cyan", 34),
        backgroundColor: tint("cyan", 8),
        boxShadow: brandShadow("cyan", 40, 20),
      }}
    >
      <span className="relative flex items-center justify-center" aria-hidden="true">
        {/* What absorbing looks like: one ring, out and gone. */}
        {taking && !reduced && (
          <motion.span
            className="absolute h-16 w-16 rounded-full border md:h-[4.5rem] md:w-[4.5rem]"
            style={{ borderColor: tint("cyan", 55) }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.7, 1.9, 2.3] }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
        <motion.span
          className="absolute -inset-3 rounded-full blur-xl"
          style={{ backgroundColor: tint("cyan", 30) }}
          initial={false}
          animate={reduced ? { opacity: 0.75 } : { opacity: awake ? [0.6, 0.95, 0.6] : 0.2 }}
          transition={reduced ? { duration: 0 } : awake ? BREATH : { duration: 0.5 }}
        />
        <motion.span
          className="relative block h-14 w-14 overflow-hidden rounded-full border md:h-16 md:w-16"
          style={{
            borderColor: tint("cyan", 55),
            boxShadow: brandShadow("cyan", 30, 40),
          }}
          initial={false}
          animate={{ opacity: awake ? 1 : 0.45, scale: awake ? 1 : 0.92 }}
          transition={reduced ? { duration: 0 } : { duration: 0.55, ease: "easeOut" }}
        >
          {reduced ? (
            <Image
              src="/athena/athena_baseline.jpg"
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              ref={avatarRef}
              src="/athena/athena_idle_loop.mp4"
              poster="/athena/athena_baseline.jpg"
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </motion.span>
      </span>

      {/* Her half of the pairing. Mounted from the moment the desk is up, so
          the code arriving cannot move her. */}
      <span
        className="flex shrink-0 items-center rounded-md border px-2 py-0.5"
        style={{
          borderColor: tint("cyan", paired ? 34 : 14),
          backgroundColor: tint("cyan", paired ? 8 : 3),
        }}
      >
        <motion.span
          className="font-mono text-base leading-none tracking-[0.14em]"
          style={{ color: BRAND_VAR.cyan }}
          initial={false}
          animate={{ opacity: paired ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.7 }}
        >
          {PAIR_CODE}
        </motion.span>
      </span>
    </Slot>
  );
}
