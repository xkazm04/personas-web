/**
 * Realtime bindings for `useSyncedRealtime`, kept free of store imports so a
 * node-environment test can drive them with a fake channel.
 *
 * Realtime applies RLS to INSERT and UPDATE events but not to DELETE: a DELETE
 * carries only the primary key and cannot be filtered, so every signed-in
 * browser would receive other accounts' deleted keys (scan d4b90e7a F11). So
 * DELETE is never subscribed, and neither is `'*'`, which includes it. A delete
 * reaches the UI at the next refetch, view mount or refresh.
 */

/** Synced tables whose changes drive a store refetch. */
export const WATCHED_TABLES = [
  "synced_personas",
  "synced_executions",
  "synced_events",
  "synced_manual_reviews",
  "synced_devices",
  "synced_notes",
  "synced_chat_sessions",
  "synced_chat_messages",
] as const;

export type WatchedTable = (typeof WATCHED_TABLES)[number];

/** The slice of a Realtime channel the bindings need. */
export interface ChannelLike {
  on(
    type: "postgres_changes",
    filter: { event: "INSERT" | "UPDATE"; schema: "public"; table: string },
    callback: (payload: any) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): unknown;
}

export interface SyncedBindingHandlers {
  onTableChange: (table: WatchedTable, payload: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  onCommandUpdate: (payload: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  onControllerUpdate: (payload: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function registerSyncedBindings(channel: ChannelLike, handlers: SyncedBindingHandlers): void {
  for (const table of WATCHED_TABLES) {
    for (const event of ["INSERT", "UPDATE"] as const) {
      channel.on("postgres_changes", { event, schema: "public", table }, (payload) =>
        handlers.onTableChange(table, payload),
      );
    }
  }
  // The command plane (PHASE2-SPEC 2.4): status changes are UPDATEs, applied from the payload.
  channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "pending_commands" }, handlers.onCommandUpdate);
  // The desktop activating (or revoking) this browser's controller.
  channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "command_controllers" }, handlers.onControllerUpdate);
}
