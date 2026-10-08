/**
 * `personas://` links the desktop app opens. Matches `parse_nav_link` in
 * personas `src-tauri/src/boot/deep_link.rs` (master 1520e629, 2026-10-07):
 * `personas://persona/<id>` and `personas://execution/<id>`, where the id is
 * `^[A-Za-z0-9_-]{1,64}$`. An id is never encoded or repaired: one that fails
 * the pattern yields null, because the desktop would reject its encoded form.
 */
const NAV_ID = /^[A-Za-z0-9_-]{1,64}$/;

function navLink(host: "persona" | "execution", id: string): string | null {
  return typeof id === "string" && NAV_ID.test(id) ? `personas://${host}/${id}` : null;
}

export function personaDeepLink(id: string): string | null {
  return navLink("persona", id);
}

export function executionDeepLink(id: string): string | null {
  return navLink("execution", id);
}
