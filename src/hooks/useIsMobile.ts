import { useSyncExternalStore } from "react";

const MD_BREAKPOINT = 768;
const subscribe = (cb: () => void) => {
  const query = window.matchMedia(`(max-width: ${MD_BREAKPOINT - 1}px)`);
  query.addEventListener("change", cb);
  return () => query.removeEventListener("change", cb);
};
const getSnapshot = () => window.matchMedia(`(max-width: ${MD_BREAKPOINT - 1}px)`).matches;
const getServerSnapshot = () => false;

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
