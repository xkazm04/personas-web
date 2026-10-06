"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { ToolGlyph, type ToolId } from "../shared/ToolGlyph";
import { PICKED, type V2State } from "./data";
import { LABEL } from "./Labels";

/**
 * The two-line conversation that drives the floor: her question, your reply.
 * This is the "together" in the scene — every cable and desk on the floor is
 * an answer you gave, and you leave a tool out (Notion stays unplugged)
 * because it is your workspace, not hers.
 *
 * Replies tick in one after another a beat behind the question, so the eye
 * reads question → answer → the floor changing, in that order.
 */

const TOOLS: ToolId[] = ["slack", "gmail", "github", "notion"];

export function Dialogue({ s, reduced }: { s: V2State; reduced: boolean }) {
  const { t } = useTranslation();
  const v = t.athenaLab.onboarding.v2;
  const c = t.athenaPage.onboarding.canvas;
  if (!s.question) return null;
  const ask = s.question === "tools" ? v.askTools : s.question === "jobs" ? v.askJobs : v.askStart;
  const replies =
    s.question === "tools"
      ? v.tools.map((name, i) => ({ name, tool: TOOLS[i], pick: PICKED[i] }))
      : s.question === "jobs"
        ? [c.template.title, c.templateAlt.title, c.runsRows[1].name].map((name) => ({ name, tool: null, pick: true }))
        : [{ name: v.go, tool: null, pick: true }];
  const tickLead = s.question === "jobs" ? 0.5 : 0.1;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={s.question}
        className="flex flex-col gap-2.5"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={reduced ? { duration: 0 } : SPRING_POP}
      >
        <span className="flex items-center gap-2.5">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-brand-cyan/40">
            <Image src="/athena/athena_baseline_640.webp" alt="" fill sizes="36px" className="object-cover" />
          </span>
          <span
            className={`rounded-2xl rounded-bl-md border px-3.5 py-1.5 font-medium text-foreground ${LABEL}`}
            style={{ borderColor: tint("cyan", 35), backgroundColor: tint("cyan", 8) }}
          >
            {ask}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-2 pl-1">
          <span className={`mr-1 ${ANNOTATION_DIM}`}>{v.you}</span>
          {replies.map((r, i) => {
            const on = s.answered && r.pick;
            const isGo = s.question === "start";
            return (
              <span
                key={r.name}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${LABEL} ${on ? "text-foreground" : "text-muted-dark"}`}
                style={{
                  borderColor: on ? tint("cyan", 55) : "var(--border-glass-hover)",
                  backgroundColor: on ? (isGo ? BRAND_VAR.cyan : tint("cyan", 12)) : "transparent",
                  color: on && isGo ? "var(--background)" : undefined,
                  transition: reduced ? undefined : "background-color 400ms, border-color 400ms, color 400ms",
                  transitionDelay: reduced ? undefined : `${Math.round((tickLead + i * 0.22) * 1000)}ms`,
                }}
              >
                {r.tool && <ToolGlyph tool={r.tool} className="h-4 w-4" color="currentColor" />}
                {r.name}
                {on && !isGo && (
                  <motion.span
                    className="flex"
                    initial={reduced ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: tickLead + i * 0.22 }}
                  >
                    <Check className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
                  </motion.span>
                )}
              </span>
            );
          })}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
