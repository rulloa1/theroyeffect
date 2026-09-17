import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SpotlightStyle = CSSProperties & {
  "--x": string;
  "--y": string;
};

export function SpotlightCard({
  children,
  className,
  featured = false,
}: {
  children: ReactNode;
  className?: string;
  featured?: boolean;
}) {
  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  const style: SpotlightStyle = { "--x": "50%", "--y": "50%" };

  return (
    <div
      onMouseMove={handlePointerMove}
      style={style}
      className={cn(
        "group relative border transition-[border-color,box-shadow] duration-300",
        featured
          ? "border-[#FF3333] hover:border-[#FF3333] hover:shadow-[0_0_32px_rgba(255,51,51,0.16)]"
          : "border-white/10 hover:border-[#DFBA73]/50",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="spotlight-overlay pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(500px circle at var(--x) var(--y), rgba(223,186,115,0.10), transparent 65%)",
        }}
      />
      <div className="z-10 h-full">{children}</div>
    </div>
  );
}
