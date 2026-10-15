import type { MemoryAction, MemoryItem } from "./mock-dashboard-data";
import type { SyncedMemory } from "./supabaseApi";

/** SWR key of the demo's Knowledge > Memories read (`mockApi.getKnowledgeMemories`). */
export const KNOWLEDGE_MEMORIES_KEY = "knowledge-memories";

const MEMORY_TYPES: MemoryAction["type"][] = ["throttle", "schedule", "alert", "config", "routing"];

/** Coerce a synced memory category into the web display memory-action union. */
export function normalizeMemoryType(raw: string | null): MemoryAction["type"] {
  return raw && (MEMORY_TYPES as string[]).includes(raw) ? (raw as MemoryAction["type"]) : "config";
}

/**
 * A desktop persona memory row as a Memories card. One mapper for both planes:
 * real mode's synced rows and the demo's learned rows read the same way.
 */
export function memoryItemFromSynced(m: SyncedMemory, personaName: string): MemoryItem {
  // importance is the desktop's 0..N weight; map onto the 1-10 display score.
  const score = Math.max(1, Math.min(10, Math.round(m.importance ?? 5)));
  return {
    id: m.id,
    type: normalizeMemoryType(m.category),
    title: m.title,
    description: m.content,
    persona: personaName,
    score,
    // No accept/archive workflow is synced; treat every synced memory as active.
    status: "active",
    // usageCount / lastUsed aren't tracked in the sync projection - leave them
    // undefined so the card omits them rather than reporting a fabricated 0.
    usageCount: undefined,
    acceptedAt: m.createdAt,
    lastUsed: undefined,
    // Conflict detection is a desktop-only concept; never flag synced memories.
    hasConflict: false,
    sourceExecutionId: m.sourceExecutionId,
  };
}
