"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Command as CommandIcon } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { ATTENTION_COLOR } from "../attention";
import { fill } from "./model";
import { buildItems, parseVerb, rankItems, type PaletteDeps, type PaletteItem } from "./palette";
import s from "./tiles.module.css";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deps: Omit<PaletteDeps, "verb">;
}

/**
 * ⌘K / Ctrl+K: one place to reach every agent, team and fleet action by
 * typing. Starting with a verb (pause, resume, run, cancel) turns the agent
 * results into that command, so "pause ir01" Enter pauses IR01.
 */
export default function CommandPalette({ open, onOpenChange, deps }: CommandPaletteProps) {
  const c = deps.copy;
  const p = c.palette;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  useFocusTrap({ active: open, containerRef: panelRef, initialFocusRef: inputRef });

  const { verb, rest } = parseVerb(query, { pause: c.cmd.pause, resume: c.cmd.resume, run: c.cmd.run, cancel: c.cmd.cancel });
  const items = open ? rankItems(buildItems({ ...deps, verb }), rest) : [];
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setActive(0);
  }
  const close = () => {
    setQuery("");
    onOpenChange(false);
  };
  const runItem = (it: PaletteItem | undefined) => {
    if (!it || it.disabled) return;
    close();
    it.run();
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey) && !e.altKey) {
      e.preventDefault();
      if (open) close();
      else onOpenChange(true);
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={close} aria-hidden />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={p.label} className={`${s.pop} relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-glass-hover bg-surface shadow-[0_30px_90px_rgb(0_0_0/0.45)]`}>
        <div className="flex items-center gap-3 border-b border-glass px-4">
          <CommandIcon aria-hidden className="h-4 w-4 shrink-0 text-muted-dark" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={items[active] ? `pal-${active}` : undefined}
            aria-label={p.placeholder}
            value={query}
            placeholder={p.placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(items.length - 1, i + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
              else if (e.key === "Enter") { e.preventDefault(); runItem(items[active]); }
              else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
            }}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-dark focus-visible:outline-none!"
          />
          <kbd className="rounded border border-glass-hover px-1.5 font-mono text-xs text-muted-dark">Esc</kbd>
        </div>
        <ul ref={listRef} id="palette-list" role="listbox" aria-label={p.label} className="max-h-[min(52vh,440px)] overflow-y-auto p-2">
          {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-dark">{fill(p.empty, { q: query })}</li>}
          {items.map((it, i) => {
            const header = i === 0 || items[i - 1].group !== it.group ? p.groups[it.group] : null;
            return (
              <li key={it.id} role="none">
                {header && <div className="px-3 pb-1 pt-2.5 text-xs font-semibold uppercase tracking-wider text-muted-dark" aria-hidden>{header}</div>}
                <div
                  id={`pal-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={it.disabled || undefined}
                  data-index={i}
                  onMouseMove={() => setActive(i)}
                  onClick={() => runItem(it)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${i === active ? "bg-foreground/[0.08]" : ""} ${it.disabled ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {it.tone && <i aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: ATTENTION_COLOR[it.tone] }} />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{it.label}</span>
                    {it.meta && <span className="block truncate text-xs text-muted-dark">{it.meta}</span>}
                  </span>
                  {it.kbd && <kbd className="rounded border border-glass-hover px-1.5 font-mono text-xs text-muted-dark">{it.kbd}</kbd>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-glass px-4 py-2 text-xs text-muted-dark">{p.footer}</div>
      </div>
    </div>
  );
}
