# Increment 3 — Homepage Refinery Chapters

## Scope
- Keep this preview-only and preserve all existing copy, links, images, metadata, forms, integrations, and the `/about` and `/book` page layouts.
- Apply the footer background correction globally, as requested.

## Build
1. **Single homepage Ore layer**
   - Move the existing Refinery scene out of the hero content and mount it once as a fixed, full-viewport, non-interactive layer inside the homepage `<main>`.
   - Keep all content sections above it and retain the existing ember fallback in the hero text area for mobile, bots, reduced motion, and unavailable WebGL.
   - Preserve the hero readability gradient and give the portrait column an opaque raised-ground background.

2. **Translucent chapter panels**
   - Add `--veil-raised`, `--veil-ground`, and `--veil-hero` tokens with the specified values.
   - Convert only the requested homepage section surfaces to those veil tokens; keep the contact band fully opaque gold and keep nested media/cards appropriately opaque where required.
   - Measure text contrast against the brightest Ore output and increase only the affected veil opacity if any body text falls below 4.5:1.

3. **Scroll-driven chapter state**
   - Tag hero, work, services, philosophy, about, and contact sections with their requested chapter names.
   - Observe the viewport centre to select the active chapter and smoothly interpolate position, scale, dimming, refinement, rotation, lighting, camera depth, glow, and dust using frame-rate-independent smoothing equivalent to factor `0.08` at 60fps.
   - Add keyboard/pointer-aware service-row state so the seven existing rows rotate the Ore to the indexed angle without changing their content or purpose.
   - Play the one-time contact-band press on entry, preserve ±2° pointer tilt, and stop rendering when the footer is visible.

4. **Lifecycle and pause behavior**
   - Build and dispose the Three.js scene exactly once per mount; keep pause and active chapter in refs rather than effect dependencies.
   - Stop and resume the single animation loop for page visibility, footer visibility, and the persisted motion preference.
   - While paused, chapter or service-row changes snap to target values and render one still frame without rebuilding.
   - Preserve the 1.5 pixel-ratio cap, viewport resize behavior, complete disposal, and explicit WebGL context release.

5. **Footer and validation**
   - Replace the footer’s old purple-black background with opaque `var(--ground)` everywhere.
   - Run formatting, focused lint, typecheck, and the complete test suite.
   - Browser-check 360, 768, 1440, and 1920 widths for overflow and errors; verify mobile/headless/reduced-motion fallbacks, desktop chapter transitions, service-row rotation, contact press, footer stop, pause/resume without canvas replacement, keyboard focus, and measured contrast.

## Expected changed files
- `src/routes/index.tsx`
- `src/components/HeroContent.tsx`
- `src/components/refinery/RefineryScene.tsx`
- `src/components/PortfolioSections.tsx`
- `src/components/PortfolioWorkGallery.tsx`
- `src/components/SiteFooter.tsx`
- `src/styles.css`
- `roadmap.md`
