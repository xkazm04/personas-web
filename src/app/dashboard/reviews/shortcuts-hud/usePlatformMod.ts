import { useState } from "react";

export type ShortcutMod = "Cmd" | "Ctrl";

export function usePlatformMod(): ShortcutMod {
  const [isMac] = useState(
    () => typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform),
  );
  return isMac ? "Cmd" : "Ctrl";
}
