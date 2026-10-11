"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import type { Connector } from "@/data/connectors";
import { loadConnectorSetup, type ConnectorSetup } from "@/data/connectorSetup";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";

const headingClass = "text-base font-mono uppercase tracking-widest text-muted-dark mb-4";

export default function SetupDetails({ connector }: { connector: Connector }) {
  const { t } = useTranslation();
  const strings = t.connectorModal;
  const [loaded, setLoaded] = useState<{ name: string; setup: ConnectorSetup | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadConnectorSetup(connector.name)
      .then((setup) => {
        if (!cancelled) setLoaded({ name: connector.name, setup });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ name: connector.name, setup: null });
      });
    return () => {
      cancelled = true;
    };
  }, [connector.name]);

  // Stale result from the previously opened connector: render nothing until ours lands.
  const setup = loaded?.name === connector.name ? loaded.setup : null;
  if (!setup) return null;
  const { fields, guide, docsUrl, outboundOnly } = setup;
  if (!fields?.length && !guide?.length && !docsUrl && !outboundOnly) return null;

  return (
    <>
      <div className="mx-8 h-px bg-white/[0.06]" />
      <div className="px-8 py-6 space-y-6">
        {fields && fields.length > 0 && (
          <section>
            <h3 className={headingClass}>{strings.needHeading}</h3>
            <ul className="space-y-2">
              {fields.map((f) => (
                <li key={f.label} className="rounded-xl border border-glass bg-white/[0.02] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-white">{f.label}</span>
                    {f.kind === "secret" && (
                      <span
                        className="rounded-md px-2 py-0.5 text-sm font-mono"
                        style={{ backgroundColor: `${connector.color}15`, color: connector.color }}
                      >
                        {strings.secretField}
                      </span>
                    )}
                    {f.optional && <span className="text-sm text-muted-dark">{strings.optionalField}</span>}
                  </div>
                  {f.help && <p className="mt-1 text-base leading-relaxed text-muted-dark">{f.help}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide && guide.length > 0 && (
          <section>
            <h3 className={headingClass}>{strings.setupHeading}</h3>
            {guide.length > 1 ? (
              <ol className="space-y-2">
                {guide.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-base font-bold"
                      style={{ backgroundColor: `${connector.color}15`, color: connector.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 text-base leading-relaxed text-muted-dark">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-base leading-relaxed text-muted-dark">{guide[0]}</p>
            )}
            <p className="mt-3 text-sm text-muted-dark">{strings.englishNote}</p>
          </section>
        )}

        {outboundOnly && (
          <p className="flex items-start gap-2 rounded-xl border border-glass bg-white/[0.02] px-4 py-3 text-base text-muted-dark">
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: connector.color }} aria-hidden />
            {fillTemplate(strings.outboundOnly, { label: connector.label })}
          </p>
        )}

        {docsUrl && (
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base font-medium text-brand-cyan hover:underline"
          >
            {strings.docsLink}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
    </>
  );
}
