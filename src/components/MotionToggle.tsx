import { Pause, Play } from "lucide-react";
import { useMotionPaused, setMotionPaused } from "@/lib/motion-preference";

export function MotionToggle({ className = "" }: { className?: string }) {
  const paused = useMotionPaused();

  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={() => setMotionPaused(!paused)}
      className={`motion-toggle inline-flex min-h-11 items-center gap-2 font-mono text-xs text-white/60 transition-colors hover:text-[var(--gold)] ${className}`}
    >
      {paused ? (
        <Play className="size-3.5" aria-hidden />
      ) : (
        <Pause className="size-3.5" aria-hidden />
      )}
      {paused ? "Resume motion" : "Pause motion"}
    </button>
  );
}
