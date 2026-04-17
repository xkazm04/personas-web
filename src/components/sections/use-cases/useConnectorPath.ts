"use client";

import { useState, useEffect, useRef, type RefObject } from "react";

export function useConnectorPath(
  selected: string,
  isMobile: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
  detailCardRef: RefObject<HTMLDivElement | null>,
  desktopRefs: RefObject<Record<string, HTMLButtonElement | null>>,
  mobileRefs: RefObject<Record<string, HTMLButtonElement | null>>,
) {
  const [connectorPath, setConnectorPath] = useState<string>("");
  const [connectorVisible, setConnectorVisible] = useState(false);
  const selectionCycleRef = useRef(0);
  const [prevKey, setPrevKey] = useState(`${selected}|${isMobile}`);

  const currentKey = `${selected}|${isMobile}`;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setConnectorVisible(false);
  }

  useEffect(() => {
    const updatePath = () => {
      const container = containerRef.current;
      const detail = detailCardRef.current;
      if (!container || !detail) return;

      const sourceButton = isMobile ? mobileRefs.current?.[selected] : desktopRefs.current?.[selected];

      if (!sourceButton || sourceButton.offsetParent === null) {
        setConnectorPath("");
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const sourceRect = sourceButton.getBoundingClientRect();
      const detailRect = detail.getBoundingClientRect();

      const sx = sourceRect.left + sourceRect.width / 2 - containerRect.left;
      const sy = sourceRect.top + sourceRect.height / 2 - containerRect.top;
      const tx = detailRect.left + detailRect.width / 2 - containerRect.left;
      const ty = detailRect.top - containerRect.top + 8;
      const cpY = sy + (ty - sy) * 0.55;

      setConnectorPath(`M ${sx} ${sy} C ${sx} ${cpY}, ${tx} ${cpY}, ${tx} ${ty}`);
    };

    selectionCycleRef.current += 1;
    const currentCycle = selectionCycleRef.current;

    const timer = window.setTimeout(() => {
      if (selectionCycleRef.current !== currentCycle) return;
      updatePath();
      setConnectorVisible(true);
    }, 200);

    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(updatePath);
    });
    ro.observe(container);

    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, [selected, isMobile, containerRef, detailCardRef, desktopRefs, mobileRefs]);

  return { connectorPath, connectorVisible };
}
