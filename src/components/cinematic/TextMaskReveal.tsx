import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useClientReducedMotion } from "./useClientReducedMotion";

/**
 * Headline that fills in as it scrolls through the viewport
 * (ported from cinematic-site-components/text-mask.html).
 * A dim copy sits underneath; a bright copy is revealed top-to-bottom with clip-path.
 * Only the dim copy is exposed to assistive tech, so the text is read once.
 * Markup is identical with reduced motion (the bright copy is just unclipped) so SSR hydrates cleanly.
 */
export function TextMaskReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useClientReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const clipPath = useTransform(scrollYProgress, (p) => `inset(0% 0% ${(1 - p) * 100}% 0%)`);

  return (
    <h2 ref={ref} className={`relative ${className}`}>
      <span className="block text-white/15">{text}</span>
      <motion.span
        aria-hidden
        className="absolute inset-0 block text-white"
        style={reduceMotion ? { clipPath: "none" } : { clipPath }}
      >
        {text}
      </motion.span>
    </h2>
  );
}
