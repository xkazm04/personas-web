"use client";

import { useEffect, useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { arcPath, type CityLayout } from "./city-layout";

/** One message or handoff travelling between two windows; `id` launches it once. */
export interface Packet {
  id: number;
  from: string;
  to: string;
  kind: "message" | "handoff";
}

const NS = "http://www.w3.org/2000/svg";
const DUR = 2600;

interface Flight {
  path: SVGPathElement;
  halo: SVGCircleElement;
  dot: SVGCircleElement;
  len: number;
  t0: number;
}

/**
 * A light that travels the arc between two windows each time the simulation
 * sends a message or a handoff. Imperative SVG on one rAF loop; nothing is
 * launched under reduced motion or in a background tab, and the loop stops as
 * soon as the sky is empty.
 */
export default function Packets({ packet, layout }: { packet: Packet | null; layout: CityLayout }) {
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const gRef = useRef<SVGGElement>(null);
  const flights = useRef<Flight[]>([]);
  const raf = useRef(0);
  const lastId = useRef(-1);

  useEffect(() => {
    const g = gRef.current;
    // The layout is rebuilt on every tick; launch each packet once only.
    if (!packet || packet.id === lastId.current || !g || still || hidden) return;
    lastId.current = packet.id;
    const d = arcPath(layout, packet.from, packet.to);
    if (!d) return;
    const color = packet.kind === "handoff" ? "var(--brand-amber)" : "var(--ns-wire)";
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.style.stroke = color;
    path.setAttribute("stroke-width", "1.2");
    path.setAttribute("opacity", "0");
    const halo = document.createElementNS(NS, "circle");
    halo.setAttribute("r", "11");
    halo.style.fill = color;
    halo.setAttribute("opacity", ".22");
    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("r", "3.6");
    dot.style.fill = "var(--foreground)";
    g.append(path, halo, dot);
    flights.current.push({ path, halo, dot, len: path.getTotalLength(), t0: performance.now() });

    const frame = (t: number) => {
      raf.current = 0;
      const list = flights.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        const k = Math.min(1, (t - p.t0) / DUR);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const pt = p.path.getPointAtLength(p.len * e);
        for (const c of [p.dot, p.halo]) {
          c.setAttribute("cx", pt.x.toFixed(1));
          c.setAttribute("cy", pt.y.toFixed(1));
        }
        p.path.setAttribute("opacity", (Math.sin(k * Math.PI) * 0.45).toFixed(3));
        if (k >= 1) {
          p.path.remove();
          p.halo.remove();
          p.dot.remove();
          list.splice(i, 1);
        }
      }
      if (list.length) raf.current = requestAnimationFrame(frame);
    };
    if (!raf.current) raf.current = requestAnimationFrame(frame);
  }, [packet, layout, still, hidden]);

  // Going still or hidden clears the sky.
  useEffect(() => {
    if (!(still || hidden)) return;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    for (const p of flights.current.splice(0)) {
      p.path.remove();
      p.halo.remove();
      p.dot.remove();
    }
  }, [still, hidden]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return <g ref={gRef} pointerEvents="none" aria-hidden="true" />;
}
