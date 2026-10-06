"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import AthenaFace from "../shared/AthenaFace";
import { MONO, fsOf } from "../shared/frame";
import { place } from "../shared/place";
import { CARD_ORDER, GROUPS, KEEPS, type SceneState } from "./data";
import type { Geo, Words } from "./geometry";

/**
 * Her side of the scene: what she carries, in the three kinds the claim names
 * - what you prefer, what worked, what you decided.
 *
 * Every card is mounted from the first frame as a dashed slot, so the column
 * is visibly waiting to be filled and never reflows. A card fills the tick a
 * detail you gave her lands, and is written in HER words - "careful with
 * billing" arrives as "Billing is the one you worry about" - because carrying
 * something is understanding it, not filing your sentence. When the month-two
 * request comes in, every card lights at once: that is the work she brings
 * without being asked.
 */
export default function Tray({
  geo,
  words,
  scene,
  reduced,
}: {
  geo: Geo;
  words: Words;
  scene: SceneState;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaLab.memory.v2;
  const fs = fsOf(geo.W);
  const at = place(geo);
  const recalling = scene.recall === 1;
  const last = geo.cards[CARD_ORDER[CARD_ORDER.length - 1]];
  const panel = {
    x: geo.avatar.x - 18,
    y: geo.avatar.y - 14,
    w: geo.W - geo.avatar.x + 18,
    h: last.y + last.h - geo.avatar.y + 30,
  };

  return (
    <>
      {/* The column itself: a lit panel she owns. */}
      <motion.span
        className="absolute rounded-3xl border"
        style={{
          ...at(panel),
          borderColor: tint("cyan", 16),
          background: `linear-gradient(180deg, ${tint("cyan", 9)}, ${tint("cyan", 3)} 40%, transparent)`,
          boxShadow: `inset 0 1px 0 ${tint("cyan", 22)}`,
        }}
        initial={false}
        animate={{ opacity: scene.open ? 1 : 0.4 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
      />

      <span className="absolute" style={at(geo.avatar)}>
        <AthenaFace size={`calc(${geo.avatar.size} * 100cqw / ${geo.W})`} glow={recalling || scene.flying.length > 0} reduced={reduced} />
      </span>
      <span
        className={`absolute -translate-y-1/2 ${MONO}`}
        style={{ ...at(geo.header), ...fs(geo.fs.label * 1.1, 13), color: BRAND_VAR.cyan }}
      >
        {t.athenaPage.memory.shelf}
      </span>

      {GROUPS.map((g) => (
        <span
          key={g}
          className={`absolute -translate-y-1/2 text-muted-dark ${MONO}`}
          style={{ ...at(geo.groups[g]), ...fs(geo.fs.label, 12) }}
        >
          {c.groups[g]}
        </span>
      ))}

      {CARD_ORDER.map((k) => {
        const held = scene.carried.has(k);
        const landing = scene.flying.includes(k);
        const hot = recalling || landing;
        return (
          <span key={k} className="absolute" style={at(geo.cards[k])}>
            <span
              className={`absolute inset-0 rounded-xl border duration-500 transition-[background-color,border-color,box-shadow] ${held || landing ? "" : "border-dashed"}`}
              style={{
                borderColor: tint("cyan", hot ? 80 : held ? 34 : 16),
                backgroundColor: tint("cyan", hot ? 20 : held ? 8 : 0),
                boxShadow: hot ? brandShadow("cyan", 20, 45) : held ? `inset 0 1px 0 ${tint("cyan", 26)}` : "none",
              }}
            />
            <motion.span
              className="absolute inset-0 flex items-center px-[0.85em] font-medium leading-snug text-foreground"
              style={fs(geo.fs.card, 14)}
              initial={false}
              animate={{ opacity: held ? 1 : 0, x: held ? 0 : -8 }}
              transition={reduced ? { duration: 0 } : SPRING_POP}
            >
              {words.kept[KEEPS[k].kept]}
            </motion.span>
          </span>
        );
      })}
    </>
  );
}
