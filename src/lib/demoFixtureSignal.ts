/**
 * "The demo's in-session fixtures just changed": the scripted desktop
 * (`mockCommandPlane`, through `commandStore`) and the scripted realtime
 * channel (`demoRealtime`) say so after they write, and readers outside the
 * stores (the Personas stage's crew bridge) re-read what they mirror.
 * Demo-only by construction: nothing on a live plane calls `notify`.
 */

const listeners = new Set<() => void>();

export function onDemoFixtureChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyDemoFixtureChange(): void {
  listeners.forEach((l) => l());
}
