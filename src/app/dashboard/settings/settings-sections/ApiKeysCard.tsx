"use client";

import { useState } from "react";
import { KeyRound, Plus, ShieldOff } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { relativeTime } from "@/lib/format";
import { MOCK_API_KEYS, type ApiKeyRecord } from "@/lib/mock-dashboard-data";

/** API keys for CLI / MCP clients. Create + revoke are demo-only local state. */
export function ApiKeysCard() {
  const { t } = useTranslation();
  const a = t.settingsPage.apiKeys;
  const [keys, setKeys] = useState<ApiKeyRecord[]>(MOCK_API_KEYS);
  const [seq, setSeq] = useState(0);

  function addKey() {
    const next = seq + 1;
    setSeq(next);
    const suffix = (1000 + next).toString(16);
    setKeys((prev) => [
      {
        id: `new_${next}`,
        name: `${a.create} ${next}`,
        prefix: `pk_live_${suffix}`,
        scopes: ["personas:read"],
        lastUsed: null,
        revoked: false,
      },
      ...prev,
    ]);
  }

  function revoke(id: string) {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
  }

  return (
    <GlowCard accent="cyan" variants={fadeUp} className="p-6 lg:col-span-2">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">{a.title}</h2>
        <span className="hidden text-sm text-muted-dark sm:inline">{a.subtitle}</span>
        <button
          type="button"
          onClick={addKey}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 px-2.5 py-1.5 text-sm font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/15"
        >
          <Plus className="h-3.5 w-3.5" />
          {a.create}
        </button>
      </div>

      <div className="divide-y divide-glass">
        {keys.map((k) => (
          <div key={k.id} className="flex items-center gap-3 py-3">
            <KeyRound className="h-4 w-4 flex-shrink-0 text-muted-dark" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">{k.name}</p>
                <span
                  className={`rounded-full border px-1.5 py-0.5 text-sm font-medium ${
                    k.revoked
                      ? "border-rose-500/20 bg-rose-500/8 text-rose-400"
                      : "border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
                  }`}
                >
                  {k.revoked ? a.revoked : a.active}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-sm text-muted-dark">
                {k.prefix}··· · {k.scopes.join(", ")}
              </p>
              <p className="text-sm text-muted-dark">
                {a.lastUsed}: {k.lastUsed ? relativeTime(k.lastUsed) : a.never}
              </p>
            </div>
            {!k.revoked && (
              <button
                type="button"
                onClick={() => revoke(k.id)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-glass-hover bg-white/[0.03] px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <ShieldOff className="h-3.5 w-3.5" />
                {a.revoke}
              </button>
            )}
          </div>
        ))}
      </div>
    </GlowCard>
  );
}
