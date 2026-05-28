import type { ReactNode } from "react";

/**
 * Scroll/padding container for the mobile (`/m`) route group. `min-h-svh` keeps
 * content sized to the *small* viewport so it's fully visible while the mobile
 * browser toolbar is shown; top padding respects the notch safe-area, bottom
 * padding clears the fixed MobileTabBar (which carries its own safe-area inset).
 */
export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      className="mx-auto min-h-svh w-full max-w-md px-4 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]"
    >
      {children}
    </main>
  );
}
