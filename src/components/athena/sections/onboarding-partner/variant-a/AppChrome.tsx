"use client";

import { type ReactNode } from "react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { PANEL } from "@/components/athena/stage/athena-tokens";
import { COPY } from "./data";

/**
 * The stylized desktop app window "The Glide" plays inside — header with
 * search / bell / avatar cluster, icon sidebar with a usage meter, the main
 * canvas slot (CanvasScene + overlays stack there), and the footer rail
 * slot. Type floor: nothing in the illustration renders below text-base.
 */

/** Window frame: header + sidebar + canvas (children overlay it) + footer. */
export function AppWindow({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const ch = COPY.chrome;
  const SearchIcon = ch.searchIcon;
  const BellIcon = ch.bellIcon;
  return (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${PANEL}`}>
      {/* Header bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-glass px-4 py-2.5">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
        </span>
        <span className="text-base font-semibold text-foreground">{ch.appName}</span>
        <span className="ml-auto hidden items-center gap-2 rounded-full border border-glass px-3 py-1 text-base text-muted-dark sm:flex">
          <SearchIcon className="h-4 w-4" aria-hidden="true" />
          {ch.search}
        </span>
        <span className="relative hidden text-muted-dark sm:block" aria-hidden="true">
          <BellIcon className="h-4.5 w-4.5" />
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
          />
        </span>
        <AvatarCluster />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar — icon nav + usage meter, words as short labels */}
        <nav className="hidden w-48 shrink-0 flex-col gap-1 border-r border-glass p-3 md:flex">
          {ch.nav.map((item, i) => {
            const active = i === ch.navActive;
            const Icon = item.icon;
            return (
              <span
                key={item.label}
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
                {item.label}
              </span>
            );
          })}
          {/* Usage meter — tiny progress bar micro-content */}
          <span className="mt-auto flex flex-col gap-1.5 rounded-lg border border-glass px-2.5 py-2">
            <span className="flex items-baseline justify-between gap-2 text-base text-muted-dark">
              {ch.usageLabel}
              <span className="font-mono text-foreground/70">{ch.usageValue}</span>
            </span>
            <span className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: tint("cyan", 12) }} aria-hidden="true">
              <span className="block h-full rounded-full" style={{ width: `${ch.usagePct}%`, backgroundColor: BRAND_VAR.cyan }} />
            </span>
          </span>
          <span className="rounded-lg border border-glass px-2.5 py-1.5 text-center text-base text-foreground">
            + {ch.newAgent}
          </span>
        </nav>

        {/* Main canvas — targets + decor live here; overlays stack on top */}
        <div className="relative min-h-0 flex-1">{children}</div>
      </div>

      {/* Footer — progress rail + mono status line, inside the illustration */}
      <div className="flex shrink-0 items-center gap-4 border-t border-glass px-4 py-2.5">
        {footer}
      </div>
    </div>
  );
}

/** Overlapping teammate avatar dots — presence micro-content. */
function AvatarCluster() {
  return (
    <span className="hidden items-center -space-x-1.5 sm:flex" aria-hidden="true">
      {([28, 16, 8] as const).map((a) => (
        <span
          key={a}
          className="h-5 w-5 rounded-full border border-glass-hover"
          style={{ backgroundColor: tint("cyan", a) }}
        />
      ))}
    </span>
  );
}
