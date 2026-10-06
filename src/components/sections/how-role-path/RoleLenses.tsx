"use client";

import { Check } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ROLES, type ViewerRole } from "./roles";

/** The three role "lenses": real toggle buttons (aria-pressed), so the choice
 *  is keyboard reachable. The chosen lens lights in its role colour - the same
 *  colour the route beside it is drawn in. */
export default function RoleLenses({ role, onChange }: { role: ViewerRole; onChange: (role: ViewerRole) => void }) {
  const c = useTranslation().t.howSections.rolePath;

  return (
    <div
      role="group"
      aria-label={c.pickLabel}
      className="flex flex-col gap-3 stage:w-[clamp(14rem,24%,19rem)] stage:shrink-0"
    >
      <p aria-hidden className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
        {c.pickLabel}
      </p>
      {ROLES.map((r) => {
        const active = r.id === role;
        const Icon = r.icon;
        const copy = c.roles[r.copy];
        return (
          <button
            key={r.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(r.id)}
            className="relative flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-[background-color,border-color,box-shadow] duration-300 hover:border-glass-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
            style={{
              borderColor: active ? tint(r.brand, 60) : "var(--border-glass-hover)",
              background: active ? tint(r.brand, 10) : "transparent",
              boxShadow: active ? brandShadow(r.brand, 32, 16) : "none",
            }}
          >
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors duration-300"
              style={{
                borderColor: tint(r.brand, active ? 75 : 35),
                background: tint(r.brand, active ? 20 : 6),
                color: BRAND_VAR[r.brand],
              }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold leading-tight text-foreground">{copy.name}</span>
              <span className="mt-0.5 block text-sm leading-snug text-muted">{copy.want}</span>
            </span>
            <span
              aria-hidden
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-opacity duration-300"
              style={{
                opacity: active ? 1 : 0,
                borderColor: tint(r.brand, 70),
                background: tint(r.brand, 25),
                color: BRAND_VAR[r.brand],
              }}
            >
              <Check className="h-3.5 w-3.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
