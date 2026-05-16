"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Read-once URL-derived useState. The hook seeds initial state from a
 * search param; syncing changes back to the URL stays the caller's job
 * (typically a single useEffect that owns all params at once, since
 * per-key writeback would race).
 */
export function useSearchParamState(
  key: string,
  defaultValue: string,
): readonly [string, React.Dispatch<React.SetStateAction<string>>] {
  const searchParams = useSearchParams();
  const [value, setValue] = useState<string>(() => searchParams.get(key) || defaultValue);
  return [value, setValue] as const;
}

/** Same as useSearchParamState, with a custom parse for non-string state shapes. */
export function useParsedSearchParamState<T>(
  key: string,
  parse: (raw: string | null) => T,
): readonly [T, React.Dispatch<React.SetStateAction<T>>] {
  const searchParams = useSearchParams();
  const [value, setValue] = useState<T>(() => parse(searchParams.get(key)));
  return [value, setValue] as const;
}
