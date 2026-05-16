/* 60fps SVG particle simulation: particles/bursts are intentionally kept in
   refs and mutated from requestAnimationFrame. Promoting them to state would
   allocate arrays every frame and thrash React reconciliation. */
/* eslint-disable react-hooks/refs, react-hooks/immutability, custom-animation/require-animation-gating */

import { useCallback, useEffect, useRef, useState } from "react";
import { SWARM_PERSONAS, SWARM_SOURCES } from "@/lib/mock-dashboard-data";
import { bezierControlPoint, CX, CY, type BurstRing, type Particle, type Point } from "./eventBusGeometry";

let particleId = 0;

export function useEventBusParticles({
  prefersReduced,
  sourcePositions,
  personaPositions,
  triggerBurst,
}: {
  prefersReduced: boolean | null;
  sourcePositions: Point[];
  personaPositions: Point[];
  triggerBurst?: number;
}) {
  const particlesRef = useRef<Particle[]>([]);
  const burstsRef = useRef<BurstRing[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const inViewRef = useRef(false);
  const [, forceRender] = useState(0);

  const spawnParticle = useCallback(() => {
    const srcIdx = Math.floor(Math.random() * SWARM_SOURCES.length);
    const pIdx = Math.floor(Math.random() * SWARM_PERSONAS.length);
    const source = sourcePositions[srcIdx];
    const persona = personaPositions[pIdx];
    const color = SWARM_PERSONAS[pIdx].color;
    const hub = { x: CX, y: CY };
    const particle: Particle = {
      id: ++particleId,
      phase: "inbound",
      t: 0,
      speed: 0.8 + Math.random() * 0.6,
      color,
      sourcePos: source,
      targetPos: hub,
      cp: bezierControlPoint(source, hub, 0.2),
      burst: 0,
      done: false,
    };
    (particle as Particle & { _personaPos: Point })._personaPos = persona;
    particlesRef.current.push(particle);
  }, [sourcePositions, personaPositions]);

  const spawnBurst = useCallback((count = 8) => {
    for (let i = 0; i < count; i++) setTimeout(() => spawnParticle(), i * 60);
  }, [spawnParticle]);

  const tick = useCallback((now: number) => {
    if (!inViewRef.current || document.hidden) {
      rafRef.current = 0;
      return;
    }
    if (!lastTimeRef.current) lastTimeRef.current = now;
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = now;
    spawnTimerRef.current -= dt;
    if (spawnTimerRef.current <= 0) {
      spawnParticle();
      spawnTimerRef.current = 0.5 + Math.random() * 1.0;
    }
    updateParticles(particlesRef.current, burstsRef.current, dt);
    particlesRef.current = particlesRef.current.filter((particle) => !particle.done);
    burstsRef.current = burstsRef.current.filter((burst) => burst.t < 1);
    forceRender((n) => n + 1);
    rafRef.current = requestAnimationFrame(tick);
  }, [spawnParticle]);

  useEffect(() => {
    if (triggerBurst && triggerBurst > 0) spawnBurst(12);
  }, [triggerBurst, spawnBurst]);

  useEffect(() => {
    if (prefersReduced) return;
    inViewRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced, tick]);

  return { particles: particlesRef.current, bursts: burstsRef.current, tick, inViewRef, rafRef, lastTimeRef };
}

function updateParticles(particles: Particle[], bursts: BurstRing[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.t += particle.speed * dt;
    if (particle.t >= 1 && !particle.done) {
      if (particle.phase === "inbound") {
        const personaPos = (particle as Particle & { _personaPos: Point })._personaPos;
        particle.phase = "outbound";
        particle.t = 0;
        particle.sourcePos = { x: CX, y: CY };
        particle.targetPos = personaPos;
        particle.cp = bezierControlPoint(particle.sourcePos, particle.targetPos, 0.25);
        bursts.push({ id: ++particleId, x: CX, y: CY, t: 0, color: particle.color });
      } else {
        bursts.push({ id: ++particleId, x: particle.targetPos.x, y: particle.targetPos.y, t: 0, color: particle.color });
        particle.done = true;
      }
    }
  }
  for (const burst of bursts) burst.t += dt * 3;
}
