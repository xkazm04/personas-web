"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import type { AuditIncident, IncidentSeverity, IncidentSource } from "@/lib/mock-dashboard-data";
import { type GroupByKey, groupIncidents, severityStyle, sourceIcon } from "./incidentFormat";
import { IncidentRow } from "./IncidentRow";

function GroupLeading({ groupBy, sample }: { groupBy: GroupByKey; sample: AuditIncident }) {
  if (groupBy === "agent") {
    return <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: sample.personaColor }} />;
  }
  if (groupBy === "severity") {
    return <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${severityStyle[sample.severity].rail}`} />;
  }
  const Icon = sourceIcon[sample.source];
  return <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-dark" />;
}

/**
 * Renders the filtered incidents either as a flat list (group-by "none") or as
 * collapsible group sections (agent / severity / source). Group headers show a
 * leading indicator + count and toggle their section open/closed.
 */
export function IncidentList({
  incidents,
  groupBy,
  onSelect,
}: {
  incidents: AuditIncident[];
  groupBy: GroupByKey;
  onSelect: (incident: AuditIncident) => void;
}) {
  const { t } = useTranslation();
  const labels = t.incidentsPage;
  const reduce = useReducedMotion();
  const groups = useMemo(() => groupIncidents(incidents, groupBy), [incidents, groupBy]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  if (groupBy === "none") {
    return (
      <GlowCard accent="cyan" className="p-2">
        <div className="space-y-0.5">
          {incidents.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} onSelect={onSelect} />
          ))}
        </div>
      </GlowCard>
    );
  }

  const labelFor = (key: string): string => {
    if (groupBy === "severity") return labels.severity[key as IncidentSeverity];
    if (groupBy === "source") return labels.source[key as IncidentSource];
    return key; // agent — persona name is verbatim data
  };

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key);
        return (
          <GlowCard key={group.key} accent="cyan" className="p-2">
            <button
              type="button"
              onClick={() => toggle(group.key)}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.03] focus-ring focus-visible:ring-offset-0"
            >
              <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-dark transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              <GroupLeading groupBy={groupBy} sample={group.items[0]} />
              <span className="truncate text-sm font-semibold text-foreground">{labelFor(group.key)}</span>
              <span className="ml-auto flex-shrink-0 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-sm tabular-nums text-muted-dark">
                {group.items.length}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 pt-0.5">
                    {group.items.map((incident) => (
                      <IncidentRow key={incident.id} incident={incident} onSelect={onSelect} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlowCard>
        );
      })}
    </div>
  );
}
