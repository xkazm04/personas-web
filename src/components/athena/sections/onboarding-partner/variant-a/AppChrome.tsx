"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { PANEL } from "@/components/athena/stage/athena-tokens";
import { Part } from "./modules/parts";
import { SCENE } from "./data";

/**
 * The stylized desktop app window "The Glide" plays inside — header with
 * search / bell / avatar cluster, icon sidebar with a usage meter, the main
 * canvas slot (CanvasScene + overlays stack there), and the footer rail slot.
 * Type floor: nothing in the illustration renders below text-base.
 *
 * The chrome COMPOSES at the top of every loop rather than existing whole at
 * tick 0: the header and sidebar seams draw themselves across, the nav items
 * walk down the rail, and the search chip, bell and avatar cluster settle in
 * behind them. `boot` changes on each loop (and on each re-entry), which is
 * what re-arms it — keyed on the small parts only, never on the frame, so the
 * canvas and Athena's avatar video underneath are never remounted.
 */

/** Window frame: header + sidebar + canvas (children overlay it) + footer. */
export function AppWindow({
  boot,
  reduced,
  children,
  footer,
}: {
  boot: number;
  reduced: boolean;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { t } = useTranslation();
  const ch = t.athenaPage.onboarding.chrome;
  const s = SCENE.chrome;
  const SearchIcon = s.searchIcon;
  const BellIcon = s.bellIcon;
  return (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${PANEL}`}>
      {/* Header bar */}
      <div className="relative flex shrink-0 items-center gap-3 px-4 py-2.5">
        <Seam boot={boot} reduced={reduced} axis="x" className="inset-x-0 bottom-0 h-px" />
        <Part key={boot} show reduced={reduced} className="flex items-center gap-1.5">
          {([0, 1, 2] as const).map((d) => (
            <span key={d} className="h-2.5 w-2.5 rounded-full bg-foreground/20" aria-hidden="true" />
          ))}
        </Part>
        <Part key={`${boot}-name`} show i={1} reduced={reduced} className="text-base font-semibold text-foreground">
          {ch.appName}
        </Part>
        <Part
          key={`${boot}-search`}
          show
          i={2}
          reduced={reduced}
          className="ml-auto hidden items-center gap-2 rounded-full border border-glass px-3 py-1 text-base text-muted-dark sm:flex"
        >
          <SearchIcon className="h-4 w-4" aria-hidden="true" />
          {ch.search}
        </Part>
        <Part key={`${boot}-bell`} show i={3} reduced={reduced} className="relative hidden text-muted-dark sm:block">
          <BellIcon className="h-4.5 w-4.5" aria-hidden="true" />
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            aria-hidden="true"
          />
        </Part>
        <Part key={`${boot}-avatars`} show i={4} reduced={reduced} className="hidden items-center -space-x-1.5 sm:flex">
          {([28, 16, 8] as const).map((a) => (
            <span
              key={a}
              className="h-5 w-5 rounded-full border border-glass-hover"
              style={{ backgroundColor: tint("cyan", a) }}
              aria-hidden="true"
            />
          ))}
        </Part>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar — icon nav + usage meter, words as short labels */}
        <nav className="relative hidden w-48 shrink-0 flex-col gap-1 p-3 md:flex">
          <Seam boot={boot} reduced={reduced} axis="y" className="inset-y-0 right-0 w-px" />
          {ch.nav.map((label, i) => {
            const active = i === s.navActive;
            const Icon = s.navIcons[i];
            return (
              <Part
                key={`${boot}-${label}`}
                show
                i={i}
                lead={0.16}
                reduced={reduced}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-base ${
                  active ? "text-foreground" : "text-muted-dark"
                }`}
                style={active ? { backgroundColor: tint("cyan", 10) } : undefined}
              >
                <Icon
                  className="h-4.5 w-4.5 shrink-0"
                  style={active ? { color: BRAND_VAR.cyan } : undefined}
                  aria-hidden="true"
                />
                {label}
              </Part>
            );
          })}
          {/* Usage meter — tiny progress bar micro-content */}
          <Part
            key={`${boot}-usage`}
            show
            i={ch.nav.length}
            lead={0.16}
            reduced={reduced}
            className="mt-auto flex flex-col gap-1.5 rounded-lg border border-glass px-2.5 py-2"
          >
            <span className="flex items-baseline justify-between gap-2 text-base text-muted-dark">
              {ch.usageLabel}
              <span className="font-mono text-foreground/70">{ch.usageValue}</span>
            </span>
            <span
              className="h-1 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: tint("cyan", 12) }}
              aria-hidden="true"
            >
              <motion.span
                className="block h-full origin-left rounded-full"
                style={{ width: `${s.usagePct}%`, backgroundColor: BRAND_VAR.cyan }}
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.9 }}
              />
            </span>
          </Part>
          <Part
            key={`${boot}-new`}
            show
            i={ch.nav.length + 1}
            lead={0.16}
            reduced={reduced}
            className="rounded-lg border border-glass px-2.5 py-1.5 text-center text-base text-foreground"
          >
            + {ch.newAgent}
          </Part>
        </nav>

        {/* Main canvas — targets + decor live here; overlays stack on top */}
        <div className="relative min-h-0 flex-1">{children}</div>
      </div>

      {/* Footer — progress rail + mono status line, inside the illustration */}
      <div className="relative flex shrink-0 items-center gap-4 px-4 py-2.5">
        <Seam boot={boot} reduced={reduced} axis="x" className="inset-x-0 top-0 h-px" />
        {footer}
      </div>
    </div>
  );
}

/** A frame seam that DRAWS itself instead of being there — the window
 *  assembling around the workspace at the top of each loop. */
function Seam({
  boot,
  reduced,
  axis,
  className,
}: {
  boot: number;
  reduced: boolean;
  axis: "x" | "y";
  className: string;
}) {
  return (
    <motion.span
      key={boot}
      className={`pointer-events-none absolute ${axis === "x" ? "origin-left" : "origin-top"} ${className}`}
      style={{ backgroundColor: "var(--border-glass)" }}
      initial={reduced ? false : { scaleX: axis === "x" ? 0 : 1, scaleY: axis === "y" ? 0 : 1 }}
      animate={{ scaleX: 1, scaleY: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.65, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
