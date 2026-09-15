import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useClientReducedMotion } from "./useClientReducedMotion";

export interface StackCardItem {
  step: string;
  title: string;
  body: string;
}

/**
 * Cards that pin under the header and stack on top of each other as you scroll,
 * with earlier cards easing back (ported from cinematic-site-components/sticky-cards.html).
 * Needs an ancestor without `overflow: hidden` — sticky breaks inside one.
 */
export function StickyStackCards({ items }: { items: StackCardItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useClientReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="relative mx-auto max-w-3xl">
      {items.map((item, i) => (
        <StackCard
          key={item.step}
          item={item}
          index={i}
          total={items.length}
          progress={scrollYProgress}
          animate={!reduceMotion}
        />
      ))}
    </div>
  );
}

function StackCard({
  item,
  index,
  total,
  progress,
  animate,
}: {
  item: StackCardItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  const targetScale = 1 - (total - 1 - index) * 0.05;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);
  const isLast = index === total - 1;

  return (
    <div
      className={`sticky ${isLast ? "" : "mb-[22vh]"}`}
      style={{ top: `calc(6.5rem + ${index * 1.25}rem)` }}
    >
      <motion.div
        style={animate ? { scale } : {}}
        className="relative min-h-56 origin-top border border-white/10 bg-[#0f0a26] p-7 shadow-[0_-12px_40px_rgba(3,0,20,0.7)] md:min-h-64 md:p-10"
      >
        <span className="absolute right-5 top-3 font-display text-6xl text-white/10 md:text-7xl">
          {item.step}
        </span>
        <span className="font-mono text-xs tracking-widest text-[#FF3333]">STEP {item.step}</span>
        <h3 className="mt-3 max-w-md font-display text-2xl uppercase text-white md:text-3xl">
          {item.title}
        </h3>
        <p className="mt-3 max-w-lg font-mono text-base leading-[1.6] text-white/90">{item.body}</p>
      </motion.div>
    </div>
  );
}
