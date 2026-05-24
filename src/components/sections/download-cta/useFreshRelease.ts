import { useEffect, useState } from "react";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function parseReleaseTimestamp(raw: string): number | null {
  if (!raw) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00Z` : raw;
  const ts = Date.parse(iso);
  return Number.isNaN(ts) ? null : ts;
}

export function useFreshRelease(releaseDate: string): boolean {
  const releaseTimestamp = parseReleaseTimestamp(releaseDate);
  const [fresh, setFresh] = useState(
    () => releaseTimestamp !== null && Date.now() - releaseTimestamp < SEVEN_DAYS_MS,
  );

  useEffect(() => {
    if (releaseTimestamp === null) return;
    const id = setInterval(() => {
      setFresh(Date.now() - releaseTimestamp < SEVEN_DAYS_MS);
    }, 60_000);
    return () => clearInterval(id);
  }, [releaseTimestamp]);

  return fresh;
}
