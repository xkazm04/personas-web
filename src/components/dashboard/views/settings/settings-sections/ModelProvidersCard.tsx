"use client";

import { Network } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { MOCK_MODEL_PROVIDERS } from "@/lib/mock-dashboard-data";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { SettingToggle } from "./SettingToggle";

/** BYOM policy: which model providers the fleet may use. Persisted in
 *  settingsStore as an override map over each provider's default `allowed`. */
export function ModelProvidersCard() {
  const { t } = useTranslation();
  const p = t.settingsPage.providers;
  const isDemo = useAuthStore((s) => s.isDemo);
  const overrides = useSettingsStore((s) => s.providerOverrides);
  const setProviderAllowed = useSettingsStore((s) => s.setProviderAllowed);

  // BYOM provider config is device-local and not part of the cloud sync set —
  // there's no real source for this card in supabase mode.
  if (!isDemo) return null;

  return (
    <GlowCard accent="purple" variants={fadeUp} className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Network className="h-4 w-4 text-purple-400" />
        <h2 className="text-base font-semibold text-foreground">{p.title}</h2>
        <span className="ml-auto text-sm text-muted-dark">{p.subtitle}</span>
      </div>
      <div className="divide-y divide-glass">
        {MOCK_MODEL_PROVIDERS.map((m) => {
          const on = overrides[m.id] ?? m.allowed;
          return (
            <div key={m.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                <p className="truncate font-mono text-sm text-muted-dark">{m.model}</p>
              </div>
              {on && m.requests > 0 && (
                <span className="flex-shrink-0 text-sm tabular-nums text-muted-dark">
                  {m.requests.toLocaleString()} {p.requests}
                </span>
              )}
              <SettingToggle on={on} onChange={(v) => setProviderAllowed(m.id, v)} label={m.name} />
            </div>
          );
        })}
      </div>
    </GlowCard>
  );
}
