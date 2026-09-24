"use client";

import { ArrowDown, Lock } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { GLYPHS, PROVIDERS, TEMPLATE_ROWS, TOP_AUTH_TYPES } from "./VisionGrid.real-nouns.data";
import { markStyle, type Phase } from "./VisionGrid.real-nouns.reveal";

/** A data-driven brand colour, pulled toward the foreground so dark brands stay legible. */
const ink = (hex: string) => `color-mix(in srgb, ${hex || "var(--brand-cyan)"} 62%, var(--foreground))`;
const wash = (hex: string, pct: number) => `color-mix(in srgb, ${hex || "var(--brand-cyan)"} ${pct}%, transparent)`;

/** Brand colour plus a little foreground, so near-black brand colours still read on dark. */
const lift = (hex: string, pct: number, fg: number) =>
  `color-mix(in srgb, ${hex || "var(--brand-cyan)"} ${pct}%, var(--foreground) ${fg}%)`;

/* ── Vault: every connector the vault can hold a key for ───────── */

export function VaultArt({ phase }: { phase: Phase }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div aria-hidden className="flex flex-wrap gap-[2px]">
        {GLYPHS.map((g, i) => (
          <span
            key={g.name}
            title={`${g.label} · ${g.authType}`}
            className="flex h-[15px] w-[15px] items-center justify-center rounded-[4px] border"
            style={{ borderColor: wash(g.color, 30), backgroundColor: wash(g.color, 12), ...markStyle(phase, i * 6) }}
          >
            {g.icon ? (
              <span
                className="block h-[9px] w-[9px]"
                style={{
                  backgroundColor: ink(g.color),
                  maskImage: `url(/tools/${g.icon}.svg)`,
                  WebkitMaskImage: `url(/tools/${g.icon}.svg)`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />
            ) : (
              <span className="text-[12px] font-bold leading-none tracking-[-0.12em]" style={{ color: ink(g.color), transform: "scale(0.8)" }}>
                {g.monogram}
              </span>
            )}
          </span>
        ))}
      </div>
      <p className="flex items-center gap-1.5 font-mono text-xs text-muted-dark">
        <Lock aria-hidden className="h-3 w-3 shrink-0" style={{ color: BRAND_VAR.purple }} />
        <span className="truncate">{TOP_AUTH_TYPES.map((a) => `${a.type} ${a.count}`).join(" · ")} · …</span>
      </p>
    </div>
  );
}

/* ── Templates: one frame per template, a row per category ─────── */

export function TemplatesArt({ phase }: { phase: Phase }) {
  let n = 0;
  return (
    <ul className="flex h-full flex-col justify-between">
      {TEMPLATE_ROWS.map((row) => (
        <li key={row.category} className="flex h-[14px] items-center gap-2">
          <span className="w-[100px] shrink-0 truncate font-mono text-xs leading-none text-muted-dark">{row.category}</span>
          <span aria-hidden className="flex flex-1 gap-[2px]">
            {row.frames.map((f) => (
              <span
                key={f.id}
                title={`${f.title} · ${f.tool}`}
                className="h-3 w-[11px] rounded-[2px] border"
                style={{ borderColor: lift(f.color, 55, 22), backgroundColor: lift(f.color, 38, 8), ...markStyle(phase, n++ * 14, "translateY(4px) scale(0.6)") }}
              />
            ))}
          </span>
          <span className="w-5 shrink-0 text-right font-mono text-xs leading-none tabular-nums text-foreground/80">
            {row.frames.length}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── BYOM: provider picker rows, primary with failover ─────────── */

export function ByomArt({ phase }: { phase: Phase }) {
  return (
    <div className="flex h-full flex-col justify-center">
      {PROVIDERS.map((p, i) => {
        const primary = i === 0;
        return (
          <div key={p.id}>
            {!primary && (
              <div className="flex h-7 items-center gap-2 pl-[13px]">
                <span aria-hidden className="h-full border-l border-dashed" style={{ borderColor: tint("emerald", 45) }} />
                <ArrowDown aria-hidden className="-ml-[14px] h-3 w-3" style={{ color: BRAND_VAR.emerald }} />
                <span className="font-mono text-xs text-muted-dark">automatic failover</span>
              </div>
            )}
            <div
              className="rounded-lg border px-2.5 py-2"
              style={{
                borderColor: primary ? tint("emerald", 35) : "var(--border-glass-hover)",
                backgroundColor: primary ? tint("emerald", 7) : "rgba(var(--surface-overlay), 0.02)",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full border"
                  style={{ borderColor: BRAND_VAR.emerald, backgroundColor: primary ? BRAND_VAR.emerald : "transparent" }}
                />
                <span className="text-sm font-bold text-foreground">{p.name}</span>
                <span className="ml-auto font-mono text-xs text-muted-dark">{p.via}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1 pl-[18px]">
                {p.models.map((m, j) => (
                  <span
                    key={m}
                    className="rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 font-mono text-xs leading-none text-foreground/85"
                    style={markStyle(phase, 120 + i * 260 + j * 70)}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
