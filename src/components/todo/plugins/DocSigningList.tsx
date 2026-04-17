"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  Loader2,
  KeyRound,
  Clock,
  type LucideIcon,
} from "lucide-react";

/* ── Doc Signing · polished list view ── */

interface SignedDoc {
  id: string;
  name: string;
  by: string;
  signedAt: string;
  status: "verified" | "pending";
  sizeKb: number;
  algo: string;
}

const DOCS: SignedDoc[] = [
  {
    id: "1",
    name: "contract-Q3-2026.pdf",
    by: "Alex Kim",
    signedAt: "2026-04-12 09:14",
    status: "verified",
    sizeKb: 412,
    algo: "Ed25519",
  },
  {
    id: "2",
    name: "nda-candidate-14.pdf",
    by: "Jamie Park",
    signedAt: "2026-04-11 16:41",
    status: "verified",
    sizeKb: 188,
    algo: "Ed25519",
  },
  {
    id: "3",
    name: "board-resolution.docx",
    by: "CEO",
    signedAt: "2026-04-11 11:02",
    status: "verified",
    sizeKb: 94,
    algo: "Ed25519",
  },
  {
    id: "4",
    name: "partner-agreement.pdf",
    by: "Legal",
    signedAt: "just now",
    status: "pending",
    sizeKb: 678,
    algo: "Ed25519",
  },
];

const METRICS: { icon: LucideIcon; label: string; value: string; color: string }[] = [
  { icon: ShieldCheck, label: "Verified", value: "147", color: "#34d399" },
  { icon: Clock, label: "Pending", value: "1", color: "#fbbf24" },
  { icon: KeyRound, label: "Keys", value: "3", color: "#06b6d4" },
];

/* ── Document card with hover lift + status shimmer ── */

function DocCard({ doc, delay }: { doc: SignedDoc; delay: number }) {
  const isVerified = doc.status === "verified";
  const accent = isVerified ? "#34d399" : "#fbbf24";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -2, scale: 1.005 }}
      className="group relative overflow-hidden rounded-xl border transition-all duration-300"
      style={{
        borderColor: `${accent}30`,
        backgroundImage: `linear-gradient(135deg, ${accent}0a 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.01) 100%)`,
      }}
    >
      {/* Accent rail */}
      <div
        className="absolute left-0 inset-y-0 w-1"
        style={{
          background: `linear-gradient(180deg, ${accent}cc, ${accent}22)`,
          boxShadow: `0 0 16px ${accent}60`,
        }}
      />

      {/* Hover sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${accent}18, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center gap-3 px-4 py-3.5">
        {/* Icon tile */}
        <motion.div
          whileHover={{ rotate: -3, scale: 1.05 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${accent}15`,
            boxShadow: `0 0 18px ${accent}22`,
          }}
        >
          <FileText className="h-5 w-5" style={{ color: accent }} />
        </motion.div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="text-base font-mono font-semibold text-foreground truncate">
            {doc.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-base font-mono text-foreground/60">
            <span>{doc.by}</span>
            <span>·</span>
            <span>{doc.sizeKb} KB</span>
            <span>·</span>
            <span>{doc.algo}</span>
          </div>
        </div>

        {/* Timestamp + status */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-base font-mono text-foreground/60">
            {doc.signedAt}
          </span>
          {isVerified ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: delay + 0.2, type: "spring", stiffness: 320 }}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5"
              style={{
                borderColor: `${accent}50`,
                backgroundColor: `${accent}15`,
              }}
            >
              <ShieldCheck className="h-4 w-4" style={{ color: accent }} />
              <span
                className="text-base font-mono font-bold uppercase tracking-widest"
                style={{ color: accent }}
              >
                verified
              </span>
            </motion.div>
          ) : (
            <div
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5"
              style={{
                borderColor: `${accent}50`,
                backgroundColor: `${accent}15`,
              }}
            >
              <Loader2
                className="h-4 w-4 animate-spin"
                style={{ color: accent }}
              />
              <span
                className="text-base font-mono font-bold uppercase tracking-widest"
                style={{ color: accent }}
              >
                signing…
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Live metric with pulsing count ── */

function MetricTile({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="rounded-lg border px-3 py-2.5"
      style={{
        borderColor: `${color}30`,
        backgroundColor: `${color}08`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-4 w-4" style={{ color }} />
        <span
          className="text-base font-mono uppercase tracking-widest"
          style={{ color: `${color}cc` }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-2xl font-mono font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
    </motion.div>
  );
}

/* ── Section body ────────────────────────────────────────────────── */

export default function DocSigningList() {
  const reduced = useReducedMotion() ?? false;
  const [shimmerIdx, setShimmerIdx] = useState(0);

  /* Cycle a subtle spotlight across the doc list every few seconds */
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setShimmerIdx((i) => (i + 1) % DOCS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="p-5 grid md:grid-cols-[1fr_220px] gap-4">
      {/* Document list */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-base font-mono uppercase tracking-widest text-foreground/65">
          <FileText className="h-4 w-4" />
          Signed documents · 4 of 148
        </div>
        <div className="space-y-2">
          {DOCS.map((doc, i) => (
            <div
              key={doc.id}
              className="relative"
              style={{
                filter:
                  !reduced && i === shimmerIdx
                    ? "brightness(1.06)"
                    : undefined,
                transition: "filter 1.4s ease-out",
              }}
            >
              <DocCard doc={doc} delay={i * 0.08} />
            </div>
          ))}
        </div>
      </div>

      {/* Side panel — fingerprint + metrics */}
      <div className="space-y-3">
        {/* Key fingerprint card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-xl border border-emerald-400/30 overflow-hidden p-4"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(52,211,153,0.12), transparent 60%), linear-gradient(135deg, rgba(52,211,153,0.08), rgba(6,182,212,0.04))",
          }}
        >
          {/* Animated key icon */}
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 3,
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20"
            >
              <KeyRound className="h-4 w-4 text-emerald-300" />
            </motion.div>
            <span className="text-base font-mono uppercase tracking-widest text-emerald-300/90 font-bold">
              Fingerprint
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="fp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-base text-emerald-200 leading-relaxed break-all"
            >
              sha256:
              <br />
              9f2a·3c81·7d4e·6b02
              <br />
              4e8f·a1d9·c5b7·2e03
            </motion.div>
          </AnimatePresence>

          <div className="mt-3 pt-3 border-t border-emerald-400/15 text-base font-mono text-foreground/65 leading-relaxed">
            Ed25519 key stored in OS keyring — never leaves the device.
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          {METRICS.map((m, i) => (
            <MetricTile
              key={m.label}
              icon={m.icon}
              label={m.label}
              value={m.value}
              color={m.color}
              delay={0.4 + i * 0.08}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
