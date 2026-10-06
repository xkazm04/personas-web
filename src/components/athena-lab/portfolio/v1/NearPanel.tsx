"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { WORST } from "./copy";
import type { Rect } from "./layout";
import { DrawCheck, Part, Sheen, Slot } from "./parts";

/**
 * What the project turns out to be, once you are close enough to see it.
 *
 * This is the payoff the whole camera move exists for, so it does not arrive
 * as a card: it composes in the same layers as the field did. The frame and
 * the name land first, then the dimensions that are NOT fine — each with the
 * only thing that matters about them, how long it has been like that — then
 * the one specific finding in plain words, and only then the fix, which
 * beckons for a beat before it commits.
 *
 * The footnote is deliberate. Every project carries many health dimensions
 * and almost all of them are always fine; naming the two that are not, and
 * counting the rest in five words, is the difference between a report and a
 * status page.
 *
 * It lives in SCREEN space at the projected position of its plot, so its
 * type renders at the authored size no matter how far the camera came down.
 *
 * v1: on the wide stage it docks beside the plot and its height follows its
 * content; its type is sized from the field (`cqh`), so the detail reads as
 * the dominant thing in the frame on a laptop and a 1440p monitor alike.
 */

/** Type sized from the field's height, floored at the page's reading size. */
const NAME = "text-[clamp(1.25rem,4.2cqh,2.25rem)]";
const READ = "text-[clamp(1rem,2.6cqh,1.375rem)]";
export default function NearPanel({
  rect,
  auto,
  stem,
  stage,
  beckon,
  open,
  live,
  reduced,
}: {
  rect: Rect;
  auto: boolean;
  /** Screen line from the plot's bottom edge down to the panel, when there
   *  is one — it is what keeps the detail attached to the terrain. */
  stem: { x: number; y: number; h: number } | null;
  stage: ModuleStage;
  beckon: boolean;
  open: boolean;
  live: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.portfolio.panel;
  const shell = atStage(stage, "shell");
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const done = atStage(stage, "chosen");

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${reduced ? "" : "transition-opacity duration-500"}`}
      style={{ opacity: open ? 1 : 0 }}
      aria-hidden="true"
    >
      {stem && shell && (
        <span
          className="absolute w-px"
          style={{
            left: `${stem.x}%`,
            top: `${stem.y}%`,
            height: `${stem.h}%`,
            backgroundColor: tint(done ? "emerald" : "rose", 50),
          }}
        />
      )}

      <Slot
        rect={rect}
        solid={shell}
        waiting={false}
        reduced={reduced}
        round="rounded-2xl"
        auto={auto}
        className="flex flex-col gap-[clamp(0.375rem,1.4cqh,0.875rem)] overflow-hidden px-3.5 py-2.5 backdrop-blur-md sm:px-[clamp(1.25rem,3cqh,2rem)] sm:py-[clamp(0.75rem,2.4cqh,1.5rem)]"
        style={{
          borderColor: tint(done ? "emerald" : "rose", 45),
          backgroundColor: "color-mix(in srgb, var(--background) 72%, transparent)",
          boxShadow: brandShadow(done ? "emerald" : "rose", 40, 18),
        }}
      >
        <Sheen on={done} reduced={reduced} />

        <span className="flex items-center gap-2">
          <Part
            show
            i={0}
            reduced={reduced}
            className={`min-w-0 flex-1 truncate font-semibold tracking-tight text-foreground ${NAME}`}
          >
            {t.athenaPage.portfolio.projects[WORST]}
          </Part>
          <Part
            show
            i={1}
            reduced={reduced}
            className={`shrink-0 rounded-full border px-2.5 py-0.5 ${READ}`}
            style={{ borderColor: tint("rose", 40), color: BRAND_VAR.rose }}
          >
            {c.badge}
          </Part>
        </span>

        {/* Only what is not fine */}
        {c.rows.map((row, i) => (
          <Part
            key={row.name}
            show={body}
            i={i}
            reduced={reduced}
            className="flex items-center gap-2"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.rose, boxShadow: brandShadow("rose", 6, 70) }}
            />
            <span className={`min-w-0 truncate text-foreground ${READ}`}>{row.name}</span>
            <span className={`ml-auto shrink-0 truncate normal-case ${ANNOTATION_DIM}`}>
              {row.since}
            </span>
          </Part>
        ))}

        {/* The one thing she actually found */}
        <Part
          show={detail}
          reduced={reduced}
          className={`rounded-r-lg border-l-2 py-1 pl-2.5 pr-1 leading-snug text-foreground ${READ}`}
          style={{ borderColor: BRAND_VAR.rose, backgroundColor: tint("rose", 6) }}
        >
          <span className="hidden sm:inline">{c.finding}</span>
          <span className="sm:hidden">{c.findingShort}</span>
        </Part>

        <span className="mt-auto flex items-center gap-2">
          <Part show={detail} reduced={reduced} className={`min-w-0 truncate text-muted-dark ${READ}`}>
            {c.rest}
          </Part>
          {(beckon || done) && (
            <motion.span
              className={`ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-0.5 ${READ}`}
              style={{
                borderColor: tint(done ? "emerald" : "cyan", done ? 50 : 55),
                backgroundColor: tint(done ? "emerald" : "cyan", done ? 12 : 16),
                color: BRAND_VAR[done ? "emerald" : "cyan"],
                boxShadow: done ? undefined : brandShadow("cyan", 18, 30),
              }}
              initial={reduced ? false : { opacity: 0, y: 4 }}
              animate={
                !live || done
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 1, y: 0, scale: [1, 1.045, 1] }
              }
              transition={
                !live || done
                  ? { duration: 0.25 }
                  : { scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" }, duration: 0.3 }
              }
            >
              {done && <DrawCheck reduced={reduced} className="h-4 w-4" />}
              <span className="hidden sm:inline">{done ? c.done : c.action}</span>
              <span className="sm:hidden">{done ? c.done : c.actionShort}</span>
            </motion.span>
          )}
        </span>
      </Slot>
    </div>
  );
}
