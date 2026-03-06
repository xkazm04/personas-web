"use client";

import { useEffect } from "react";

const SELECTOR = "[data-animate-when-visible]";
const PAUSED_CLASS = "animations-paused";

/**
 * Observes all elements with `data-animate-when-visible` and toggles
 * the `.animations-paused` class when they leave the viewport
 * (with a one-viewport-height margin). This pauses CSS animations
 * on off-screen sections to free GPU compositing budget.
 */
export function useAnimationPause() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove(PAUSED_CLASS);
          } else {
            entry.target.classList.add(PAUSED_CLASS);
          }
        }
      },
      {
        // Trigger when element is within one viewport height of the visible area
        rootMargin: "100% 0px",
      },
    );

    const elements = document.querySelectorAll(SELECTOR);
    elements.forEach((el) => observer.observe(el));

    // Re-observe if new sections are lazily added to the DOM
    const mutation = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute("data-animate-when-visible")) {
              observer.observe(node);
            }
            node
              .querySelectorAll(SELECTOR)
              .forEach((el) => observer.observe(el));
          }
        }
      }
    });

    const mutationRoot =
      document.getElementById("main-content") ?? document.body;
    mutation.observe(mutationRoot, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);
}
