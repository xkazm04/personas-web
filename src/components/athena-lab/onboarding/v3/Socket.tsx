"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useTranslation } from "@/i18n/useTranslation";
import { ToolGlyph, type ToolId } from "../shared/ToolGlyph";
import type { Box, SocketState } from "./script";
import { T, at } from "./Board";

/**
 * A "Uses" slot on the card. Empty, it is a dashed drop target; when she
 * drops a tool in, the tile lands, a handshake arc spins for one beat, and it
 * settles connected with a drawn check — the same connect → connecting →
 * connected vocabulary the live section uses for Slack.
 */
export function Socket({
  box,
  tool,
  name,
  state,
  reduced,
}: {
  box: Box;
  tool: ToolId | null;
  name: string;
  state: SocketState;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const slack = t.athenaPage.onboarding.canvas.slack;
  const filled = tool !== null && state !== "empty";
  return (
    <span
      className={`absolute flex items-center gap-2 rounded-xl border px-3 ${T} ${filled ? "" : "border-dashed"}`}
      style={{
        ...at(box),
        borderColor: state === "connected" ? tint("emerald", 55) : filled ? tint("cyan", 55) : tint("cyan", 22),
        backgroundColor: filled ? tint("cyan", 7) : "transparent",
      }}
    >
      {filled && tool ? (
        <motion.span
          className="flex min-w-0 flex-1 items-center gap-2"
          initial={reduced ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: 0.45 }}
        >
          <ToolGlyph tool={tool} className="h-5 w-5" />
          <span className="font-medium text-foreground">{name}</span>
          <span className="ml-auto flex items-center" style={{ color: state === "connected" ? BRAND_VAR.emerald : BRAND_VAR.cyan }}>
            {state === "connecting" ? (
              <motion.svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                animate={reduced ? undefined : { rotate: 360 }}
                transition={reduced ? undefined : { duration: 0.9, repeat: Infinity, ease: "linear" }}
                aria-label={slack.connecting}
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.35" strokeWidth="3" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </motion.svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-label={slack.connected}>
                <motion.path
                  d="M5 12.5 10 17.5 19 7"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.42, ease: "easeOut" }}
                />
              </svg>
            )}
          </span>
        </motion.span>
      ) : (
        <span className="text-muted-dark">{t.athenaLab.onboarding.v3.dropHint}</span>
      )}
    </span>
  );
}
