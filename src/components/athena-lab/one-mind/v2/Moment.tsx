"use client";

import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { BRAND_VAR, brandShadow, tint, type BrandKey } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { MediumIcon } from "../shared/icons";
import { Part, Slot } from "../shared/parts";
import type { Rect } from "../shared/types";
import { BODY, LABEL, MONO } from "../shared/type";
import { HerBubble, YouBubble } from "./Bubbles";
import { History, VoiceRings } from "./Surface";

/**
 * One moment of the day, as a stylised surface (not a screenshot): a window
 * at your desk, a voice call with no screen at all on the walk, another
 * window - another project - in the evening.
 *
 * It composes in the shared layers: outline, the surface, your words, her
 * words. While it is the moment you are in it carries the hour's light; once
 * the day has moved on it dims, still readable, because the day so far is
 * the point - it is all still there, and she has all of it.
 */

export const ACCENTS: readonly BrandKey[] = ["amber", "emerald", "purple"];

export default function Moment({
  index,
  rect,
  stage,
  current,
  recalled,
  shipped,
  speaking,
  talking,
  captionInside,
  reduced,
}: {
  index: number;
  rect: Rect;
  stage: ModuleStage;
  current: boolean;
  recalled: boolean;
  shipped: boolean;
  speaking: boolean;
  /** Someone is talking on the walk (you or her) - the rings swell. */
  talking: boolean;
  /** No sky (phones): the time and place go inside the header instead. */
  captionInside: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const lab = t.athenaLab.oneMind.v2;
  const names = t.athenaPage.oneMind.conversations;
  const m = lab.moments[index];
  const accent = ACCENTS[index];
  const spoken = index === 1;
  const title = spoken ? lab.byVoice : index === 0 ? names[0].name : names[4].name;
  const past = !current && atStage(stage, "chosen");

  return (
    <Slot
      rect={rect}
      solid={atStage(stage, "shell")}
      waiting
      reduced={reduced}
      round={spoken ? "rounded-[1.6rem]" : "rounded-xl"}
      className="flex flex-col overflow-hidden backdrop-blur-sm"
      style={{
        ...LABEL,
        opacity: past ? 0.72 : 1,
        borderColor: tint(accent, current ? 46 : 24),
        backgroundImage: `linear-gradient(to bottom, ${tint(accent, current ? 10 : 5)}, ${tint("cyan", 2)} 60%)`,
        boxShadow: current ? brandShadow(accent, 34, 16) : undefined,
      }}
    >
      <span
        className="flex shrink-0 items-center gap-[0.6em] whitespace-nowrap border-b px-[0.9em] py-[0.5em]"
        style={{ borderColor: tint(accent, 20) }}
      >
        {spoken ? (
          <span style={{ color: BRAND_VAR[accent] }}>
            <MediumIcon medium="spoken" />
          </span>
        ) : (
          <span className="flex gap-[0.3em]" aria-hidden="true">
            {[0, 1, 2].map((d) => (
              <span key={d} className="h-[0.5em] w-[0.5em] rounded-full" style={{ backgroundColor: tint(accent, 45) }} />
            ))}
          </span>
        )}
        <span className="text-foreground" style={BODY}>
          {title}
        </span>
        {captionInside && (
          <span className={`ml-auto text-muted-dark ${MONO}`}>{m.time}</span>
        )}
      </span>

      <span className="flex min-h-0 flex-1 flex-col justify-end gap-[0.7em] px-[0.9em] py-[0.8em]">
        {spoken ? (
          <span className="flex min-h-0 flex-1 items-center justify-center py-[0.3em]">
            {atStage(stage, "shell") && <VoiceRings accent={accent} talking={talking} />}
          </span>
        ) : (
          <span className="mb-auto pt-[0.4em]">
            <Part show={atStage(stage, "shell")} reduced={reduced} className="block">
              <History accent={accent} />
            </Part>
          </span>
        )}
        <Part show={atStage(stage, "body")} reduced={reduced} className="flex">
          <YouBubble accent={accent} spoken={spoken} live={speaking}>
            {m.you}
          </YouBubble>
        </Part>
        <Part show={atStage(stage, "detail")} reduced={reduced} className="flex">
          <HerBubble {...m.her} recalled={recalled} />
        </Part>
        {spoken && (
          <Part show={shipped} reduced={reduced} className="flex">
            <YouBubble accent={accent} spoken live={false}>
              {lab.ship}
            </YouBubble>
          </Part>
        )}
      </span>
    </Slot>
  );
}
