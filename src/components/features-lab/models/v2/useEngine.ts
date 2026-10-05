"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { animate, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { ORDER, STARS, type Engine } from "./geometry";

/**
 * The chosen engine of V2 and the motion values the drawing reads. While the art
 * is in view (and the tab is foregrounded) the choice cycles by itself until the
 * visitor picks one; under reduced motion it never cycles and every change is
 * a cut. `tx/ty` is the tether's target, `reach` how far it extends, `dome` how
 * closed the dome is. Server and first paint rest on Sonnet, tether out.
 */
export function useEngine(ref: RefObject<Element | null>) {
  const still = useStillMotion();
  const visible = useIsVisible(ref, { threshold: 0.4 });
  const [sel, setSel] = useState<Engine>("sonnet");
  const [manual, setManual] = useState(false);
  const tx = useMotionValue(STARS.sonnet.c[0]);
  const ty = useMotionValue(STARS.sonnet.c[1]);
  const reach = useMotionValue(1);
  const dome = useMotionValue(0);

  useEffect(() => {
    if (still || manual || !visible) return;
    const id = window.setInterval(() => setSel((s) => ORDER[(ORDER.indexOf(s) + 1) % ORDER.length]), 3600);
    return () => window.clearInterval(id);
  }, [still, manual, visible]);

  useEffect(() => {
    const local = sel === "ollama";
    if (still) {
      if (!local) {
        tx.set(STARS[sel].c[0]);
        ty.set(STARS[sel].c[1]);
      }
      reach.set(local ? 0 : 1);
      dome.set(local ? 1 : 0);
      return;
    }
    const runs: AnimationPlaybackControls[] = [];
    if (local) {
      runs.push(animate(reach, 0, { duration: 0.7, ease: "easeIn" }));
      runs.push(animate(dome, 1, { duration: 0.9, delay: 0.45, ease: "easeOut" }));
    } else {
      const back = dome.get() > 0.01;
      runs.push(animate(dome, 0, { duration: 0.5, ease: "easeIn" }));
      runs.push(animate(tx, STARS[sel].c[0], { duration: back ? 0 : 0.8, ease: "easeInOut" }));
      runs.push(animate(ty, STARS[sel].c[1], { duration: back ? 0 : 0.8, ease: "easeInOut" }));
      runs.push(animate(reach, 1, { duration: 0.8, delay: back ? 0.4 : 0, ease: "easeOut" }));
    }
    return () => runs.forEach((r) => r.stop());
  }, [sel, still, tx, ty, reach, dome]);

  const pick = useCallback((e: Engine) => {
    setManual(true);
    setSel(e);
  }, []);

  return { sel, pick, tx, ty, reach, dome };
}
