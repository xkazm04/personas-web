"use client";

import { useId, useState, useSyncExternalStore, type ComponentType, type KeyboardEvent } from "react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

/**
 * Prototype switcher from the registry `/illustrate` skill: the current section
 * plus three illustration directions, one at a time. "current" is the first tab
 * and the default, so the page is unchanged until someone clicks. The choice is
 * mirrored to `?illustrate=<section>:<key>` so a variant can be linked in review.
 *
 * Throwaway by design: consolidation deletes this file and renders the winner.
 * Server and first client render are identical (current selected); the query is
 * read after mount, so hydration stays stable and a no-script reader sees the
 * current section.
 */
// The query is external state: read it the way the hash-driven showcase does, so the
// server and hydration render agree (null) and the real value lands on the next commit.
const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};
const readQuery = () => new URLSearchParams(window.location.search).get("illustrate");
const noQueryOnServer = () => null;

export interface IllustrationVariant<P> {
  key: string;
  label: string;
  hint: string;
  Component: ComponentType<P>;
}

export default function IllustrationSwitcher<P extends object>({
  section,
  variants,
  props,
  align = "center",
}: {
  section: string;
  variants: IllustrationVariant<P>[];
  props: P;
  align?: "center" | "start";
}) {
  const uid = useId().replace(/:/g, "");
  const [picked, setPicked] = useState<string | null>(null);
  const wanted = useSyncExternalStore(subscribe, readQuery, noQueryOnServer);
  const [sec, fromQuery] = (wanted ?? "").split(":");
  const linked = sec === section && variants.some((v) => v.key === fromQuery) ? fromQuery : null;
  // A click wins over the link; with neither, the current section shows.
  const active = picked ?? linked ?? variants[0].key;

  const select = (key: string) => {
    setPicked(key);
    const url = new URL(window.location.href);
    url.searchParams.set("illustrate", `${section}:${key}`);
    window.history.replaceState(null, "", url);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = variants.findIndex((v) => v.key === active);
    const n = (i + (e.key === "ArrowRight" ? 1 : variants.length - 1)) % variants.length;
    select(variants[n].key);
    document.getElementById(`${uid}-tab-${variants[n].key}`)?.focus();
    e.preventDefault();
  };

  const Active = (variants.find((v) => v.key === active) ?? variants[0]).Component;

  return (
    <div data-illustrate={section} className="relative">
      <div
        role="tablist"
        aria-label="Illustration variant"
        onKeyDown={onKey}
        className={`relative z-20 mx-auto mb-4 flex max-w-5xl flex-wrap gap-1 rounded-xl border border-glass bg-white/[0.02] p-1 ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        {variants.map((v) => {
          const on = v.key === active;
          return (
            <button
              key={v.key}
              id={`${uid}-tab-${v.key}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              data-illustrate-tab={v.key}
              onClick={() => select(v.key)}
              className={`rounded-lg px-3 py-1.5 text-left transition-colors duration-200 ${
                on ? "bg-white/[0.08] text-foreground" : "text-muted hover:bg-white/[0.04] hover:text-foreground/80"
              }`}
              style={on ? { boxShadow: `inset 0 -2px 0 ${BRAND_VAR.cyan}, 0 0 12px ${tint("cyan", 15)}` } : undefined}
            >
              <span className="block font-mono text-xs uppercase tracking-wider">{v.label}</span>
              <span className="block text-xs text-muted-dark">{v.hint}</span>
            </button>
          );
        })}
      </div>
      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`}>
        <Active {...props} />
      </div>
    </div>
  );
}
