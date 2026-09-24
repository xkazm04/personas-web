"use client";

import {
  CheckCircle2,
  HelpCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import {
  ConnectorGlyph,
  ScreenFrame,
  Tile,
  glass,
} from "./VisionGrid.real-surfaces.chrome";
import {
  CREDENTIALS,
  TEMPLATE_CATEGORY_COUNT,
  TEMPLATE_COUNT,
  TEMPLATE_TILES,
  type Health,
} from "./VisionGrid.real-surfaces.data";

function HealthChip({ health }: { health: Health }) {
  const ok = health === "healthy";
  const Icon = ok ? CheckCircle2 : HelpCircle;
  return (
    <span
      className="flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs"
      style={{
        color: ok ? BRAND_VAR.emerald : "var(--muted)",
        backgroundColor: ok ? tint("emerald", 8) : glass(0.03),
        borderColor: ok ? tint("emerald", 22) : "var(--border-glass)",
      }}
    >
      <Icon aria-hidden className="h-3 w-3" />
      {ok ? "Healthy" : "Untested"}
    </span>
  );
}

/** Vault: the credential list with its standing trust panel. */
export function VaultScreen() {
  return (
    <ScreenFrame
      title="Credentials"
      meta={
        <>
          <Lock aria-hidden className="h-3 w-3" />
          stored locally
        </>
      }
    >
      <div className="flex h-full flex-col gap-1.5">
        {CREDENTIALS.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-2 rounded-lg border border-glass px-2 py-[3px]"
            style={{ backgroundColor: glass(0.02) }}
          >
            {c.connector && (
              <Tile color={c.connector.color}>
                <ConnectorGlyph
                  icon={c.connector.icon}
                  color={c.connector.color}
                  size={13}
                />
              </Tile>
            )}
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
              {c.name}
            </span>
            <Lock
              aria-label="encrypted"
              className="h-3 w-3 shrink-0 text-muted"
            />
            <HealthChip health={c.health} />
          </div>
        ))}
        <div
          className="mt-auto flex items-center gap-1.5 rounded-lg border px-2 py-1.5"
          style={{
            backgroundColor: tint("emerald", 6),
            borderColor: tint("emerald", 20),
          }}
        >
          <ShieldCheck
            aria-hidden
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: BRAND_VAR.emerald }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: BRAND_VAR.emerald }}
          >
            Vault is secure
          </span>
          <span className="ml-auto truncate text-xs text-muted">
            AES-256-GCM · OS keychain
          </span>
        </div>
      </div>
    </ScreenFrame>
  );
}

/** Templates: the gallery grid, count and categories derived from the catalogue. */
export function TemplatesScreen() {
  const more = TEMPLATE_COUNT - TEMPLATE_TILES.length;
  return (
    <ScreenFrame
      title="Templates"
      meta={
        <span className="font-mono tabular-nums">
          {TEMPLATE_COUNT} templates
        </span>
      }
    >
      <div className="flex h-full flex-col gap-1.5">
        <div className="grid grid-cols-3 gap-1.5">
          {TEMPLATE_TILES.map((t) => {
            const Icon = t.toolIcon;
            return (
              <div
                key={t.id}
                className="flex h-[66px] flex-col gap-1 rounded-lg border border-glass p-1.5"
                style={{ backgroundColor: glass(0.02) }}
              >
                <span className="flex items-center gap-1.5">
                  <Tile color={t.toolColor} size={18}>
                    <Icon
                      className="h-2.5 w-2.5"
                      style={{ color: t.toolColor }}
                    />
                  </Tile>
                  <span className="truncate text-xs text-muted">{t.tool}</span>
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
                  {t.title}
                </span>
              </div>
            );
          })}
          <div
            className="flex h-[66px] flex-col items-center justify-center rounded-lg border border-dashed border-glass-hover"
            style={{ backgroundColor: tint("cyan", 5) }}
          >
            <span className="font-mono text-sm font-bold tabular-nums text-brand-cyan">
              +{more}
            </span>
            <span className="text-xs text-muted">more</span>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-muted">
          <span>
            <span className="font-mono tabular-nums text-foreground">
              {TEMPLATE_CATEGORY_COUNT}
            </span>{" "}
            categories
          </span>
          <span className="rounded-md border border-glass px-1.5 py-0.5 text-foreground">
            Adopt
          </span>
        </div>
      </div>
    </ScreenFrame>
  );
}
