"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { PANEL } from "@/components/athena/stage/athena-tokens";
import { Part } from "./modules/parts";
import { COPY } from "./data";

/**
 * The stylized app window the whole arc plays inside — header, a slim icon
 * rail (the desk needs its width for the work, not for a nav list), the canvas
 * slot everything is placed over, and the footer rail slot.
 * Type floor: nothing in the illustration renders below text-base.
 *
 * The chrome COMPOSES at the top of every loop rather than existing whole at
 * tick 0: the seams draw themselves across, the rail icons walk down, and the
 * search chip, bell and avatars settle in behind them. `boot` changes on each
 * loop and each re-entry, which is what re-arms it — keyed on the small parts
 * only, never on the frame, so the canvas and her avatar video underneath are
 * never remounted.
 */
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
  const ch = COPY.chrome;
  const SearchIcon = ch.searchIcon;
  const BellIcon = ch.bellIcon;
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
        <Part
          key={`${boot}-name`}
          show
          i={1}
          reduced={reduced}
          className="text-base font-semibold text-foreground"
        >
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
        <Part
          key={`${boot}-bell`}
          show
          i={3}
          reduced={reduced}
          className="relative hidden text-muted-dark sm:block"
        >
          <BellIcon className="h-4.5 w-4.5" aria-hidden="true" />
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            aria-hidden="true"
          />
        </Part>
        <Part
          key={`${boot}-avatars`}
          show
          i={4}
          reduced={reduced}
          className="hidden items-center -space-x-1.5 sm:flex"
        >
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
        {/* Slim icon rail — the desk gives its width to the work */}
        <nav className="relative hidden w-14 shrink-0 flex-col items-center gap-2 py-3 md:flex">
          <Seam boot={boot} reduced={reduced} axis="y" className="inset-y-0 right-0 w-px" />
          {ch.rail.map((Icon, i) => {
            const active = i === ch.railActive;
            return (
              <Part
                key={`${boot}-rail-${i}`}
                show
                i={i}
                lead={0.16}
                reduced={reduced}
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={active ? { backgroundColor: tint("cyan", 12) } : undefined}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${active ? "" : "text-muted-dark"}`}
                  style={active ? { color: BRAND_VAR.cyan } : undefined}
                  aria-hidden="true"
                />
              </Part>
            );
          })}
        </nav>

        {/* Main canvas — every module and overlay is placed over this box */}
        <div className="relative min-h-0 flex-1">{children}</div>
      </div>

      {/* Footer — the rail and the mono readout, inside the illustration */}
      <div className="relative flex shrink-0 items-center gap-4 px-4 py-2.5">
        <Seam boot={boot} reduced={reduced} axis="x" className="inset-x-0 top-0 h-px" />
        {footer}
      </div>
    </div>
  );
}

/** A frame seam that DRAWS itself instead of being there — the window
 *  assembling around the desk at the top of each loop. */
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
