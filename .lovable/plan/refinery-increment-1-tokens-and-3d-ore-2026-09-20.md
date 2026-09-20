# Refinery Increment 1: tokens and 3D Ore

## Scope
- Keep all homepage content, links, routes, forms, metadata, analytics, and lower-page structure unchanged.
- Keep this preview-only; do not publish.
- Add no packages. Use the installed Three.js dependency directly.
- Keep `ParticleBackground.tsx` because `/about` and `/book` still import it; remove only its homepage import and render.

## Implementation
1. **Refinery design tokens**
   - Add the requested color, easing, duration, and stagger custom properties to `:root` in `src/styles.css` without changing existing rules.
   - In only `src/routes/index.tsx`, `src/components/HeroContent.tsx`, and `src/components/PortfolioSections.tsx`, replace the specified hardcoded navy, gold, and red values with their new CSS variables.

2. **Vanilla Three.js Ore scene**
   - Create `src/components/refinery/RefineryScene.tsx` with a stable server-rendered CSS ember fallback and browser-only Three.js initialization.
   - Skip WebGL below 768px or whenever the existing heavy-effects guard fails.
   - Schedule the dynamic Three.js import with `requestIdleCallback`, falling back to a 200ms timer; cancel whichever scheduler was used on cleanup.
   - Size the renderer from its container with `ResizeObserver`, cap pixel density at 1.5, and keep its canvas decorative and non-interactive.
   - Build a one-time noise-displaced high-detail icosahedron. Extend `MeshPhysicalMaterial` through `onBeforeCompile` with matching vertex/fragment noise helpers and `uTime`, `uRefine`, and `uVeinGlow` uniforms so basalt transitions through thin gold veins toward a fully refined gold surface.
   - Use a local `RoomEnvironment`/PMREM reflection texture, exponential ground-colored fog, restrained warm/furnace lighting, one additive radial glow texture, and 600 shader-animated dust points.
   - Run one delta-time-aware animation loop for slow rotation, six-second vein breathing, shader dust time, and damped pointer tilt capped at two degrees.
   - Pause rendering when the hero is off-screen or the tab is hidden; resume without duplicate loops.
   - Dispose every created geometry, material, generated texture, environment resource, PMREM generator, renderer, observer, listener, and animation handle on unmount.

3. **Hero placement**
   - Mount the scene as an absolute `z-0` layer inside the hero’s right text column, framed in that column’s right third around 40% height.
   - Keep the current text at `z-10` and add only the requested left-to-right ground-raised readability fade between text and canvas.
   - Remove the full-page particle field from the homepage while leaving its use on `/about` and `/book` intact.

4. **WebGL guard cleanup**
   - Update `webglAvailable()` to release a successfully created test context with `WEBGL_lose_context` before returning.

## Validation
- Run formatting on changed files, focused lint, TypeScript checking, and the existing test suite.
- Use the live preview at 360, 768, 1440, and 1920 widths to verify no horizontal overflow and no browser console errors.
- Confirm 360px uses only the ember fallback; confirm desktop/tablet WebGL eligibility renders one visible Ore canvas, with the exact hero copy, portrait, buttons, targets, header, and lower sections preserved.
- Compare two desktop captures to confirm motion and verify reduced-motion/headless behavior keeps the static fallback with no Three.js request or canvas.
