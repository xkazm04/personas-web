"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ARCHITECTURE_LAYERS, type ArchitectureLayer } from "@/data/security";

const LAYER_DETAILS: Record<string, string> = {
  "Your AI Provider":
    "Direct, encrypted API calls with no relay or proxy — your keys, your account, your rate limits.",
  "Personas Engine":
    "Multi-agent orchestration, healing, scheduling, and tracing — everything runs as a local process.",
  "Encrypted Vault":
    "AES-256-GCM with OS-native keyring integration — DPAPI on Windows, Keychain on macOS, libsecret on Linux.",
  "Your Machine":
    "Full control over hardware, network policies, and OS security — air-gap capable with local LLMs.",
};

const TOTAL = ARCHITECTURE_LAYERS.length;

function PulseConnector({
  index,
  reducedMotion,
}: {
  index: number;
  reducedMotion: boolean | null;
}) {
  const delay = (TOTAL - index) * 0.4;

  return (
    <div className="mx-auto flex h-10 w-4 items-center justify-center">
      <svg
        width="2"
        height="40"
        viewBox="0 0 2 40"
        fill="none"
        aria-hidden="true"
        className="block"
      >
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="40"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        {!reducedMotion && (
          <>
            <defs>
              <linearGradient
                id={`arch-pulse-${index}`}
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.6" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect
              x="0"
              y="0"
              width="2"
              height="10"
              fill={`url(#arch-pulse-${index})`}
              rx="1"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 40;0 -10"
                dur="3s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.1;0.9;1"
                dur="3s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </rect>
          </>
        )}
      </svg>
    </div>
  );
}

function LayerCard({
  layer,
  index,
  reducedMotion,
}: {
  layer: ArchitectureLayer;
  index: number;
  reducedMotion: boolean | null;
}) {
  const [hovered, setHovered] = useState(false);
  const detail = LAYER_DETAILS[layer.name];

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-default rounded-xl border bg-white/[0.02] px-6 py-5 backdrop-blur-sm transition-colors duration-200"
      style={{ borderColor: hovered ? `${layer.color}40` : `${layer.color}20` }}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <div
            className="h-3 w-3 rounded-full transition-shadow duration-200"
            style={{
              backgroundColor: layer.color,
              boxShadow: hovered ? `0 0 12px ${layer.color}60` : "none",
            }}
          />
        </div>
        <div className="min-w-0">
          <h4 className="text-base font-semibold" style={{ color: layer.color }}>
            {layer.name}
          </h4>
          <p className="mt-0.5 text-sm text-muted">{layer.description}</p>
        </div>
      </div>
      <AnimatePresence>
        {hovered && detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-3 pl-7 text-xs text-muted/70">{detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ArchitectureFlow() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-2xl">
      {ARCHITECTURE_LAYERS.map((layer, i) => (
        <div key={layer.name}>
          {i > 0 && <PulseConnector index={i} reducedMotion={reducedMotion} />}
          <LayerCard layer={layer} index={i} reducedMotion={reducedMotion} />
        </div>
      ))}
    </div>
  );
}
