"use client";

import { Modal } from "@/components/dashboard/Modal";
import type { BoardCopy } from "./copy";

interface ShortcutMapProps {
  open: boolean;
  onClose: () => void;
  copy: BoardCopy;
}

type Row = [keys: string[], label: keyof BoardCopy["keys"]["items"]];

const GROUPS: [keyof BoardCopy["keys"]["groups"], Row[]][] = [
  ["move", [[["⌘K", "Ctrl K"], "palette"], [["/"], "find"], [["N"], "next"], [["J", "K"], "step"], [["Esc"], "back"], [["?"], "keys"]]],
  ["act", [[["T"], "triage"], [["L"], "layout"], [["E"], "activity"]]],
  ["triage", [[["A"], "approve"], [["B"], "sendBack"], [["R"], "retry"], [["P"], "pause"], [["1–4"], "quick"], [["Enter"], "send"], [["S", "→"], "skip"], [["C"], "console"], [["G"], "byQuestion"], [["Space"], "member"], [["W"], "walk"]]],
];

const kbd = "min-w-6 rounded border border-glass-hover px-1.5 py-0.5 text-center font-mono text-xs text-foreground";

/** Every key the board answers to, in one place (`?`). */
export default function ShortcutMap({ open, onClose, copy: c }: ShortcutMapProps) {
  return (
    <Modal open={open} onClose={onClose} title={c.keys.title} ariaLabel={c.keys.title} maxWidth="max-w-2xl">
      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {[GROUPS.slice(0, 2), GROUPS.slice(2)].map((column, ci) => (
          <div key={ci} className="space-y-6">
            {column.map(([g, rows]) => (
              <section key={g}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-dark">{c.keys.groups[g]}</h3>
                <dl className="space-y-2">
                  {rows.map(([keys, label]) => (
                    <div key={label} className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-foreground">{c.keys.items[label]}</dt>
                      <dd className="flex shrink-0 items-center gap-1">
                        {keys.map((k, i) => (
                          <span key={k} className="flex items-center gap-1">
                            {i > 0 && <span className="text-xs text-muted-dark">/</span>}
                            <kbd className={kbd}>{k}</kbd>
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}
