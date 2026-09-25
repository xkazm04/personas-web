"use client";

import { useRef, type CSSProperties } from "react";
import { Laptop, Sparkles, SquareTerminal } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { GetStartedIntro, Mark, ReplayButton, usePlayOnce } from "./GetStarted.shared";
import { Station } from "./GetStarted.setup-map.stations";
import SetupMapPhone from "./GetStarted.setup-map.phone";
import {
  ARROWS, Block, CLAUDE_CODE, Draw, Lit, OUTBOUND, OUTSIDE, OUT_AT, Pin, REGION, STATIONS, T, VIEW_H, VIEW_W,
  type StationKey,
} from "./GetStarted.setup-map.parts";

/* /illustrate r3 variant "setup-map" (spatial): what each of the five steps puts on
 * your computer, and the only lines that leave it - the agent to the apps you
 * connected, Claude Code to Claude. Stations light in step order, then the lines draw. */

export const WORDS = {
  lede: "Each step puts one piece in place on your own computer. Your agent then runs there, reaching Claude through your Claude Code plan and the apps you connected.",
  artLabel:
    "Your computer holds five numbered pieces: 1 Install, the Personas app; 2 Connect, Connections with Gmail and Slack keys in the OS keychain; 3 Create, the Email Morning Digest agent; 4 Run, a daily 08:00 schedule with completed runs; 5 Improve, the Lab with version 2 active. Claude Code, signed in, is on your computer too. Lines leave the computer only to Gmail, Slack and Claude.",
  replay: "Replay the animation",
  region: "Your computer",
  verbs: { install: "Install", connect: "Connect", create: "Create", run: "Run", improve: "Improve" },
  personas: "Personas",
  connections: "Connections",
  keychain: "OS keychain",
  agent: "Email Morning Digest",
  schedule: "Daily 08:00",
  completed: "Completed",
  lab: "Lab",
  v1: "v1",
  v2: "v2",
  active: "Active",
  claudeCode: "Claude Code",
  signedIn: "signed in",
  claude: "Claude",
  gmail: "Gmail",
  slack: "Slack",
} as const;

const DURATION = 3.4;
const ORDER: StationKey[] = ["install", "connect", "create", "run", "improve"];

export default function GetStartedSetupMap() {
  const ref = useRef<HTMLDivElement>(null);
  const { p, play, still } = usePlayOnce(ref, DURATION);
  const S = STATIONS;
  const cyan = BRAND_VAR.cyan;

  return (
    <SectionWrapper fit="fill" aria-labelledby="get-started-heading">
      <GetStartedIntro lede={WORDS.lede} />
      <div data-stage-slot>
        <div ref={ref} data-stage-art className="relative mx-auto mt-8 hidden w-full md:block" style={{ "--art-ar": (VIEW_W + 32) / (VIEW_H + 32) } as CSSProperties}>
          <div data-illustrate-art role="img" aria-label={WORDS.artLabel} className="relative mx-auto w-full max-w-[960px] rounded-2xl border border-glass bg-white/[0.02] p-4">
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" aria-hidden fill="none">
              <defs>
                <marker id="gs-map-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill={cyan} />
                </marker>
              </defs>

              {/* Your computer */}
              <rect x={REGION.x} y={REGION.y} width={REGION.w} height={REGION.h} rx={24} fill={tint("cyan", 4)} stroke={cyan} strokeOpacity={0.45} strokeWidth={2} />
              <Laptop x={14} y={4} width={20} height={20} color={cyan} strokeWidth={2} />
              <T x={42} y={21} size={18} weight={700} tone="text-brand-cyan" op={1}>{WORDS.region}</T>

              {/* Already there: Claude Code, signed in */}
              <Block box={CLAUDE_CODE} brand={null}>
                <SquareTerminal x={CLAUDE_CODE.x + 18} y={CLAUDE_CODE.y + 20} width={22} height={22} color={BRAND_VAR.amber} strokeWidth={2} />
                <T x={CLAUDE_CODE.x + 50} y={CLAUDE_CODE.y + 37} size={17} weight={700}>{WORDS.claudeCode}</T>
                <T x={CLAUDE_CODE.x + 50} y={CLAUDE_CODE.y + 62} size={15} weight={500} op={0.72}>{WORDS.signedIn}</T>
              </Block>
              <Draw p={p} at={S.create.at} d={`M 607 196 L 607 ${CLAUDE_CODE.y - 4}`} color={BRAND_VAR.amber} />

              {ARROWS.map((a) => (
                <Draw key={a.d} p={p} at={a.at} d={a.d} color={cyan} head />
              ))}

              {ORDER.map((k) => (
                <Lit key={k} p={p} at={S[k].at}>
                  <Pin box={S[k].box} n={S[k].n} verb={WORDS.verbs[k]} />
                  <Station k={k} w={WORDS} />
                </Lit>
              ))}

              {/* The only lines that leave your computer */}
              {OUTBOUND.map((o, i) => (
                <Draw key={o.d} p={p} at={OUT_AT + i * 0.04} d={o.d} color={BRAND_VAR[o.brand]} />
              ))}
              {(["gmail", "slack"] as const).map((k) => (
                <g key={k}>
                  <rect x={OUTSIDE[k].x - 28} y={OUTSIDE[k].y - 24} width={56} height={48} rx={12} fill="var(--background)" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} className="text-foreground" />
                  <g className="text-foreground" opacity={0.88}>
                    <Mark name={k} x={OUTSIDE[k].x} y={OUTSIDE[k].y} size={24} />
                  </g>
                  <T x={OUTSIDE[k].x + 38} y={OUTSIDE[k].y + 6} size={16}>{WORDS[k]}</T>
                </g>
              ))}
              <rect x={OUTSIDE.claude.x} y={OUTSIDE.claude.y} width={OUTSIDE.claude.w} height={OUTSIDE.claude.h} rx={14} fill={tint("amber", 10)} stroke={BRAND_VAR.amber} strokeOpacity={0.6} strokeWidth={1.6} />
              <Sparkles x={OUTSIDE.claude.x + 16} y={OUTSIDE.claude.y + 20} width={24} height={24} color={BRAND_VAR.amber} strokeWidth={2} />
              <T x={OUTSIDE.claude.x + 48} y={OUTSIDE.claude.y + 39} size={18} weight={700}>{WORDS.claude}</T>
            </svg>
            <ReplayButton onClick={play} disabled={still} label={WORDS.replay} />
          </div>
        </div>
        <SetupMapPhone w={WORDS} />
      </div>
    </SectionWrapper>
  );
}

export type SetupWords = typeof WORDS;
