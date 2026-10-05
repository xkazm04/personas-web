"use client";

import { useEffect, useEffectEvent, useRef, useState, type RefObject } from "react";
import { queueOf, type SimAgent } from "./model";

export type Attention = { type: "agent" | "team"; id: string } | null;

interface NavInput {
  scope: SimAgent[];
  scale: number;
  stageRef: RefObject<HTMLDivElement | null>;
  still: boolean;
  toast: (text: string) => void;
  nextToast: (i: number, n: number, a: SimAgent) => string;
  nobodyToast: string;
}

/**
 * The board's three levels (fleet, team, agent) and what is under attention.
 * Escape closes the top layer only and hands focus back to whatever opened it;
 * `N` walks the ranked needs-you queue from anywhere on the page.
 */
export function useBoardNav({ scope, scale, stageRef, still, toast, nextToast, nobodyToast }: NavInput) {
  const [teamOpen, setTeamOpen] = useState<string | null>(null);
  const [agentOpen, setAgentOpen] = useState<string | null>(null);
  const [att, setAtt] = useState<Attention>(null);
  const [nextIdx, setNextIdx] = useState(-1);
  const unattTimer = useRef(0);
  const teamOrigin = useRef<HTMLElement | null>(null);
  const agentOrigin = useRef<HTMLElement | null>(null);

  // A smaller fleet can drop what is open: close it rather than show a ghost.
  const [prevScale, setPrevScale] = useState(scale);
  if (scale !== prevScale) {
    setPrevScale(scale);
    setNextIdx(-1);
    if (agentOpen && !scope.some((a) => a.id === agentOpen)) setAgentOpen(null);
    if (teamOpen && !scope.some((a) => a.team === teamOpen)) setTeamOpen(null);
  }

  /** Focus the first selector that matches, once the layer has mounted. */
  const focusLater = (selectors: string[], delay: number) => {
    window.setTimeout(() => {
      for (const sel of selectors) {
        const el = stageRef.current?.querySelector<HTMLElement>(sel);
        if (el) {
          el.focus({ preventScroll: true });
          return;
        }
      }
    }, still ? 0 : delay);
  };

  const attend = (t: NonNullable<Attention>) => {
    window.clearTimeout(unattTimer.current);
    setAtt(t);
  };
  const unattend = () => {
    window.clearTimeout(unattTimer.current);
    unattTimer.current = window.setTimeout(() => setAtt(null), 160);
  };

  const openTeam = (id: string, origin?: HTMLElement | null) => {
    if (!scope.some((a) => a.team === id)) return;
    setAgentOpen(null);
    teamOrigin.current = origin ?? null;
    setTeamOpen(id);
    setAtt(null);
    focusLater(["[data-team-title]"], 420);
  };
  const closeTeam = (restore: boolean) => {
    setTeamOpen(null);
    setAtt(null);
    const o = teamOrigin.current;
    if (restore && o?.isConnected) o.focus({ preventScroll: true });
  };
  const openAgent = (id: string, origin?: HTMLElement | null) => {
    if (!scope.some((a) => a.id === id)) return;
    if (!agentOpen) agentOrigin.current = origin ?? (document.activeElement as HTMLElement | null);
    setAgentOpen(id);
    setAtt(null);
    focusLater(["[data-agent-act]", "[data-agent-title]"], 380);
  };
  const closeAgent = (restore: boolean) => {
    setAgentOpen(null);
    setAtt(null);
    const o = agentOrigin.current;
    if (restore && o?.isConnected) window.setTimeout(() => o.focus({ preventScroll: true }), 0);
  };
  const back = () => {
    if (agentOpen) closeAgent(true);
    else if (teamOpen) closeTeam(true);
  };

  const nextNeeds = () => {
    const q = queueOf(scope);
    if (!q.length) {
      toast(nobodyToast);
      return;
    }
    const i = (nextIdx + 1) % q.length;
    const a = q[i];
    setNextIdx(i);
    toast(nextToast(i, q.length, a));
    if (agentOpen) {
      setAgentOpen(a.id);
      return;
    }
    if (teamOpen && teamOpen !== a.team) setTeamOpen(null);
    const sel = teamOpen === a.team ? `[data-card="${a.id}"]` : `[data-tile="${a.id}"]`;
    focusLater([sel], teamOpen && teamOpen !== a.team ? 420 : 0);
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
    const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (e.key === "Escape" && (agentOpen || teamOpen)) {
      e.preventDefault();
      back();
    } else if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      nextNeeds();
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return {
    teamOpen, agentOpen, att,
    attend, unattend, openTeam, closeTeam, openAgent, closeAgent, back, nextNeeds,
  };
}

export type BoardNav = ReturnType<typeof useBoardNav>;
