"use client";

import { Fragment } from "react";
import { ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { frame } from "../shared/Shell";
import { LEVEL_LAYERS } from "./levels";
import { H, PATH_Y, W } from "./geometry";

const f = frame(W, H);

/**
 * The zoom path: the four levels as a clickable trail (task -> computer), with
 * zoom in / zoom out at its ends. It is both the map and the way back.
 */
export default function PathBar({ level, onLevel }: { level: number; onLevel: (k: number) => void }) {
  const c = useTranslation().t.howLab.layers;
  const v = c.v3;
  const zoomBtn =
    "flex shrink-0 items-center justify-center rounded-full border border-glass bg-background/70 text-foreground transition-colors hover:border-glass-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan disabled:opacity-40";

  return (
    <nav aria-label={v.pathLabel} className="absolute flex items-center" style={{ ...f.box(0, PATH_Y, W, H - PATH_Y), gap: f.u(10) }}>
      <button type="button" className={zoomBtn} aria-label={v.zoomIn} disabled={level === 0} onClick={() => onLevel(level - 1)} style={{ width: f.u(48), height: f.u(48), minWidth: 32, minHeight: 32 }}>
        <ZoomIn aria-hidden className="h-1/2 w-1/2" />
      </button>
      <ol className="flex min-w-0 flex-1 items-center" style={{ gap: f.u(6) }}>
        {v.levels.map((lv, k) => {
          const layer = LEVEL_LAYERS[k];
          const on = k === level;
          return (
            <Fragment key={lv.name}>
              {k > 0 && <ChevronRight aria-hidden className="shrink-0 text-muted-dark" style={{ width: f.u(22), height: f.u(22) }} />}
              <li className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onLevel(k)}
                  aria-current={on ? "step" : undefined}
                  className="flex w-full flex-col items-start rounded-xl border text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
                  style={{
                    padding: `${f.u(8)} ${f.u(16)}`,
                    borderColor: on ? tint(layer.brand, 60) : "var(--border-glass)",
                    background: on ? tint(layer.brand, 14) : "transparent",
                  }}
                >
                  <span className="font-mono font-semibold uppercase tracking-[0.16em]" style={{ ...f.fs(13, 12), color: BRAND_VAR[layer.brand] }}>
                    {`0${k + 1} · ${c.names[layer.id]}`}
                  </span>
                  <span className={`font-semibold leading-tight ${on ? "text-foreground" : "text-muted"}`} style={f.fs(21, 15)}>
                    {lv.name}
                  </span>
                </button>
              </li>
            </Fragment>
          );
        })}
      </ol>
      <button type="button" className={zoomBtn} aria-label={v.zoomOut} disabled={level === 3} onClick={() => onLevel(level + 1)} style={{ width: f.u(48), height: f.u(48), minWidth: 32, minHeight: 32 }}>
        <ZoomOut aria-hidden className="h-1/2 w-1/2" />
      </button>
    </nav>
  );
}
