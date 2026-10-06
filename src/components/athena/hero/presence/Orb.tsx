"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import { ANNOTATION } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { brandShadow, tint } from "@/lib/brand-theme";

/**
 * Athena herself - the real avatar disc - and her one signature interaction,
 * kept from the live hero: hover, tap or Enter and she acknowledges you with a
 * ring of light and a single short line. The disc width literals track
 * ORB_PCT_SQUARE / ORB_PCT_WIDE in ./geometry (Tailwind cannot read them).
 *
 * Under reduced motion the looping clip never mounts; the poster stands in.
 * (This module only ever renders client-side behind `ssr: false`.)
 */
export default function Orb({ reduced }: { reduced: boolean }) {
  const { t } = useTranslation();
  const c = t.athenaPage.hero;
  const avatarRef = useAvatarPlayback(!reduced);
  const [ack, setAck] = useState(0);
  const busy = useRef(false);

  const acknowledge = () => {
    if (busy.current) return;
    busy.current = true;
    setAck((n) => n + 1);
    window.setTimeout(() => { busy.current = false; }, 1400);
  };

  return (
    <>
      <div className="absolute left-1/2 top-1/2 aspect-square w-[64.375%] -translate-x-1/2 -translate-y-1/2 lg:w-[25.75%]">
        {ack > 0 && !reduced && (
          <motion.span
            key={ack}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-solid"
            style={{ borderColor: tint("cyan", 80) }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
        <button
          type="button"
          aria-label={c.orbAria}
          onClick={acknowledge}
          onMouseEnter={acknowledge}
          className="relative block h-full w-full cursor-pointer overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
          style={{ boxShadow: `${brandShadow("cyan", 90, 30)}, inset 0 0 40px ${tint("cyan", 22)}` }}
        >
          {reduced ? (
            // eslint-disable-next-line @next/next/no-img-element -- static poster for reduced motion; a fixed local asset
            <img src="/athena/athena_baseline.jpg" alt={c.avatarAlt} className="h-full w-full object-cover" />
          ) : (
            <video
              ref={avatarRef}
              src="/athena/athena_idle_loop.mp4"
              poster="/athena/athena_baseline.jpg"
              muted loop playsInline preload="auto"
              aria-label={c.avatarAlt}
              className="h-full w-full object-cover"
            />
          )}
          {/* Key light from the top-left, falling across the disc */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle at 28% 18%, ${tint("cyan", 26)}, transparent 46%)` }}
          />
        </button>
      </div>

      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-[93%] -translate-y-1/2 text-center">
        <AnimatePresence>
          {ack > 0 && (
            <motion.span
              className={ANNOTATION}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
            >
              {c.acknowledgeLine}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
