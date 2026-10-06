"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { BODY, LABEL, MONO } from "../shared/type";
import { GLYPHS, MEDIUM, WHEN } from "./copy";
import { MediumIcon } from "../shared/icons";
import type { Rect } from "./layout";
import Memory from "./Memory";
import { BREATH, Chorus, Part, Slot } from "../shared/parts";

/**
 * One conversation you have going.
 *
 * It composes in the shared layers - outline, frame, name, then what it holds
 * - and now says HOW you had it and WHEN: a microphone or a speech bubble, and
 * how long ago, in the console voice. That one row carries "in the app, by
 * voice, from last week" without a sentence.
 *
 * Light, not copy, says everything else. Each card is lit from the side that
 * faces her (a rim on its inner edge and a fill that fades away from her), so
 * the whole ring reads as gathered round one source of light. `given` warms
 * the card when it hands over what it holds; `sourced` rings it the moment a
 * line of her answer quotes it; `together` puts every light on one breath.
 */

const LIT = { border: 30, fill: 7 };
const IDLE = { border: 16, fill: 3 };

export default function ConversationCard({
  index,
  rect,
  side,
  stage,
  sourced,
  chorus,
  together,
  reduced,
  running,
}: {
  index: number;
  rect: Rect;
  side: "left" | "right";
  stage: ModuleStage;
  sourced: boolean;
  chorus: boolean;
  together: boolean;
  reduced: boolean;
  running: boolean;
}) {
  const { t } = useTranslation();
  const convo = t.athenaPage.oneMind.conversations[index];
  const lab = t.athenaLab.oneMind.v1;
  const medium = MEDIUM[index];
  const solid = atStage(stage, "shell");
  const named = atStage(stage, "body");
  const live = atStage(stage, "detail");
  const given = atStage(stage, "chosen");
  const tone = live ? LIT : IDLE;
  // The fill brightens toward her: a card on her left is lit on its right.
  const toward = side === "left" ? "to right" : "to left";

  const beating = live && running;
  const pulse = beating ? (together ? [0.9, 0.4, 0.9] : [1, 0.3, 1]) : live ? 1 : 0;
  const beat = !beating
    ? { duration: 0.3 }
    : together
      ? BREATH
      : { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const, delay: index * 0.17 };

  return (
    <>
      {sourced && (
        <motion.span
          className="pointer-events-none absolute rounded-2xl border"
          style={{
            left: `${rect.x - 0.6}%`,
            top: `${rect.y - 1.4}%`,
            width: `${rect.w + 1.2}%`,
            height: `${rect.h + 2.8}%`,
            borderColor: tint("cyan", 40),
            boxShadow: brandShadow("cyan", 22, 18),
          }}
          initial={reduced ? false : { opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}

      <Slot
        rect={rect}
        solid={solid}
        waiting
        reduced={reduced}
        className="flex flex-col gap-[0.35em] overflow-hidden px-[0.8em] py-[0.6em] backdrop-blur-sm"
        style={{
          ...LABEL,
          borderColor: tint("cyan", given ? 42 : tone.border),
          backgroundImage: `linear-gradient(${toward}, ${tint("cyan", 2)}, ${tint("cyan", given ? 12 : tone.fill)})`,
          boxShadow: given ? brandShadow("cyan", 20, 12) : undefined,
        }}
      >
        {/* Key light: a rim on the edge that faces her */}
        <span
          className={`pointer-events-none absolute inset-y-[12%] w-px ${side === "left" ? "right-0" : "left-0"}`}
          style={{
            background: `linear-gradient(to bottom, transparent, ${tint("cyan", live ? 75 : 30)}, transparent)`,
            boxShadow: live ? `0 0 10px ${tint("cyan", 50)}` : undefined,
          }}
          aria-hidden="true"
        />
        <Chorus on={chorus} reduced={reduced} />

        <span className="flex shrink-0 items-center gap-2">
          <Part show={named} reduced={reduced} className="min-w-0 flex-1 whitespace-nowrap text-foreground">
            <span style={BODY}>{convo.name}</span>
          </Part>
          <motion.span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            initial={false}
            animate={{ opacity: pulse }}
            transition={beat}
            aria-hidden="true"
          />
        </span>

        <Part
          show={named}
          i={1}
          reduced={reduced}
          className={`flex shrink-0 items-center gap-[0.45em] whitespace-nowrap text-muted-dark ${MONO}`}
        >
          <span className="text-brand-cyan">
            <MediumIcon medium={medium} />
          </span>
          <span>{lab[medium]}</span>
          {/* Phones keep the medium and drop the time: the half-width card
              has room for one, and the medium carries the claim. */}
          <span className="hidden md:inline" aria-hidden="true">
            &middot;
          </span>
          <span className="hidden md:inline">{lab.when[WHEN[index]]}</span>
        </Part>

        <Part show={live} lead={0.08} reduced={reduced} className="min-h-0 flex-1">
          <Memory glyph={GLYPHS[index]} className="h-full w-full" />
        </Part>
      </Slot>
    </>
  );
}
