"use client";

import { AppWindow, Check, Clock, FlaskConical, KeyRound, Mail } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Mark } from "./GetStarted.shared";
import { Block, STATIONS, T, type StationKey } from "./GetStarted.setup-map.parts";
import type { SetupWords } from "./GetStarted.setup-map";

/* The station drawings of the "setup-map" illustration. */

/** What one step leaves on your computer. */
export function Station({ k, w: WORDS }: { k: StationKey; w: SetupWords }) {
  const { x, y } = STATIONS[k].box;
  switch (k) {
    case "install":
      return (
        <Block box={STATIONS.install.box} brand="cyan">
          <rect x={x + 20} y={y + 32} width={46} height={46} rx={12} fill={tint("cyan", 22)} />
          <AppWindow x={x + 31} y={y + 43} width={24} height={24} color={BRAND_VAR.cyan} strokeWidth={2} />
          <T x={x + 78} y={y + 62} size={19} weight={700}>{WORDS.personas}</T>
        </Block>
      );
    case "connect":
      return (
        <Block box={STATIONS.connect.box} brand="cyan">
          <T x={x + 18} y={y + 30} size={17} weight={700}>{WORDS.connections}</T>
          <g className="text-foreground" opacity={0.88}>
            <Mark name="gmail" x={x + 32} y={y + 57} size={22} />
            <Mark name="slack" x={x + 70} y={y + 57} size={22} />
          </g>
          <KeyRound x={x + 18} y={y + 78} width={18} height={18} color={BRAND_VAR.cyan} strokeWidth={2} />
          <T x={x + 42} y={y + 93} size={15} weight={600} op={0.8}>{WORDS.keychain}</T>
        </Block>
      );
    case "create":
      return (
        <Block box={STATIONS.create.box} brand="emerald">
          <Mail x={x + 16} y={y + 16} width={20} height={20} color={BRAND_VAR.emerald} strokeWidth={2} />
          <T x={x + 16} y={y + 60} size={16} weight={700}>{WORDS.agent}</T>
          <Clock x={x + 16} y={y + 76} width={18} height={18} color={BRAND_VAR.emerald} strokeWidth={2} />
          <g className="text-foreground" opacity={0.8}>
            <Mark name="gmail" x={x + 54} y={y + 85} size={17} />
            <Mark name="slack" x={x + 82} y={y + 85} size={17} />
          </g>
        </Block>
      );
    case "run":
      return (
        <Block box={STATIONS.run.box} brand="emerald">
          <Clock x={x + 18} y={y + 16} width={20} height={20} color={BRAND_VAR.emerald} strokeWidth={2} />
          <T x={x + 46} y={y + 32} size={17} weight={700}>{WORDS.schedule}</T>
          {[0, 1].map((i) => (
            <g key={i}>
              <rect x={x + 14} y={y + 50 + i * 40} width={182} height={32} rx={8} fill="var(--background)" fillOpacity={0.6} />
              <Check x={x + 24} y={y + 58 + i * 40} width={16} height={16} color={BRAND_VAR.emerald} strokeWidth={3} />
              <T x={x + 48} y={y + 71 + i * 40} size={15} weight={600} op={0.85}>{WORDS.completed}</T>
            </g>
          ))}
        </Block>
      );
    case "improve":
      return (
        <Block box={STATIONS.improve.box} brand="purple">
          <FlaskConical x={x + 18} y={y + 16} width={20} height={20} color={BRAND_VAR.purple} strokeWidth={2} />
          <T x={x + 46} y={y + 32} size={17} weight={700}>{WORDS.lab}</T>
          <T x={x + 24} y={y + 74} size={15} weight={600} op={0.6}>{WORDS.v1}</T>
          <rect x={x + 14} y={y + 88} width={162} height={32} rx={8} fill={tint("purple", 14)} />
          <T x={x + 24} y={y + 109} size={15} weight={700}>{WORDS.v2}</T>
          <T x={x + 164} y={y + 109} size={15} weight={700} anchor="end" tone="text-brand-purple" op={1}>{WORDS.active}</T>
        </Block>
      );
  }
}
