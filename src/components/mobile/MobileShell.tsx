import type { ReactNode } from "react";

/**
 * Scroll/padding container for the mobile (`/m`) route group. Bottom padding
 * clears the fixed MobileTabBar; the tab bar carries its own safe-area inset.
 */
export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-28 pt-5"
    >
      {children}
    </main>
  );
}
