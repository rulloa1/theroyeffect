import { motion } from "framer-motion";
import { useClientReducedMotion } from "./useClientReducedMotion";

/**
 * Hand-drawn stroke that draws itself when scrolled into view
 * (ported from cinematic-site-components/svg-draw.html). Decorative only.
 */
export function DrawUnderline({ className = "" }: { className?: string }) {
  const reduceMotion = useClientReducedMotion();

  return (
    <svg
      aria-hidden
      viewBox="0 0 300 20"
      preserveAspectRatio="none"
      className={`block h-3 w-48 md:h-4 md:w-72 ${className}`}
    >
      <motion.path
        d="M3 14 C 60 5, 125 3, 185 9 S 268 17, 297 6"
        fill="none"
        stroke="#FF3333"
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: reduceMotion ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
        transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}
