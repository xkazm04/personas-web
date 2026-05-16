import { useCallback, useRef, useState } from "react";

export function useDeferredMount(rootMargin = "220px"): [(el: HTMLDivElement | null) => void, boolean] {
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const callbackRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!element || mounted) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setMounted(true);
            observer.disconnect();
          }
        },
        { rootMargin },
      );

      observer.observe(element);
      observerRef.current = observer;
    },
    [mounted, rootMargin],
  );

  return [callbackRef, mounted];
}
