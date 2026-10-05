"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useIsVisible } from "@/hooks/useIsVisible";
import { createWorld, resizeWorld, skipIntro, spawnEvent, step, INTRO, type World } from "./swarm";
import { drawSwarm, readPalette, type Palette } from "./swarm-draw";

export interface SwarmLabels { events: string[]; handled: string; yourEvent: string }

/**
 * Owns the swarm's canvas: sizing (DPR-capped), theme colours (re-read when
 * the site theme changes) and the frame loop. The loop runs only while the
 * hero is on screen in a visible tab and the visitor allows motion; otherwise
 * the canvas holds a still frame - under reduced motion a composed one, with
 * two teams at work, instead of the intro.
 */
export function useSwarm(wrapRef: RefObject<HTMLDivElement | null>, canvasRef: RefObject<HTMLCanvasElement | null>, labels: SwarmLabels) {
  const reduced = useStillMotion();
  const visible = useIsVisible(wrapRef);
  const worldRef = useRef<World | null>(null);
  const palRef = useRef<Palette | null>(null);
  const labelsRef = useRef(labels);
  const reducedRef = useRef(reduced);
  const paintRef = useRef<() => void>(() => {});
  const [introOn, setIntroOn] = useState(true);

  useEffect(() => {
    labelsRef.current = labels;
    reducedRef.current = reduced;
  }, [labels, reduced]);

  const nextLabel = useCallback(() => {
    const w = worldRef.current;
    const list = labelsRef.current.events;
    if (!w) return list[0] ?? "";
    w.labelIdx += 1;
    return list[w.labelIdx % list.length] ?? "";
  }, []);

  // Size, theme, and the still painter.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;
    palRef.current = readPalette(wrap);
    paintRef.current = () => {
      const world = worldRef.current;
      if (world && palRef.current) drawSwarm(ctx, world, palRef.current, labelsRef.current);
    };
    const fit = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (width < 2 || height < 2) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (worldRef.current) resizeWorld(worldRef.current, width, height);
      else worldRef.current = createWorld(width, height, !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      paintRef.current();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    const mo = new MutationObserver(() => {
      palRef.current = readPalette(wrap);
      paintRef.current();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => { ro.disconnect(); mo.disconnect(); };
  }, [wrapRef, canvasRef]);

  // The frame loop, or a composed still frame.
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    if (reduced) {
      // A calm, complete frame: no intro, two teams gathered around events.
      skipIntro(world);
      if (!world.teams.some((tm) => tm.mission)) {
        spawnEvent(world, labelsRef.current.events[0] ?? "");
        spawnEvent(world, labelsRef.current.events[2] ?? "");
        for (let i = 0; i < 110; i++) step(world, 1 / 60, nextLabel);
        world.ripples = [];
      }
      paintRef.current();
      return;
    }
    if (!visible) return;
    let raf = 0;
    let last = performance.now();
    const introTimer = window.setTimeout(() => setIntroOn(false), Math.max(0, world.intro * 1000));
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(world, dt, nextLabel);
      paintRef.current();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(introTimer); };
  }, [reduced, visible, nextLabel]);

  const skip = useCallback(() => {
    if (worldRef.current && worldRef.current.intro > 0) skipIntro(worldRef.current);
    setIntroOn(false);
  }, []);

  const send = useCallback((at?: [number, number]) => {
    const world = worldRef.current;
    if (!world) return;
    if (world.intro > 0) skip();
    spawnEvent(world, at ? labelsRef.current.yourEvent : nextLabel(), at);
    // Still mode jumps straight to the team gathered round it - no travel.
    if (reducedRef.current) {
      for (let i = 0; i < 110; i++) step(world, 1 / 60, nextLabel);
      world.ripples = [];
    }
    paintRef.current();
  }, [nextLabel, skip]);

  const point = useCallback((at: [number, number] | null) => {
    const world = worldRef.current;
    if (!world) return;
    world.pointer = at !== null;
    if (at) { world.px = at[0]; world.py = at[1]; }
  }, []);

  return { introOn: introOn && !reduced, introSeconds: INTRO, skip, send, point };
}
