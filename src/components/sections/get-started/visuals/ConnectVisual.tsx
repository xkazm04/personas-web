"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { VisualProps } from "./types";

const CONNECTORS = [
  { name: "Slack", src: "/icons/connectors/slack.svg" },
  { name: "GitHub", src: "/icons/connectors/github.svg" },
  { name: "Gmail", src: "/icons/connectors/gmail.svg" },
  { name: "Notion", src: "/icons/connectors/notion.svg" },
  { name: "Jira", src: "/icons/connectors/jira.svg" },
  { name: "Drive", src: "/icons/connectors/google.svg" },
];

export function ConnectVisual({ brand }: VisualProps) {
  const color = BRAND_VAR[brand];
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div
        className="mx-auto flex items-center gap-2 rounded-full border px-4 py-2"
        style={{
          borderColor: "var(--border-glass-hover)",
          backgroundColor: "rgba(var(--surface-overlay), 0.02)",
        }}
      >
        <ShieldCheck className="h-4 w-4" style={{ color }} />
        <span className="text-base font-mono uppercase tracking-wider text-foreground/80">
          Credential Vault · AES-256
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {CONNECTORS.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 220 }}
            className="flex flex-col items-center gap-2 rounded-xl border p-3"
            style={{
              borderColor: "var(--border-glass)",
              backgroundColor: "rgba(var(--surface-overlay), 0.02)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.src}
              alt=""
              className="h-7 w-7 object-contain [filter:brightness(0)_invert(1)]"
            />
            <span className="text-base text-foreground/70">{c.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
