"use client";

import { frame } from "./shared/Frame";
import { CATEGORY_KEYS, CategoryGlyph, catColor, catTint, type CategoryKey } from "./shared/categories";
import { H, W } from "./rings";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

/* V3's right column: the five kinds of memory as buttons. Picking one marks
 * its seeds on the rings and shows a real example of that kind. */

const { place, fs } = frame(W, H);
export const PANEL_X = 830;

export default function Panel({ sel, onSel }: { sel: CategoryKey | null; onSel: (k: CategoryKey | null) => void }) {
  const copy = featuresSectionsCopy.memory;
  return (
    <div className="absolute flex flex-col" style={{ ...place(PANEL_X, 104, 330), gap: "max(6px, calc(10 * 100cqw / 1200))" }}>
      <span className="font-mono font-semibold uppercase tracking-[0.16em] text-foreground/75" style={fs(15, 12)}>
        {copy.v3.legend}
      </span>
      {CATEGORY_KEYS.map((k) => {
        const on = sel === k;
        const name = copy.categories[k];
        return (
          <button
            key={k}
            type="button"
            aria-pressed={on}
            aria-label={copy.v3.show.replace("{category}", name)}
            onClick={() => onSel(on ? null : k)}
            className="flex items-center gap-3 rounded-xl border px-3 py-[0.45em] text-left transition-colors hover:border-glass-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
            style={{ ...fs(21, 16), borderColor: on ? catColor(k) : "var(--color-glass)", backgroundColor: on ? catTint(k, 12) : "transparent" }}
          >
            <svg viewBox="-16 -16 32 32" className="h-[1.5em] w-[1.5em] shrink-0" aria-hidden fill="none">
              <circle r={14} fill={catTint(k, 22)} stroke={catColor(k)} strokeWidth={2} />
              <CategoryGlyph k={k} size={16} width={1.8} />
            </svg>
            <span className="font-semibold" style={{ color: on ? catColor(k) : undefined }}>
              {name}
            </span>
          </button>
        );
      })}
      <p className="mt-1 min-h-[3.2em] leading-snug text-foreground/85" style={fs(20, 16)} aria-live="polite">
        {sel ? `“${copy.v3.examples[sel]}”` : copy.v3.hint}
      </p>
    </div>
  );
}
