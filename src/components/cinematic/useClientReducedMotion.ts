import { useEffect, useState } from "react";
import { useMotionPaused } from "@/lib/motion-preference";

/**
 * `prefers-reduced-motion`, read only after mount.
 *
 * framer-motion's `useReducedMotion` answers synchronously on the client but
 * `null` during SSR, so branching markup on it causes a hydration mismatch.
 * Starting at `false` keeps the first client render identical to the server's.
 */
export function useClientReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  const paused = useMotionPaused();

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced || paused;
}
