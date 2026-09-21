import { useEffect, useRef, useState, type ReactNode } from "react";
import { motionAllowedNow } from "./motion";

/** One sheet of the proof: a rule that draws in, then its grouped items rise. */
export function Sheet({
  id,
  labelledBy,
  className = "",
  rule = true,
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  rule?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!motionAllowedNow() || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={`mk-sheet${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`}
    >
      <div className="mk-wrap">
        {rule ? <span className="mk-sheet-rule" aria-hidden="true" /> : null}
        {children}
      </div>
    </section>
  );
}
