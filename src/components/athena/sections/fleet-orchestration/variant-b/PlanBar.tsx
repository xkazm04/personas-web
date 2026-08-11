"use client";

import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import type { PlanState } from "./data";
import type { Rect } from "./layout";
import { DrawCheck, Part, Sheen, Slot } from "./parts";

/**
 * The plan's own control row — the beat this section would be dishonest
 * without. Athena has proposed four pieces of work and NOTHING is running:
 * the row invites you to change any of it, one scope visibly changes, and
 * only then does the start commit. Four states, four different sentences the
 * scene is making, all in one line of controls.
 *
 * It is mounted from tick 0 like everything else — it simply wears no skin
 * until the plan exists, so its arrival can never shove the field down.
 */

const PILL =
  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-0.5 text-base";

function StartPill({ plan, reduced }: { plan: PlanState; reduced: boolean }) {
  const { t } = useTranslation();
  const c = t.athenaPage.fleet.plan;
  const waiting = plan === "proposed" || plan === "editing";
  const done = plan === "done";
  const label = waiting ? c.start : done ? c.done : c.working;
  return (
    <motion.span
      className={PILL}
      style={{
        borderColor: tint("cyan", waiting ? 55 : 38),
        backgroundColor: tint("cyan", waiting ? 16 : 9),
        color: BRAND_VAR.cyan,
        boxShadow: waiting ? brandShadow("cyan", 18, 30) : undefined,
      }}
      animate={waiting && !reduced ? { scale: [1, 1.045, 1] } : { scale: 1 }}
      transition={
        waiting && !reduced
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      {done ? (
        <DrawCheck reduced={reduced} className="h-3.5 w-3.5" />
      ) : (
        <motion.span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan }}
          animate={plan === "working" && !reduced ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {label}
    </motion.span>
  );
}

export default function PlanBar({
  rect,
  plan,
  reduced,
}: {
  rect: Rect;
  plan: PlanState;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.fleet.plan;
  const shown = plan !== "hidden";
  const changed = plan !== "proposed" && shown;
  return (
    <Slot
      rect={rect}
      solid={shown}
      waiting={false}
      reduced={reduced}
      className="flex items-center gap-3 overflow-hidden px-3 sm:px-4"
      style={{
        borderColor: plan === "proposed" ? tint("cyan", 32) : undefined,
        backgroundColor: tint("cyan", 4),
      }}
    >
      <Sheen on={plan === "confirmed"} reduced={reduced} />
      <Part show={shown} i={0} reduced={reduced} className="flex min-w-0 items-center gap-2">
        {changed ? (
          <span className="flex items-center gap-2 text-base text-brand-cyan">
            <DrawCheck reduced={reduced} className="h-4 w-4" />
            {c.edited}
          </span>
        ) : (
          <>
            <Pencil className="h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
            <span className={`hidden truncate normal-case sm:inline ${ANNOTATION_DIM}`}>
              {c.hint}
            </span>
            <span className={`truncate normal-case sm:hidden ${ANNOTATION_DIM}`}>
              {c.hintShort}
            </span>
          </>
        )}
      </Part>
      <Part show={shown} i={1} reduced={reduced} className="ml-auto flex shrink-0">
        <StartPill plan={plan} reduced={reduced} />
      </Part>
    </Slot>
  );
}
