"use client";

import { useRef } from "react";

import GlowCard from "@/components/GlowCard";
import { ARRIVE } from "@/components/dashboard/arrival/arrive";
import RelatedIncidentLinks from "@/components/dashboard/RelatedIncidentLinks";
import { useFocusParam, useScrollIntoViewWhen } from "@/hooks/useFocusParam";
import { useTranslation } from "@/i18n/useTranslation";
import { DEMO_THREADS, relatedTo } from "@/lib/incidentThreads";
import type { HealthCheckItem, HealthCheckSection } from "@/lib/mock-dashboard-data";
import { sectionAccent, sectionIcon, statusStyle, worstStatus } from "@/lib/healthFormat";

/** Ghost rows per card on a cold load (the fixture's typical section size). */
const GHOST_ROWS = 4;

/**
 * One System-Health section card (runtime / services / resources /
 * integrations): a titled card with a header status dot (worst item) and a
 * status-dotted item list; installable/configurable items get a demo action
 * button. An optional footer hosts the disk-usage bar on the Resources card.
 */
export function HealthSectionCard({
  section,
  pending = false,
  settle = false,
  onAction,
  footer,
}: {
  section: HealthCheckSection;
  /** Cold load: chrome paints, the item list is a delayed geometry-true ghost. */
  pending?: boolean;
  /** Items landing after a cold load take the T2 entrance (once). */
  settle?: boolean;
  onAction: (item: HealthCheckItem) => void;
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const labels = t.healthPage;
  const Icon = sectionIcon[section.key];
  const worst = worstStatus(section.items);
  const focusId = useFocusParam();

  return (
    <GlowCard accent={sectionAccent[section.key]} className="flex h-full flex-col p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${pending ? "text-muted-dark" : statusStyle[worst].text}`} />
        <h2 className="text-base font-semibold text-foreground">{labels.sections[section.key]}</h2>
        {/* The worst-status dot is data (T2): no claim until the checks exist. */}
        <span
          className={`ml-auto h-2 w-2 rounded-full ${pending ? "" : statusStyle[worst].dot}`}
          title={pending ? undefined : labels.status[worst]}
          aria-label={pending ? undefined : labels.status[worst]}
        />
      </div>

      {/* One persistent body node across pending -> settled. */}
      <div className={`space-y-0.5${settle ? ` ${ARRIVE}` : ""}`}>
        {pending ? (
          <div aria-hidden className="dash-ghost space-y-0.5">
            {Array.from({ length: GHOST_ROWS }, (_, i) => (
              // HealthCheckRow geometry: py-1.5 around two 20px lines = 52px.
              <div key={i} className="flex h-[52px] items-center gap-2.5 px-2">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-glass" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded bg-glass" />
                  <div className="h-3 w-3/5 rounded bg-glass" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          section.items.map((item) => (
            <HealthCheckRow key={item.id} item={item} focused={focusId === item.id} onAction={onAction} />
          ))
        )}
      </div>

      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </GlowCard>
  );
}

/**
 * One check. A ?focus=<check id> deep link rings it (a class only, so markup
 * shape never depends on the URL) and scrolls it into view; a check that is
 * part of a demo incident thread links to the same incident on SLA and
 * Observability.
 */
function HealthCheckRow({
  item,
  focused,
  onAction,
}: {
  item: HealthCheckItem;
  focused: boolean;
  onAction: (item: HealthCheckItem) => void;
}) {
  const { t } = useTranslation();
  const labels = t.healthPage;
  const ref = useRef<HTMLDivElement>(null);
  useScrollIntoViewWhen(ref, focused);
  const links = relatedTo(DEMO_THREADS, item.id);

  return (
    <div ref={ref} className={`rounded-lg px-2 py-1.5 ${focused ? "ring-2 ring-brand-cyan/50" : ""}`}>
      <div className="flex items-center gap-2.5">
        <span
          className={`h-2 w-2 flex-shrink-0 rounded-full ${statusStyle[item.status].dot}`}
          title={labels.status[item.status]}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {item.name}
            {item.meta && <span className="ml-1.5 text-xs tabular-nums text-muted-dark">{item.meta}</span>}
          </p>
          <p className={`truncate text-sm ${item.status === "ok" ? "text-muted-dark" : statusStyle[item.status].text}`}>
            {item.detail}
          </p>
        </div>
        {item.action && (
          <button
            type="button"
            onClick={() => onAction(item)}
            className="flex-shrink-0 rounded-lg border border-glass-hover bg-white/[0.03] px-2.5 py-1 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground focus-ring focus-visible:ring-offset-0"
          >
            {labels.actions[item.action]}
          </button>
        )}
      </div>
      {links.length > 0 && (
        <div className="pl-[1.125rem]">
          <RelatedIncidentLinks links={links} />
        </div>
      )}
    </div>
  );
}
