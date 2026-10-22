"use client";

import { useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * True when the reader has asked for reduced motion.
 *
 * Subscribed rather than sampled on mount, so a change to the preference takes
 * effect immediately instead of at the next reload. Returns false on the server,
 * which is also the right first paint — motion is opt-out, not opt-in.
 *
 * Read this during render and derive from it. Setting state from a media query
 * inside an effect causes a cascading render, and React's lint rules say so.
 */
export function useStillness() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false
  );
}
