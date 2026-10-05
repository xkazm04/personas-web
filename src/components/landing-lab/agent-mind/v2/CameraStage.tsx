"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { RunTimer } from "@/components/sections/playground-split/components/RunClock";
import { BEATS, type MindRun } from "../shared/useMindRun";
import { BEAT_BRAND } from "../shared/beats";
import { WORLD, cameraFor, edgePath, edgePoints, worldEdges, worldNodes } from "./world";
import WorldNode from "./WorldNode";
import LowerThird from "./LowerThird";
import Minimap from "./Minimap";


/**
 * The agent mind as a camera move: the flowchart is a track in a deep, lit
 * space, and the camera dollies from beat to beat - framing the one at work
 * at display size, softening the rest - then pulls back to the whole plan as
 * the outcome rises. Background layers move at a fraction of the camera for
 * parallax.
 */
export default function CameraStage({ run }: { run: MindRun }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useIsVisible(ref) && !run.reduced;
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodes = worldNodes(run);
  const subH = run.phase === "done" ? 0.4 : 0.27;
  const viewH = size.h * (1 - subH);
  // The camera frames the band between the HUD and the subtitles.
  const hud = 64;
  const framed = cameraFor(run, nodes, size.w, Math.max(viewH - hud, 0));
  const cam = { ...framed, y: framed.y + hud };
  const running = run.phase === "running";
  const brand = run.phase === "done" ? "emerald" : running ? BEAT_BRAND[BEATS[run.focus]] : "cyan";
  const move = run.reduced ? { duration: 0 } : { duration: 1.1, ease: [0.65, 0, 0.35, 1] as const };

  return (
    <div ref={ref} role="img" aria-label={run.lab.illustration} className="relative h-full min-h-[420px] overflow-hidden stage:min-h-0">
      {/* Far layer: a starfield grid drifting at a third of the camera. */}
      <motion.div
        aria-hidden
        className="absolute -inset-[60%] [background-image:radial-gradient(rgba(var(--surface-overlay),0.12)_1px,transparent_1.5px)] [background-size:28px_28px]"
        initial={false}
        animate={{ x: (cam.x - size.w / 4) * 0.3, y: (cam.y - viewH / 4) * 0.3 }}
        transition={move}
      />
      {/* Key light, fixed at frame centre: the camera brings the beat into it. */}
      <div
        aria-hidden
        className="absolute left-1/2 h-[90%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background] duration-700"
        style={{ top: viewH / 2, background: `radial-gradient(closest-side, ${tint(brand, 20)}, transparent)` }}
      />
      <motion.div
        aria-hidden
        className="absolute left-0 top-0"
        style={{ width: WORLD.w, height: WORLD.h, originX: 0, originY: 0 }}
        initial={false}
        animate={{ x: cam.x, y: cam.y, scale: cam.scale }}
        transition={move}
      >
        <svg className="absolute inset-0 overflow-visible" width={WORLD.w} height={WORLD.h}>
          {worldEdges(nodes).map(([a, b]) => {
            const st = run.phase === "idle" ? "pending" : run.statusOf(b.beat);
            const key = `${a.id}-${b.id}`;
            const p = edgePoints(a, b);
            return (
              <g key={key}>
                <path d={edgePath(a, b)} fill="none" stroke="color-mix(in srgb, var(--foreground) 16%, transparent)" strokeWidth={2} strokeDasharray="4 8" />
                <motion.path
                  d={edgePath(a, b)}
                  fill="none"
                  stroke={BRAND_VAR[st === "done" ? "emerald" : b.brand]}
                  strokeWidth={3}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${tint(st === "done" ? "emerald" : b.brand, 70)})` }}
                  initial={false}
                  animate={{ pathLength: st === "pending" ? 0 : 1, opacity: st === "pending" ? 0 : 1 }}
                  transition={run.reduced ? { duration: 0 } : { duration: 0.7, ease: "easeInOut" }}
                />
                {live && st === "active" && (
                  <motion.circle
                    r={6}
                    fill={BRAND_VAR[b.brand]}
                    style={{ filter: `drop-shadow(0 0 8px ${BRAND_VAR[b.brand]})` }}
                    initial={{ cx: p.cx[0], cy: p.cy[0] }}
                    animate={{ cx: p.cx, cy: p.cy }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </g>
            );
          })}
        </svg>
        {nodes.map((n) => (
          <WorldNode
            key={n.id}
            node={n}
            status={run.phase === "idle" ? "pending" : run.statusOf(n.beat)}
            distance={running ? Math.abs(n.beat - run.focus) : null}
            live={live}
            reduced={run.reduced}
          />
        ))}
      </motion.div>
      {/* Lens: vignette and letterbox. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_55%,color-mix(in_srgb,var(--background)_85%,transparent)_100%)]" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: BRAND_VAR[brand], boxShadow: `0 0 10px ${BRAND_VAR[brand]}` }} />
          <span className="text-foreground">agent-mind</span>
          <span style={{ color: BRAND_VAR[brand] }}>{run.copy.mindStatus[running ? "running" : run.phase === "done" ? "done" : "idle"]}</span>
        </div>
        <div className="flex items-end gap-4">
          {run.phase !== "idle" && <RunTimer startedAt={run.startedAt} running={running} totalMs={run.totalMs} done={run.phase === "done"} />}
          <Minimap run={run} nodes={nodes} cam={cam} view={{ w: size.w, h: viewH }} />
        </div>
      </div>
      <LowerThird run={run} height={`${subH * 100}%`} />
    </div>
  );
}
