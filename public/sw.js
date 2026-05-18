/**
 * Tombstone service worker.
 *
 * This site does not use a service worker. Anyone whose browser still
 * has one registered from a previous build (or another project that
 * shared this localhost / origin) keeps polling /sw.js for updates and
 * holding caches that no longer reflect the current site.
 *
 * On fetch, the browser will load this file, register it as the new SW,
 * and the install + activate handlers below will:
 *   1. Skip waiting so this SW activates immediately
 *   2. Delete every Cache Storage entry the previous SW owned
 *   3. Unregister itself, so the next page load has no SW at all
 *   4. Force-reload any open clients so they pick up the un-SW'd state
 *
 * After everyone visits once, this file can be deleted. Leaving it in
 * place is harmless — fetches just return an empty 200.
 */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      } catch {
        // ignore — proceed to unregister regardless
      }
      try {
        await self.registration.unregister();
      } catch {
        // ignore
      }
      try {
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((client) => client.navigate(client.url));
      } catch {
        // ignore
      }
    })(),
  );
});
