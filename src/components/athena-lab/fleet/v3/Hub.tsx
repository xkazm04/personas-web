"use client";

import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import AthenaAvatar from "../shared/AthenaAvatar";
import type { StartState } from "./data";
import type { Point } from "./layout";

/**
 * Her place in the world: her face over a lit pad the team stands on, and -
 * once the team has formed - the Start that only you can press. A drawn
 * picture of a control (the scene is an illustration), so it stays out of
 * the tab order.
 */

const AVATAR = 84;

export default function Hub({
  hub,
  start,
  awake,
  busy,
  state,
  reduced,
}: {
  hub: Point;
  start: Point;
  awake: boolean;
  busy: boolean;
  state: StartState;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const plan = t.athenaPage.fleet.plan;
  const waiting = state === "waiting";
  const showStart = waiting || state === "pressed";
  return (
    <>
      {/* The pad - an ellipse of light the team stands on */}
      <motion.span
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
        style={{
          left: hub.x,
          top: hub.y + 58,
          width: 230,
          height: 62,
          borderColor: tint("cyan", 30),
          background: `radial-gradient(ellipse at center, ${tint("cyan", 20)}, ${tint("cyan", 4)} 70%)`,
          boxShadow: brandShadow("cyan", 30, 18),
        }}
        initial={false}
        animate={{ opacity: awake ? 1 : 0.35 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
        aria-hidden="true"
      />
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: hub.x, top: hub.y, width: AVATAR, height: AVATAR }}
      >
        <AthenaAvatar awake={awake} busy={busy} reduced={reduced} />
      </div>

      <motion.span
        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-4 py-1 text-base font-semibold"
        style={{
          left: start.x,
          top: start.y,
          color: BRAND_VAR.cyan,
          borderColor: tint("cyan", 60),
          backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
          boxShadow: brandShadow("cyan", 22, 36),
        }}
        initial={false}
        animate={
          !showStart
            ? { opacity: 0, scale: 0.8 }
            : waiting && !reduced
              ? { opacity: 1, scale: [1, 1.06, 1] }
              : { opacity: 1, scale: state === "pressed" && !reduced ? [0.9, 1] : 1 }
        }
        transition={waiting && !reduced ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.35 }}
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND_VAR.cyan }} />
        {plan.start}
        <motion.span
          className="absolute -bottom-3 -right-2 text-foreground"
          initial={false}
          animate={{ opacity: showStart ? 1 : 0, scale: state === "pressed" && !reduced ? [1, 0.8, 1] : 1 }}
          transition={{ duration: reduced ? 0 : 0.4 }}
        >
          <MousePointer2 className="h-5 w-5 fill-current" />
        </motion.span>
      </motion.span>
    </>
  );
}
