"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * URL-derived useState that also re-syncs when the param changes *underneath*
 * it — back/forward navigation or a shared deep link clicked while the page is
 * already mounted. Writing state back to the URL stays the caller's job (a
 * single effect that owns all params at once). The `lastUrl` ref makes the
 * re-sync ignore the caller's own writeback (current === last), so it only
 * re-seeds on a genuine external change rather than fighting the writeback.
 */
export function useSearchParamState(
  key: string,
  defaultValue: string,
): readonly [string, React.Dispatch<React.SetStateAction<string>>] {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get(key) || defaultValue;
  const [value, setValue] = useState<string>(fromUrl);
  const lastUrlRef = useRef(fromUrl);

  useEffect(() => {
    const current = searchParams.get(key) || defaultValue;
    if (current !== lastUrlRef.current) {
      lastUrlRef.current = current;
      setValue(current);
    }
  }, [searchParams, key, defaultValue]);

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
