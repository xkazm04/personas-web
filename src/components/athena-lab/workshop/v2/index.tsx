"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";
import { tint } from "@/lib/brand-theme";
import { ArtBox, frame } from "../shared/art";
import Her from "../shared/Her";
import Shell from "../shared/Shell";
import { useSceneClock } from "../shared/useSceneClock";
import { useStretch } from "../shared/useStretch";
import { CYCLE, STILL_TICK, TICK_MS, sceneAt, statusAt } from "./data";
import Keys from "./Keys";
import { WIDE_H, WIDE_W, layoutFor } from "./layout";
import Plan from "./Plan";
import Rooms from "./Rooms";
import Tray from "./Tray";

/**
 * Workshop lab v2 - "The Keys".
 *
 * The same claim told as a building. Your work is a floor plan - six rooms,
 * each a real tool - and the walls are the lines you drew. "However much you
 * hand her" becomes something anyone has done: handing over keys. One key,
 * then two more, then a fourth; each opens one door, lights one room, and
 * puts her to work in it, so how much she does grows with exactly what you
 * handed over. Two keys never leave your ring.
 *
 * Then a finished fix needs the live site - a room you kept. She walks to
 * that door and stops; the leaf flares where she stands, and the work slides
 * out to your tray as a note that waits for you. Nothing on screen refuses
 * her. A door you kept is just a wall, and she treats it as one.
 *
 * Reduced motion pins the end: four rooms lit and finished, two keys still
 * yours, the note in your tray.
 */
const WALK = { type: "spring", stiffness: 40, damping: 14 } as const;

export default function WorkshopKeys() {
  const compact = useIsMobile();
  const { t } = useTranslation();
  const { ref, phase, reduced } = useSceneClock({ cycle: CYCLE, still: STILL_TICK, tickMs: TICK_MS });
  const scene = sceneAt(phase);
  const stretch = useStretch(WIDE_W, WIDE_H);
  const g = layoutFor(compact, stretch.k);
  const f = frame(g.W, g.H);
  const [status, statusShort] = statusAt(scene.beat, t.athenaLab.workshop.v2);
  const at = scene.station < 0 ? g.entrance : g.stations[scene.station];
  const mood = scene.stopped && !scene.calm ? "hold" : scene.working ? "busy" : "rest";

  return (
    <Shell sectionRef={ref} status={status} statusShort={statusShort} settled={scene.calm} reduced={reduced}>
      <ArtBox w={g.W} h={g.H} label={t.athenaLab.workshop.v2.art} measureRef={stretch.ref}>
        <Plan scene={scene} g={g} reduced={reduced} />
        <Rooms scene={scene} g={g} f={f} reduced={reduced} />

        {/* Her, walking the corridor - a zero-size anchor moved in container
            width units (the art box is an inline-size container, so 100cqw
            is its width), which keeps her stations exact at every size */}
        <motion.div
          className="pointer-events-none absolute left-0 top-0"
          initial={false}
          animate={{ x: `${(at.x / g.W) * 100}cqw`, y: `${(at.y / g.W) * 100}cqw` }}
          transition={reduced ? { duration: 0 } : WALK}
          aria-hidden="true"
        >
          <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
            <Her size={f.len(g.herSize, 44)} mood={mood} shown={scene.her} reduced={reduced} />
            <AnimatePresence>
              {scene.carrying && (
                <motion.span
                  className="absolute -right-[30%] -top-[20%] flex items-center justify-center rounded-md border bg-surface"
                  style={{ width: f.len(30, 22), height: f.len(30, 22), borderColor: tint("cyan", 50) }}
                  initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                >
                  <Mail className="h-3/5 w-3/5 text-brand-cyan" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <Keys scene={scene} g={g} f={f} reduced={reduced} />
        <Tray scene={scene} g={g} f={f} reduced={reduced} />
      </ArtBox>
    </Shell>
  );
}
