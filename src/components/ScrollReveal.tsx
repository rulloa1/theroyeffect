import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { shouldRunHeavyEffects } from "@/lib/effects-guard";
import { useMotionPaused } from "@/lib/motion-preference";

export function ScrollReveal({
  children,
  className = "",
  respectEffectsGuard = false,
  stagger = false,
  as = "div",
  chapterSeam = false,
}: {
  children?: ReactNode;
  className?: string;
  respectEffectsGuard?: boolean;
  stagger?: boolean;
  as?: "div" | "ol";
  chapterSeam?: boolean;
}) {
  const elementRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [staticReveal, setStaticReveal] = useState(false);
  const paused = useMotionPaused();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      reduceMotion ||
      paused ||
      (respectEffectsGuard && !shouldRunHeavyEffects()) ||
      typeof IntersectionObserver === "undefined"
    ) {
      setStaticReveal(true);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [paused, respectEffectsGuard]);

  const staggeredChildren = stagger
    ? Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const element = child as ReactElement<{ style?: CSSProperties }>;
        return cloneElement(element, {
          style: {
            ...element.props.style,
            "--reveal-index": index,
          } as CSSProperties,
        });
      })
    : children;

  const revealClassName = `scroll-reveal ${visible ? "scroll-reveal-visible" : ""} ${staticReveal ? "scroll-reveal-static" : ""} ${stagger ? "scroll-reveal-stagger" : ""} ${className}`;
  const content = chapterSeam ? (
    <span aria-hidden className={`chapter-seam ${visible ? "chapter-seam-drawn" : ""}`} />
  ) : (
    staggeredChildren
  );

  if (as === "ol") {
    return (
      <ol ref={(node) => (elementRef.current = node)} className={revealClassName}>
        {content}
      </ol>
    );
  }

  return (
    <div ref={(node) => (elementRef.current = node)} className={revealClassName}>
      {content}
    </div>
  );
}
