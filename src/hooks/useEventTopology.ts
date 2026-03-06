import { useMemo } from "react";
import type { PersonaEvent } from "@/lib/types";

/**
 * Computes connected components of events linked via sourceId (BFS).
 * Returns a Map where each event id maps to the Set of all ids in its chain.
 */
export function useEventTopology(events: PersonaEvent[]): Map<string, Set<string>> {
  return useMemo(() => {
    const ids = new Set(events.map((e) => e.id));
    const adj = new Map<string, Set<string>>();
    for (const e of events) adj.set(e.id, new Set());

    const bySource = new Map<string, string[]>();
    for (const e of events) {
      if (!e.sourceId) continue;
      const arr = bySource.get(e.sourceId) ?? [];
      arr.push(e.id);
      bySource.set(e.sourceId, arr);
    }

    for (const [sourceId, children] of bySource) {
      if (ids.has(sourceId)) {
        for (const child of children) {
          adj.get(sourceId)!.add(child);
          adj.get(child)!.add(sourceId);
        }
      }
      // Star topology: connect every child to the first child in the group.
      // Same connected component as all-pairs but in O(k) instead of O(k^2).
      if (children.length > 1) {
        const hub = children[0];
        for (let i = 1; i < children.length; i++) {
          adj.get(hub)!.add(children[i]);
          adj.get(children[i])!.add(hub);
        }
      }
    }

    const visited = new Set<string>();
    const result = new Map<string, Set<string>>();
    for (const e of events) {
      if (visited.has(e.id) || !adj.get(e.id)?.size) continue;
      const component = new Set<string>();
      const queue = [e.id];
      while (queue.length > 0) {
        const cur = queue.pop()!;
        if (visited.has(cur)) continue;
        visited.add(cur);
        component.add(cur);
        for (const n of adj.get(cur)!) {
          if (!visited.has(n)) queue.push(n);
        }
      }
      for (const id of component) result.set(id, component);
    }
    return result;
  }, [events]);
}
