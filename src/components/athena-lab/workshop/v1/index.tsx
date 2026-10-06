"use client";

import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import { tint } from "@/lib/brand-theme";
import { ArtBox, frame } from "../shared/art";
import Her from "../shared/Her";
import Shell from "../shared/Shell";
import { useSceneClock } from "../shared/useSceneClock";
import { useStretch } from "../shared/useStretch";
import { CYCLE, JOBS_IN, STILL_TICK, TICK_MS, sceneAt, statusAt } from "./data";
import Dial from "./Dial";
import Ground from "./Ground";
import { WIDE_H, WIDE_W, layoutFor } from "./layout";
import Outside from "./Outside";
import Place from "./Place";

/**
 * Workshop lab v1 - "The Fence", evolved.
 *
 * Same story, same mechanism as the live section: you draw a line once, name
 * the places inside it, and she works there; the dial that says how much she
 * does on her own stands outside the line, and turning it all the way up fills
 * every slot in the yard without the line moving at all. Then the beat the
 * section exists for: work appears on your side, her reach runs to the line
 * and stops dead, and that work picks up its only words - waits for you.
 *
 * What this round pushes: light (the ground inside the line is lit, outside
 * is not; the line is a crisp core over a bloom with a post at every corner),
 * a real rotary dial with detents instead of a slider, glass depth on the
 * places, a display-weight type hierarchy, and a stage-high frame - the art
 * is aspect-locked and sized in its own units, so it fills one screen at any
 * desktop size and its type grows with it.
 *
 * Reduced motion pins the closing stillness: everything finished, dial at
 * its top stop, and the work on your side still waiting.
 */
export default function WorkshopFenceEvolved() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const w = t.athenaPage.workshop;
  const { ref, phase, reduced } = useSceneClock({ cycle: CYCLE, still: STILL_TICK, tickMs: TICK_MS });
  const scene = sceneAt(phase);
  const stretch = useStretch(WIDE_W, WIDE_H);
  const g = layoutFor(compact, stretch.k);
  const f = frame(g.W, g.H);
  const [status, statusShort] = statusAt(phase, w.status);
  const mood = scene.reaching && !scene.stopped ? "lean" : scene.working ? "busy" : "rest";

  return (
    <Shell sectionRef={ref} status={status} statusShort={statusShort} settled={scene.calm} reduced={reduced}>
      <ArtBox w={g.W} h={g.H} label={t.athenaLab.workshop.v1.art} measureRef={stretch.ref}>
        <Ground scene={scene} g={g} reduced={reduced} />

        {/* Everything but the line steps back a little in the closing calm */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: scene.calm && !reduced ? 0.84 : 1 }}
          transition={{ duration: reduced ? 0 : 1.2, ease: "easeInOut" }}
        >
          {g.beds.map((rect, b) => (
            <Place
              key={w.beds[b].name}
              rect={rect}
              name={compact ? w.beds[b].short : w.beds[b].name}
              stage={scene.beds[b]}
              jobs={JOBS_IN[b].map((i) => ({ title: w.jobTitles[i], stage: scene.jobs[i], progress: scene.progress[i] }))}
              stack={g.stack}
              f={f}
              W={g.W}
              H={g.H}
              reduced={reduced}
            />
          ))}

          <Dial d={g.dial} on={scene.dial} level={scene.level} W={g.W} H={g.H} f={f} reduced={reduced} />
          <Outside rect={g.outside} shown={scene.outside} waits={scene.stopped} f={f} reduced={reduced} />

          <div className="absolute -translate-x-1/2 -translate-y-1/2" style={f.at(g.her.x, g.her.y)} aria-hidden="true">
            <Her size={f.len(g.her.size, 56)} mood={mood} shown={scene.her} reduced={reduced} />
          </div>
        </motion.div>

        {/* The plate, astride the line: the yard is named from the outset */}
        <motion.span
          className="absolute -translate-y-1/2 whitespace-nowrap rounded-full border bg-background font-mono uppercase tracking-[0.18em] text-brand-cyan"
          style={{
            ...f.at(g.plate.x, g.plate.y),
            ...f.fs(15, 12),
            paddingInline: f.len(14, 10),
            paddingBlock: f.len(4, 2),
            borderColor: tint("cyan", 40),
          }}
          initial={false}
          animate={{ opacity: scene.named ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.45 }}
          aria-hidden="true"
        >
          {compact ? w.fence.plateShort : w.fence.plate}
        </motion.span>
      </ArtBox>
    </Shell>
  );
}
