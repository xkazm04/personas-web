# UI Variant Prototyping

> Rapid creation of 2 unique UI/UX variants for any dashboard module or page component.
> Trigger: `/ui-variant` or user request to prototype/experiment with UI alternatives

---

## Overview

Creates **2 completely different UI/UX variants** of an existing component or page section, each as a separate file, with a tab switcher to toggle between them. The goal is rapid visual experimentation — finding the right way to represent content through creative, distinct approaches.

**Design philosophy for every variant:**
- Maximize information density — user sees/does everything within viewport without scrolling
- Creative, efficient layout — no dead spacing
- "Wow" effect — visually distinctive, each variant should feel completely different from the other
- Practical — real data, real interactions, not a mockup

---

## Procedure

### Step 1: Analyze the Target

1. **Read the existing component/page fully** — understand its data sources, props, store usage, shared components
2. **Identify the data shape** — what fields exist, what types, what volumes
3. **Catalog available shared components** — GlowCard, MetricCard, FilterBar, StatusBadge, PersonaAvatar, GradientText, etc.
4. **Note the import pattern** — stores (Zustand), API calls, hooks, animation helpers (fadeUp, staggerContainer from framer-motion)

Ask the user:
> "I'll create 2 variants of **[component name]**. The data has [N fields] across [M records]. Any specific approaches you want me to explore, or should I choose contrasting layouts?"

If the user has preferences, incorporate them. Otherwise, choose from the variant archetypes below.

### Step 2: Choose 2 Contrasting Variant Archetypes

Pick **two** from this menu that create maximum contrast with each other:

| Archetype | Description | Best For |
|-----------|-------------|----------|
| **Spatial Map / Treemap** | CSS grid with `grid-auto-flow: dense`, tiles sized by a key metric, color-coded by category. Hover/click for detail overlay. | Data with categories + numeric weight |
| **Dense Table** | Sortable columns, inline micro-visualizations (bars, dots), monospace numerics, striped rows, bottom detail panel on row select. | Many records with comparable fields |
| **Split Pane (Master-Detail)** | Left panel = compact list, right panel = full detail of selected item. Email-client style. Keyboard navigation (j/k). | Items that need both overview and deep inspection |
| **Kanban Board** | N columns by status/category, compact cards, drag-like transitions on state change, per-column scroll. | Data with distinct states/phases |
| **Command Dashboard** | Single dense viewport: top metrics strip, main visualization (chart/graph), side panel for selected item detail. Everything visible at once. | Monitoring/analytics data |
| **Timeline / Feed** | Vertical timeline with branching, grouped by time periods, expandable nodes, animated entry. | Temporal/sequential data |
| **Radial / Hub** | Central node with radiating connections, interactive hover states, detail on click. | Relationship/dependency data |

### Step 3: Create Variant Files

For each variant, create a new file in the same directory as the target:

**File naming:** `{ComponentName}{VariantName}.tsx`
Example: `KnowledgeNeuralMap.tsx`, `KnowledgeDenseTable.tsx`

**File structure:**
```tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// ... lucide-react icons
import { fadeUp, staggerContainer } from "@/lib/animations";
// ... shared components (GlowCard, GradientText, etc.)
// ... data source (store or mock data import)

// Component-local types and config
// ...

export default function ComponentVariantName() {
  // Full viewport height: h-[calc(100vh-10rem)] to fill dashboard area
  // All data fetching/filtering logic
  // Interactive state (selected item, hover, filters)

  return (
    // Layout that fills available space without requiring page scroll
  );
}
```

**Mandatory design rules for EVERY variant:**
- Use `h-[calc(100vh-10rem)]` on the outermost container to fill the dashboard viewport
- Include a compact top bar with summary stats (inline numbers, not full metric cards)
- Include filter controls (chips, toggles, or column-header-based)
- Include a detail view mechanism (overlay panel, bottom panel, or side panel — NOT a modal)
- Use the project's dark theme tokens: `bg-white/[0.0x]`, `border-white/[0.0x]`, `text-foreground`, `text-muted-dark`
- Use `framer-motion` for transitions and entry animations
- Use monospace (`font-mono`) for numeric data
- Color-code by category/type using the accent system (cyan, purple, emerald, amber)

### Step 4: Wire Up the Tab Switcher

Modify the parent page to add a variant switcher:

```tsx
import { useState } from "react";
import { Network, Table2 } from "lucide-react"; // or appropriate icons
import VariantA from "./VariantA";
import VariantB from "./VariantB";

type ViewVariant = "variant-a" | "variant-b";

const VIEW_VARIANTS: { key: ViewVariant; label: string; icon: React.ElementType }[] = [
  { key: "variant-a", label: "Label A", icon: IconA },
  { key: "variant-b", label: "Label B", icon: IconB },
];

// In the page component:
const [activeVariant, setActiveVariant] = useState<ViewVariant>("variant-a");

// In JSX — place after page header, before content:
<div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
  {VIEW_VARIANTS.map((v) => {
    const VIcon = v.icon;
    return (
      <button
        key={v.key}
        onClick={() => setActiveVariant(v.key)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          activeVariant === v.key
            ? "bg-white/[0.08] text-foreground shadow-sm"
            : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"
        }`}
      >
        <VIcon className="h-3.5 w-3.5" />
        {v.label}
      </button>
    );
  })}
</div>

// Conditional render:
{activeVariant === "variant-a" ? <VariantA /> : <VariantB />}
```

### Step 5: Verify

1. Run `npx tsc --noEmit` — zero errors required
2. Confirm both variants render with the same data source
3. Confirm tab switching works
4. Confirm no scrolling is needed in either variant (viewport-filling layouts)

### Step 6: Present to User

Summarize what was created:
- **Variant A: "[Name]"** — 1-sentence description of the layout approach
- **Variant B: "[Name]"** — 1-sentence description of the layout approach
- Note any interactive features (keyboard shortcuts, hover details, sorting, filtering)

Ask: "Which direction resonates more? I can iterate on the chosen one or create new variants."

---

## After User Decides

When the user picks a winner:
1. Delete the rejected variant file
2. If the original component is also being replaced, delete it and update the page to render the winner directly
3. Remove the tab switcher if only one view remains
4. Clean up any unused imports

---

## Notes

- Always use **parallel agents** to create both variants simultaneously for speed
- Each variant should be **self-contained** — its own file, own imports, no shared state with the other variant
- Variants should read data from the **same source** (store or mock data) so they're directly comparable
- Never create variants that are just "same layout with different colors" — the layouts must be fundamentally different (grid vs table, spatial vs linear, master-detail vs single-pane)
