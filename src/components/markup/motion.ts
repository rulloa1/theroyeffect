/**
 * The Markup's motion gate.
 *
 * `html.mk-motion` is set by the root head script before first paint, and only
 * when the visitor neither prefers reduced motion nor has paused motion. Every
 * hidden starting state in markup.css hangs off that class, so if scripts fail
 * nothing is left invisible. Effects read the class instead of React state so
 * there is no first-render guess.
 */
export function motionAllowedNow(): boolean {
  if (typeof document === "undefined") return false;
  const html = document.documentElement;
  return html.classList.contains("mk-motion") && html.dataset.motion !== "paused";
}

/** Keep the class in step when the visitor toggles "Pause motion". */
export function syncMotionClass(paused: boolean) {
  const html = document.documentElement;
  if (paused) html.classList.remove("mk-motion");
  else if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) html.classList.add("mk-motion");
}

/** Inline head script — runs before paint. Mirrors lib/motion-preference's storage key. */
export const MK_MOTION_HEAD_SCRIPT =
  "(function(){try{var h=document.documentElement;var p=localStorage.getItem('tre:motion-paused')==='true';if(p){h.setAttribute('data-motion','paused');}else if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){h.classList.add('mk-motion');}}catch(e){}})();";
