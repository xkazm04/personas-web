/* 60fps SVG particle simulation: particles/bursts are intentionally kept in
   refs and mutated from requestAnimationFrame. Promoting them to state would
   allocate arrays every frame and thrash React reconciliation. */
/* eslint-disable react-hooks/refs, react-hooks/immutability */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { BUS_DEAD_LETTER_COLOR, hashString, unseenEvents, type BusSource } from "@/lib/busProjection";
import { SWARM_PERSONAS } from "@/lib/mock-dashboard-data";
import type { PersonaEvent } from "@/lib/types";
import { bezierControlPoint, CX, CY, type BurstRing, type Particle, type Point } from "./eventBusGeometry";

let particleId = 0;

/** On mount, events newer than this are replayed once so a live bus is not blank. */
const REPLAY_RECENT_MS = 15 * 60_000;
/** Most particles one arrival batch (a poll, a replay) may launch. */
const MAX_BATCH = 24;
/** Gap between staggered particles in a batch, in particle-time units. */
const STAGGER = 0.12;

export function useEventBusParticles({
  prefersReduced,
  events,
  sources,
  sourcePositions,
  personaPositions,
}: {
  prefersReduced: boolean | null;
  /** The event log. Every particle is one event in it; there is no ambient traffic. */
  events: readonly PersonaEvent[];
  sources: readonly BusSource[];
  sourcePositions: Point[];
  personaPositions: Point[];
}) {
  const particlesRef = useRef<Particle[]>([]);
  const burstsRef = useRef<BurstRing[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  // Assume on-screen until the IntersectionObserver upstream says otherwise;
  // re-running an effect for a visibility change must NOT reset this, or
  // returning to the tab would restart a loop that is scrolled away.
  const inViewRef = useRef(true);
  const seenRef = useRef<Set<string>>(new Set());
  const [, forceRender] = useState(0);
  // Ambient loop: it must stop when the tab is backgrounded AND resume when the
  // tab comes back. `tick`'s own `document.hidden` check only ever stops the
  // loop; nothing re-arms it, and the IntersectionObserver upstream does not
  // fire on a visibility change — so without this subscription the bus stays
  // frozen until the element's intersection state happens to change.
  const pageHidden = usePageVisibility();

  const spawnForEvent = useCallback((event: PersonaEvent, order: number) => {
    const srcIdx = sources.findIndex((source) => source.id === event.sourceType);
    const source = sourcePositions[srcIdx];
    if (!source) return;
    const deadLetter = event.status === "dead_letter";
    const pIdx = hashString(event.targetPersonaId ?? event.id) % personaPositions.length;
    const color = deadLetter ? BUS_DEAD_LETTER_COLOR : SWARM_PERSONAS[pIdx % SWARM_PERSONAS.length].color;
    const hub = { x: CX, y: CY };
    particlesRef.current.push({
      id: ++particleId,
      phase: "inbound",
      t: -order * STAGGER,
      speed: 0.8 + (hashString(event.id) % 60) / 100,
      color,
      sourcePos: source,
      targetPos: hub,
      cp: bezierControlPoint(source, hub, 0.2),
      burst: 0,
      done: false,
      personaPos: personaPositions[pIdx],
      deadLetter,
    });
    // A dead letter announces itself on the node it came from.
    if (deadLetter) burstsRef.current.push({ id: ++particleId, x: source.x, y: source.y, t: 0, color });
  }, [sources, sourcePositions, personaPositions]);

  // One event, one particle: each poll or SSE arrival launches exactly the ids
  // not drawn yet, and the log already in the buffer on mount replays once.
  useEffect(() => {
    const seen = seenRef.current;
    const fresh = unseenEvents(events, seen);
    for (const event of fresh) seen.add(event.id);
    if (prefersReduced || !inViewRef.current || (typeof document !== "undefined" && document.hidden)) return;
    // Only recent rows fly: a poll that merges an older page into the buffer
    // is history, not traffic.
    const cutoff = Date.now() - REPLAY_RECENT_MS;
    const launch = fresh
      .filter((event) => Date.parse(event.createdAt) >= cutoff)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      .slice(-MAX_BATCH);
    launch.forEach((event, i) => spawnForEvent(event, i));
  }, [events, prefersReduced, spawnForEvent]);

  const tick = useCallback((now: number) => {
    if (!inViewRef.current || document.hidden) {
      rafRef.current = 0;
      return;
    }
    if (!lastTimeRef.current) lastTimeRef.current = now;
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = now;
    updateParticles(particlesRef.current, burstsRef.current, dt);
    particlesRef.current = particlesRef.current.filter((particle) => !particle.done);
    burstsRef.current = burstsRef.current.filter((burst) => burst.t < 1);
    forceRender((n) => n + 1);
    // A quiet bus idles: with nothing in flight there is nothing to animate,
    // so the loop stops until the next arrival re-arms it.
    if (particlesRef.current.length === 0 && burstsRef.current.length === 0) {
      rafRef.current = 0;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Arm the loop whenever there is something to draw and nothing is running.
  useEffect(() => {
    if (prefersReduced || pageHidden || !inViewRef.current || rafRef.current) return;
    if (particlesRef.current.length === 0 && burstsRef.current.length === 0) return;
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [events, prefersReduced, pageHidden, tick]);

  useEffect(() => {
    if (prefersReduced) return;
    if (!pageHidden && inViewRef.current) {
      // Cancel first so a rapid hide/show (or a handle the observer armed)
      // can never leave two loops running against the same refs.
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0; // don't integrate the backgrounded gap as one dt
      rafRef.current = requestAnimationFrame(tick);
    }
    // Registered unconditionally: the observer can arm a frame while this
    // effect took the early path, and that handle still has to be released.
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [prefersReduced, pageHidden, tick]);

  return { particles: particlesRef.current, bursts: burstsRef.current, tick, inViewRef, rafRef, lastTimeRef };
}

function updateParticles(particles: Particle[], bursts: BurstRing[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.t += particle.speed * dt;
    if (particle.t >= 1 && !particle.done) {
      if (particle.phase === "inbound" && !particle.deadLetter && particle.personaPos) {
        particle.phase = "outbound";
        particle.t = 0;
        particle.sourcePos = { x: CX, y: CY };
        particle.targetPos = particle.personaPos;
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
