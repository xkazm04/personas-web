"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { ToolGlyph, type ToolId } from "./shared/ToolGlyph";
import { DESKS, PLOT, SOCKETS, pct } from "./iso";
import type { V2State } from "./data";
import { athenaSectionsCopy } from "@/i18n/pending/athenaSections";

/**
 * The HTML layer over the floor: the brand marks on the sockets, a name tag
 * over each desk, the empty plot's sign, and the day's run counter. It sits
 * on its own layer (positioned in percent of the same art box the SVG draws
 * in) so type is set in rem and stays crisp and readable while the floor
 * scales with the stage.
 */

export const LABEL = "text-[clamp(1rem,1.2cqw,1.4rem)]";
const TOOLS: ToolId[] = ["slack", "gmail", "github", "notion"];

export function SocketGlyphs({ plugged, reduced }: { plugged: boolean[]; reduced: boolean }) {
  return (
    <>
      {SOCKETS.map((p, i) => (
        <span
          key={TOOLS[i]}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={pct({ x: p.x, y: p.y, z: 0.95 })}
        >
          <ToolGlyph
            tool={TOOLS[i]}
            className="h-[clamp(1.25rem,2cqw,2.1rem)] w-[clamp(1.25rem,2cqw,2.1rem)]"
            color={plugged[i] ? "var(--foreground)" : "var(--muted-dark)"}
            style={{
              opacity: plugged[i] ? 1 : 0.6,
              filter: plugged[i] ? `drop-shadow(0 0 8px ${tint("cyan", 70)})` : "none",
              transition: reduced ? undefined : "opacity 500ms, filter 500ms",
            }}
          />
        </span>
      ))}
    </>
  );
}

export function DeskTags({ s, reduced }: { s: V2State; reduced: boolean }) {
  const { t } = useTranslation();
  const c = t.athenaPage.onboarding.canvas;
  const v = athenaSectionsCopy.onboarding.v2;
  const names = [c.template.title, c.templateAlt.title, c.runsRows[1].name];
  return (
    <>
      {DESKS.map((k, i) =>
        s.desks[i] ? (
          <motion.span
            key={names[i]}
            className={`absolute flex -translate-x-1/2 -translate-y-full items-center gap-2 whitespace-nowrap rounded-full border bg-surface/90 px-3 py-0.5 backdrop-blur-sm ${LABEL}`}
            style={{ ...pct({ x: k.x + k.w / 2, y: k.y + 0.16, z: k.h + 1.3 }), borderColor: tint("cyan", s.running ? 55 : 30) }}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: 0.55 }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.running ? BRAND_VAR.emerald : tint("cyan", 50) }}
            />
            <span className="font-medium text-foreground">{names[i]}</span>
            <span className="text-muted-dark">{s.running ? v.running : v.ready}</span>
          </motion.span>
        ) : null,
      )}
    </>
  );
}

/** The empty plot's sign — the product before anyone set it up. */
export function EmptySign({ gone, reduced }: { gone: boolean; reduced: boolean }) {
  return (
    <motion.span
      className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-dashed px-3 py-1 font-mono uppercase tracking-[0.18em] text-muted-dark ${LABEL}`}
      style={{ ...pct({ x: PLOT.x + PLOT.w / 2, y: PLOT.y + PLOT.d / 2 }), borderColor: tint("cyan", 35) }}
      initial={false}
      animate={{ opacity: gone ? 0 : 1, scale: gone ? 0.94 : 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.5 }}
    >
      {athenaSectionsCopy.onboarding.v2.empty}
    </motion.span>
  );
}

/** Top right: today's runs, counting up once the floor is busy. */
export function RunCounter({ s, reduced }: { s: V2State; reduced: boolean }) {
  const { t } = useTranslation();
  const live = s.desks.filter(Boolean).length;
  return (
    <span className="absolute right-[1.5%] top-[3%] flex flex-col items-end gap-1">
      <span className={ANNOTATION_DIM}>{t.athenaPage.onboarding.chrome.usageLabel}</span>
      <motion.span
        key={s.runs}
        className="font-semibold tabular-nums leading-none text-foreground text-[clamp(2rem,3.4cqw,3.5rem)]"
        initial={reduced || s.runs === 0 ? false : { opacity: 0.4, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : SPRING_POP}
        style={{ textShadow: s.running ? `0 0 24px ${tint("cyan", 45)}` : "none" }}
      >
        {s.runs}
      </motion.span>
      <span className={`flex items-center gap-2 text-muted-dark ${LABEL}`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: s.running && i < live ? BRAND_VAR.emerald : tint("cyan", 20) }}
          />
        ))}
        {s.running ? live : 0} {athenaSectionsCopy.onboarding.v2.agentsLive}
      </span>
    </span>
  );
}
