"use client";

import { useEffect, useId, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { CHAIN, FH, FW, SCREEN, TASK, cameraTransform, placeAttr } from "./geometry";
import { ChainScene, TaskScene } from "./inner";
import { ComputerScene, FleetScene } from "./outer";

/**
 * The lens: all four frames drawn once, nested, and one world transform that
 * the camera value drives directly (no React render per frame). `level` is the
 * level the camera is heading for; only that frame's loops run.
 */
export default function World({ cam, level, run }: { cam: MotionValue<number>; level: number; run: boolean }) {
  const v = useTranslation().t.howLab.layers.v3;
  const uid = useId().replace(/:/g, "");
  const worldRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = worldRef.current;
    if (!g) return;
    const apply = (p: number) => g.setAttribute("transform", cameraTransform(p));
    apply(cam.get());
    return cam.on("change", apply);
  }, [cam]);

  const live = (k: number) => run && level === k;

  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <clipPath id={`${uid}-screen`}>
          <rect x="0" y="0" width={FW} height={FH} />
        </clipPath>
      </defs>
      <g ref={worldRef} transform={cameraTransform(cam.get())}>
        <ComputerScene keyring={v.keyring} noServers={v.noServers} />
        <g transform={placeAttr(SCREEN)}>
          <g clipPath={`url(#${uid}-screen)`}>
            <FleetScene live={live(2)} title={v.fleet} healed={v.healed} />
            <g transform={placeAttr(CHAIN)}>
              <ChainScene live={live(1)} uid={uid} labels={v.chainLabels} />
              <g transform={placeAttr(TASK)}>
                <TaskScene live={live(0)} uid={uid} prompt={v.prompt} steps={v.steps} />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
