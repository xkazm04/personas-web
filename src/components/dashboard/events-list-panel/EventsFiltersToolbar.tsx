import { motion } from "framer-motion";
import { Link2, Loader2, Search, X } from "lucide-react";
import FilterBar from "@/components/dashboard/FilterBar";
import { fadeUp } from "@/lib/animations";
import type { EventPanelLabels } from "./eventPanelTypes";

export function EventsFiltersToolbar({
  query,
  setQuery,
  filter,
  setFilter,
  counts,
  eventTypeFilter,
  setEventTypeFilter,
  sourceTypeFilter,
  setSourceTypeFilter,
  uniqueEventTypes,
  uniqueSourceTypes,
  hasActiveFilters,
  activeChain,
  clearActiveChain,
  filteredCount,
  eventsLoading,
  labels,
}: {
  query: string;
  setQuery: (query: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  counts: { all: number; pending: number; processed: number; failed: number; dead_letter: number };
  eventTypeFilter: string;
  setEventTypeFilter: (filter: string) => void;
  sourceTypeFilter: string;
  setSourceTypeFilter: (filter: string) => void;
  uniqueEventTypes: string[];
  uniqueSourceTypes: string[];
  hasActiveFilters: boolean;
  activeChain: Set<string> | null;
  clearActiveChain: () => void;
  filteredCount: number;
  eventsLoading: boolean;
  labels: EventPanelLabels;
}) {
  return (
    <>
      <motion.div variants={fadeUp} className="mb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark/60" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={labels.eventsPage.searchPlaceholder} className="w-full rounded-xl border border-glass bg-white/[0.03] py-2 pl-9 pr-9 text-base text-foreground placeholder:text-muted-dark/60 transition-colors focus:border-brand-cyan/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20" />
          {query && <button onClick={() => setQuery("")} aria-label={labels.eventsPage.clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-dark/60 transition-colors hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
        </div>
      </motion.div>
      <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-3">
        <FilterBar
          options={[
            { key: "all", label: labels.executionsPage.all, count: counts.all },
            { key: "pending", label: labels.memoriesPage.status.pending, count: counts.pending },
            { key: "processed", label: labels.executionsPage.completed, count: counts.processed },
            { key: "failed", label: labels.executionsPage.failed, count: counts.failed },
            { key: "dead_letter", label: "Dead Letter", count: counts.dead_letter },
          ]}
          active={filter}
          onChange={setFilter}
        />
        <DropdownFilter label={labels.eventsPage.eventType} value={eventTypeFilter} options={uniqueEventTypes} onChange={setEventTypeFilter} />
        <DropdownFilter label={labels.eventsPage.sourceType} value={sourceTypeFilter} options={uniqueSourceTypes} onChange={setSourceTypeFilter} />
        {hasActiveFilters && <ClearFiltersButton onClick={() => { setQuery(""); setEventTypeFilter(""); setSourceTypeFilter(""); setFilter("all"); }} label={labels.eventsPage.clearFilters} />}
        {activeChain && (
          <button onClick={clearActiveChain} className="flex items-center gap-1 rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1.5 text-sm text-brand-cyan transition-colors hover:border-brand-cyan/30 hover:bg-brand-cyan/10">
            <Link2 className="h-3 w-3" />
            {labels.eventsPage.chain}: {activeChain.size} {labels.eventsPage.events}
            <X className="h-3 w-3 ml-0.5" />
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {hasActiveFilters && <span className="text-sm text-muted-dark tabular-nums">{filteredCount} {filteredCount === 1 ? labels.eventsPage.result : labels.eventsPage.results}</span>}
          {eventsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />}
        </div>
      </motion.div>
    </>
  );
}

function DropdownFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="h-10 sm:h-8 rounded-lg border border-glass bg-white/[0.03] px-3 sm:px-2 text-base sm:text-sm text-muted transition-colors hover:border-glass-strong focus:border-brand-cyan/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20 appearance-none cursor-pointer">
      <option value="">{label}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function ClearFiltersButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 rounded-lg border border-glass bg-white/[0.03] px-2.5 py-1.5 text-sm text-muted-dark transition-colors hover:border-glass-strong hover:text-foreground">
      <X className="h-3 w-3" />
      {label}
    </button>
  );
}
