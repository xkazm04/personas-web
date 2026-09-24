"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { KeyRound, Lock, LockOpen } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

/* Colour roles: emerald = sealed, amber = open. Nothing else in the art uses them. */
export const SEAL = "emerald" as const;
export const OPEN = "amber" as const;

type Row = { icon: string | null; color: string | null; name: number; type: number; used: number };

/* Three real connectors as brand marks (no names), three plain keys as in the app. */
export const ROWS: Row[] = [
  { icon: "/icons/connectors/github.svg", color: "var(--foreground)", name: 46, type: 18, used: 10 },
  { icon: "/icons/connectors/slack.svg", color: "#E01E5A", name: 38, type: 22, used: 14 },
  { icon: "/icons/connectors/gmail.svg", color: "#EA4335", name: 52, type: 16, used: 8 },
  { icon: null, color: null, name: 34, type: 20, used: 12 },
  { icon: null, color: null, name: 42, type: 14, used: 10 },
  { icon: null, color: null, name: 30, type: 24, used: 16 },
];

const START = 0.08;
const STEP = 0.115;
export const SPAN = 0.09;
/** Progress window in which row i seals (and its ring segment lights). */
export const sealWindow = (i: number): [number, number] => [START + i * STEP, START + i * STEP + SPAN];

function BrandMark({ src, color }: { src: string; color: string }) {
  return (
    <span
      aria-hidden
      className="block h-4 w-4"
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function CredentialRow({ row, i, p }: { row: Row; i: number; p: MotionValue<number> }) {
  const [a, b] = sealWindow(i);
  const sealed = useTransform(p, [a, b], [0, 1]);
  const plain = useTransform(sealed, [0, 1], [1, 0]);
  const lockScale = useTransform(p, [a, a + SPAN * 0.6, b], [0.5, 1.25, 1]);
  const flash = useTransform(p, [a, a + SPAN * 0.5, b + 0.05], [0, 1, 0]);
  const cipherX = useTransform(sealed, [0, 1], [-10, 0]);

  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-glass bg-white/[0.02] px-3 py-2.5 sm:gap-4 sm:px-4">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: flash, background: `linear-gradient(90deg, ${tint(SEAL, 16)}, transparent 70%)` }}
      />
      <span
        aria-hidden
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
          row.color ? "" : "border-glass bg-foreground/[0.05]"
        }`}
        style={
          row.color
            ? {
                borderColor: `color-mix(in srgb, ${row.color} 30%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${row.color} 10%, transparent)`,
              }
            : undefined
        }
      >
        {row.icon && row.color ? (
          <BrandMark src={row.icon} color={row.color} />
        ) : (
          <KeyRound className="h-4 w-4 text-foreground/60" />
        )}
      </span>

      {/* name: a plaintext bar that dissolves into a dot cipher */}
      <span aria-hidden className="relative h-2.5 flex-1">
        <span className="absolute inset-y-0 left-0 block" style={{ width: `${row.name * 1.6}%` }}>
          <motion.span className="absolute inset-0 block rounded-full bg-foreground/30" style={{ opacity: plain }} />
          <motion.span
            className="absolute inset-0 block"
            style={{
              opacity: sealed,
              x: cipherX,
              backgroundImage: `radial-gradient(circle, ${tint(SEAL, 70)} 1.6px, transparent 2.2px)`,
              backgroundSize: "9px 10px",
              backgroundPosition: "0 center",
              backgroundRepeat: "repeat-x",
            }}
          />
        </span>
      </span>

      {/* type, health and last-used columns as skeleton marks, like the real list */}
      <span
        aria-hidden
        className="hidden h-2 shrink-0 rounded-full bg-foreground/10 sm:block"
        style={{ width: `${row.type * 4}px` }}
      />
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-foreground/25" />
      <span
        aria-hidden
        className="hidden h-2 shrink-0 rounded-full bg-foreground/10 md:block"
        style={{ width: `${row.used * 4}px` }}
      />

      {/* lock: open (amber) gives way to closed (emerald) */}
      <span aria-hidden className="relative flex h-8 w-8 shrink-0 items-center justify-center">
        <motion.span
          className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{ opacity: plain, backgroundColor: tint(OPEN, 12) }}
        >
          <LockOpen className="h-4 w-4" style={{ color: BRAND_VAR.amber }} />
        </motion.span>
        <motion.span
          className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{ opacity: sealed, scale: lockScale, backgroundColor: tint(SEAL, 16) }}
        >
          <Lock className="h-4 w-4" style={{ color: BRAND_VAR.emerald }} />
        </motion.span>
      </span>
    </div>
  );
}
