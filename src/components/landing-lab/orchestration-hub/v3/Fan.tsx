"use client";

import { useEffect, useId, useState } from "react";
import { animate, motionValue } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { TRIGGERS } from "@/components/sections/orchestration-hub/data";
import type { HubPlayback } from "../shared/useHubPlayback";
import Ray from "./Ray";
import RayLabel from "./RayLabel";
import Porthole from "./Porthole";
import Sun from "./Sun";
import { H, OX, OY, PORT_D, R1, W, at, fanLayout } from "./geometry";

const IRIS = { type: "spring", stiffness: 70, damping: 18, mass: 1 } as const;

/**
 * The sunrise: ten rays of coloured glass fanned over the horizon, the agent
 * rising at their centre. The active ray opens like an iris (every ray's
 * edges are springs), shows its scene in a round pane, and sends bands of
 * light down into the sun. The edges live in motion values made once (not
 * hooks in a loop) and are driven from an effect, never from render.
 */
export default function Fan({ hub }: { hub: HubPlayback }) {
  const uid = useId();
  const copy = useTranslation().t.orchestrationSection;
  const active = hub.state.active;
  const layout = fanLayout(active);
  const [edges] = useState(() => fanLayout(active).map((r) => ({ a0: motionValue(r.a0), a1: motionValue(r.a1) })));

  useEffect(() => {
    const target = fanLayout(active);
    const runs = edges.flatMap((e, i) => {
      if (hub.still) {
        e.a0.jump(target[i].a0);
        e.a1.jump(target[i].a1);
        return [];
      }
      return [animate(e.a0, target[i].a0, IRIS), animate(e.a1, target[i].a1, IRIS)];
    });
    return () => runs.forEach((r) => r.stop());
  }, [active, hub.still, edges]);

  const open = layout[active];
  const port = at(PORT_D, (open.a0 + open.a1) / 2);

  return (
    <div
      role="group"
      aria-label={copy.ringLabel}
      className="@container relative mx-auto aspect-[1320/530] w-[min(100%,calc(100cqh_*_1320_/_530))]"
      {...hub.holdProps}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-horizon`} x1="0" x2="1">
            <stop offset="0" stopColor="rgba(var(--surface-overlay), 0)" />
            <stop offset="0.5" stopColor="rgba(var(--surface-overlay), 0.35)" />
            <stop offset="1" stopColor="rgba(var(--surface-overlay), 0)" />
          </linearGradient>
        </defs>
        <path d={`M${OX - R1 - 12} ${OY} A${R1 + 12} ${R1 + 12} 0 0 1 ${OX + R1 + 12} ${OY}`} fill="none" stroke="rgba(var(--surface-overlay), 0.08)" strokeDasharray="1 7" strokeWidth="2" />
        {TRIGGERS.map((t, i) => (
          <Ray key={t.id} trigger={t} a0={edges[i].a0} a1={edges[i].a1} on={i === active} live={hub.live} uid={uid} onSelect={hub.select} />
        ))}
        <Porthole trigger={hub.trigger} x={port.x} y={port.y} live={hub.live} still={hub.still} />
        <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} stroke={`url(#${uid}-horizon)`} strokeWidth="1.5" />
      </svg>
      {TRIGGERS.map((t, i) => (
        <RayLabel key={t.id} trigger={t} index={i} a0={edges[i].a0} a1={edges[i].a1} on={i === active} onSelect={hub.select} />
      ))}
      <Sun trigger={hub.trigger} live={hub.live} still={hub.still} />
    </div>
  );
}
