import { useEffect, useState } from "react";

import { isFreshRelease, parseReleaseTimestamp } from "@/lib/release";

/**
 * Live "released in the last seven days" flag. The rule itself is
 * `isFreshRelease` in `@/lib/release`; this hook seeds it in a lazy
 * initializer (no `Date.now()` in render) and re-checks every minute.
 */
export function useFreshRelease(releaseDate: string): boolean {
  const hasDate = parseReleaseTimestamp(releaseDate) !== null;
  const [fresh, setFresh] = useState(() => isFreshRelease(releaseDate, Date.now()));

  useEffect(() => {
    if (!hasDate) return;
    const id = setInterval(() => {
      setFresh(isFreshRelease(releaseDate, Date.now()));
    }, 60_000);
    return () => clearInterval(id);
  }, [hasDate, releaseDate]);

  return fresh;
}
