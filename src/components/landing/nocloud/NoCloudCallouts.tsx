"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

type Layer = 0 | 1 | 2 | 3;

/**
 * The three claims, each tied to one layer of the drawing. Hovering, focusing or
 * pressing a title highlights its layer; pressing again lets go. The buttons are
 * the keyboard path into the diagram, the text is its equivalent.
 */
export function useLayerFocus() {
  const [pinned, setPinned] = useState<Layer>(0);
  const [hover, setHover] = useState<Layer>(0);
  return {
    active: (hover || pinned) as Layer,
    setHover,
    toggle: (n: Layer) => setPinned((p) => (p === n ? 0 : n)),
  };
}

export default function NoCloudCallouts({ focus }: { focus: ReturnType<typeof useLayerFocus> }) {
  const { t } = useTranslation();
  const c = t.landingNext.nocloud.callouts;
  const rows = [
    { n: 1 as const, ...c.local },
    { n: 2 as const, ...c.free },
    { n: 3 as const, ...c.telemetry },
  ];
  return (
    <ol className="ln-callouts">
      {rows.map((r) => (
        <li
          key={r.n}
          className={focus.active === r.n ? "ln-on" : undefined}
          onPointerEnter={() => focus.setHover(r.n)}
          onPointerLeave={() => focus.setHover(0)}
        >
          <span className="ln-n" aria-hidden="true">{r.n}</span>
          <div>
            <h3>
              <button
                type="button"
                className="ln-callout-btn"
                aria-pressed={focus.active === r.n}
                onFocus={() => focus.setHover(r.n)}
                onBlur={() => focus.setHover(0)}
                onClick={() => focus.toggle(r.n)}
              >
                {r.title}
              </button>
            </h3>
            <p>{r.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
