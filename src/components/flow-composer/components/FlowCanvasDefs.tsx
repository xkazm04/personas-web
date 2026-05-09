"use client";

import { QUEUE_Y } from "../data";

export default function FlowCanvasDefs({
  evGlow,
  qGrad,
  qClip,
}: {
  evGlow: string;
  qGrad: string;
  qClip: string;
}) {
  return (
    <defs>
      <filter id={evGlow}>
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id={qGrad} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(6,182,212,0.0)" />
        <stop offset="15%" stopColor="rgba(6,182,212,0.1)" />
        <stop offset="50%" stopColor="rgba(168,85,247,0.08)" />
        <stop offset="85%" stopColor="rgba(6,182,212,0.1)" />
        <stop offset="100%" stopColor="rgba(6,182,212,0.0)" />
      </linearGradient>
      <clipPath id={qClip}>
        <rect x="5" y={QUEUE_Y - 4} width="90" height="8" rx="4" />
      </clipPath>
    </defs>
  );
}
