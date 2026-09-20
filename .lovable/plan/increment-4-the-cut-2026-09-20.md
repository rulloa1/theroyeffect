# Increment 4 — The Cut

## Goal
Add one interactive before/after concept-study section between the homepage introduction and Selected Work, without changing any existing section copy, links, SEO, forms, or behavior. Keep this preview-only.

## Implementation

1. **Add the supplied images as project assets**
   - Upload `cut-before.webp` and `cut-after.webp` through the existing CDN asset workflow.
   - Store only their generated asset-pointer files in `src/assets/` and import those pointers in the new section.
   - Preserve the supplied 1440×900 dimensions and use the exact descriptive alt text.

2. **Build `TheCut` comparison section**
   - Create `src/components/refinery/TheCut.tsx` and mount it in `src/routes/index.tsx` directly after the homepage introduction and before Selected Work.
   - Use the existing Refinery typography, tokens, spacing, veil, borders, and focus treatment.
   - Include the exact supplied label, heading, instruction, Before/After tags, and visible fictional concept-study disclosure; add no CTA or performance claims.
   - Reserve a 16:10 frame before image load to prevent layout shift.

3. **Implement accessible comparison controls**
   - Stack both images and reveal the redesign with `clip-path`, with the seam and handle moving by `transform` only.
   - Support press-to-jump, pointer capture, mouse/touch dragging, and `touch-action: pan-y` so vertical mobile scrolling remains available.
   - Give the handle the requested slider semantics, live value text, Arrow/Shift+Arrow/Home/End controls, and the site’s gold focus ring.
   - Apply the release settling curve without changing layout.

4. **Respect motion preferences**
   - Use the existing persisted pause hook and reduced-motion detection.
   - Run the one-time 50→42→50 entrance hint only after the section first enters view and only when motion is allowed.
   - Add the fine-pointer-only “Drag” cursor pill with requestAnimationFrame interpolation; hide it for touch, reduced motion, and paused motion.
   - Make seam changes immediate when motion is paused or reduced.

5. **Connect the comparison to the Ore**
   - Add `cut` to the existing Refinery chapter list with the exact position, scale, dim, spin, lighting, and camera targets.
   - Emit a lightweight `refinery:seam` custom event from `TheCut` without rerendering the Three.js scene.
   - While `cut` is active, drive the Ore refinement target from seam percentage; otherwise retain each chapter’s existing refinement target.
   - Render one still frame for seam changes while motion is paused, preserving the single-canvas lifecycle and existing cleanup.

6. **Validate**
   - Run focused lint, TypeScript checks, and the complete test suite.
   - Browser-test mouse drag, click-to-jump, touch drag with vertical scrolling, all keyboard controls, paused/reduced-motion behavior, the one-time hint, cursor pill, Ore refinement, and console errors.
   - Check 360, 768, 1440, and 1920 widths for horizontal overflow, image scaling, visible concept disclosure, and reserved frame dimensions.
   - Do not publish.

## Files
- Add `src/assets/cut-before.webp.asset.json`
- Add `src/assets/cut-after.webp.asset.json`
- Add `src/components/refinery/TheCut.tsx`
- Update `src/routes/index.tsx`
- Update `src/components/refinery/RefineryScene.tsx`
- Update `src/styles.css` only for focused slider/motion styles that cannot be expressed cleanly with existing utilities
- Update `roadmap.md` with this increment
