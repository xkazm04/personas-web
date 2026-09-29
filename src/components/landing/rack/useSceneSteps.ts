"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTyper } from "../shared/useTyper";

const HOLD_MS = 1100;

interface Args {
  /** Which persona this run belongs to; a new id restarts the run. */
  id: number;
  request: string;
  steps: readonly string[];
  /** Wait before the first run (the open animation) and before later ones (the swap). */
  firstDelay: number;
  laterDelay: number;
}

/**
 * The "watch it think" run: the request types out, then each step types in
 * turn. Reduced motion shows the request and the first step as finished text.
 * A visitor's own step choice (`goTo`) cancels the run and shows that step
 * whole. Every state change happens in a timer or a handler, never in an
 * effect body.
 */
export function useSceneSteps({ id, request, steps, firstDelay, laterDelay }: Args) {
  const still = useStillMotion();
  const req = useTyper(55);
  const txt = useTyper(70);
  const [owner, setOwner] = useState(-1);
  const [step, setStep] = useState(-1);
  const [manual, setManual] = useState(false);
  const token = useRef(0);
  const touched = useRef(false);
  const hasRun = useRef(false);
  const { type: typeReq, stop: stopReq } = req;
  const { type: typeTxt, stop: stopTxt } = txt;

  const run = useCallback(async () => {
    const my = ++token.current;
    hasRun.current = true;
    setOwner(id);
    setManual(false);
    setStep(-1);
    await typeReq(request);
    if (my !== token.current) return;
    if (still) {
      setStep(0);
      setManual(true);
      return;
    }
    for (let s = 0; s < steps.length; s++) {
      setStep(s);
      await typeTxt(steps[s]);
      if (my !== token.current) return;
      if (s < steps.length - 1) await new Promise((r) => setTimeout(r, HOLD_MS));
      if (my !== token.current) return;
    }
  }, [id, request, steps, still, typeReq, typeTxt]);

  useEffect(() => {
    const tok = token;
    touched.current = false;
    const timer = setTimeout(() => {
      if (!touched.current) void run();
    }, still ? 0 : hasRun.current ? laterDelay : firstDelay);
    return () => {
      clearTimeout(timer);
      tok.current++;
      stopReq();
      stopTxt();
    };
  }, [run, still, firstDelay, laterDelay, stopReq, stopTxt]);

  const goTo = (s: number) => {
    touched.current = true;
    token.current++;
    stopReq();
    stopTxt();
    setOwner(id);
    setManual(true);
    setStep(s);
  };

  const mine = owner === id;
  return {
    goTo,
    started: mine,
    step: mine ? step : -1,
    request: mine ? (manual ? request : req.shown) : "",
    text: mine && step >= 0 ? (manual ? steps[step] : txt.shown) : "",
  };
}
