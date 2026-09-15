import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useClientReducedMotion } from "./useClientReducedMotion";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Rolling digit counter (ported from cinematic-site-components/odometer.html).
 * Each digit is a 0–9 strip that slides to its target once scrolled into view.
 * Non-digit characters ($ , etc.) render static. Screen readers get the plain value.
 */
export function Odometer({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduceMotion = useClientReducedMotion();
  const settled = inView || reduceMotion;

  let digitIndex = 0;

  return (
    <span ref={ref} className={`inline-flex leading-none ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex">
        {value.split("").map((char, i) => {
          if (!/\d/.test(char)) {
            return (
              <span key={i} className="inline-block h-[1.1em] leading-[1.1]">
                {char}
              </span>
            );
          }
          const delay = digitIndex++ * 0.12;
          return (
            <span key={i} className="inline-block h-[1.1em] overflow-hidden">
              <motion.span
                className="flex flex-col"
                initial={false}
                animate={{ y: settled ? `${-Number(char) * 1.1}em` : "0em" }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay }
                }
              >
                {DIGITS.map((d) => (
                  <span key={d} className="block h-[1.1em] leading-[1.1]">
                    {d}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
