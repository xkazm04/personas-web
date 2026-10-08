"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { Search, X } from "lucide-react";
import type { BoardCopy } from "./copy";
import { fill, plural, type SimAgent } from "./model";

interface FindBoxProps {
  query: string;
  onQuery: (q: string) => void;
  /** Agents in focus, in the field's reading order (the first is what Enter opens). */
  matches: readonly SimAgent[];
  /** A search or pile filter is on. */
  focusing: boolean;
  onOpen: (id: string, origin: HTMLElement | null) => void;
  onClear: () => void;
  copy: BoardCopy;
}

/**
 * Find an agent: `/` jumps here from anywhere on the board. Every word must
 * match the callsign, name, team, task or state; the field dims the rest.
 * Enter opens the first match, Escape clears, then leaves.
 */
export default function FindBox({ query, onQuery, matches, focusing, onOpen, onClear, copy: c }: FindBoxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key !== "/" || e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
    const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || document.querySelector('[aria-modal="true"]')) return;
    e.preventDefault();
    ref.current?.focus();
    ref.current?.select();
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const first = query.trim() ? matches[0] : undefined;
  const count = focusing ? (matches.length ? fill(plural(matches.length, c.find.matchesOne, c.find.matches), { n: matches.length }) : c.find.none) : null;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <label className="relative flex items-center">
        <span className="sr-only">{c.find.label}</span>
        <Search aria-hidden className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-muted-dark" />
        <input
          ref={ref}
          type="search"
          value={query}
          placeholder={c.find.placeholder}
          aria-describedby="find-status"
          data-find
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && first) {
              e.preventDefault();
              onOpen(first.id, e.currentTarget);
            } else if (e.key === "Escape") {
              e.preventDefault();
              if (query) onQuery("");
              else e.currentTarget.blur();
            }
          }}
          className="h-7 w-[clamp(9rem,12vw,14rem)] rounded-lg bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] pl-7 pr-7 text-sm text-foreground shadow-[inset_0_0_0_1px_var(--border-glass)] placeholder:text-muted-dark focus:outline-none focus-visible:shadow-[inset_0_0_0_1.5px_var(--brand-cyan)] [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd aria-hidden className={`pointer-events-none absolute right-2 rounded border border-glass-hover px-1 font-mono text-xs text-muted-dark ${query ? "hidden" : ""}`}>/</kbd>
      </label>
      <span id="find-status" role="status" className="whitespace-nowrap text-xs tabular-nums text-muted-dark" title={first ? fill(c.find.enterHint, { callsign: first.callsign }) : undefined}>
        {count}
      </span>
      {focusing && (
        <button type="button" onClick={onClear} aria-label={c.find.clear} title={c.find.clear} className="grid h-6 w-6 place-items-center rounded-md text-muted-dark hover:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground">
          <X aria-hidden className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
