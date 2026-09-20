# Increment 5 — Refinery foundations

## Scope
Homepage-only design-system cleanup. Preserve all copy, routes, forms, metadata, integrations, motion timing, easing, stagger values, reduced-motion behavior, and RefineryScene behavior. Preview only; do not publish.

## Implementation
1. **Typography loading and hierarchy**
   - Update the root font request to load Space Grotesk 500/700, Archivo 400–700, and IBM Plex Mono 400/500/600/700.
   - Because `font-display` is still used outside the homepage, retain its Anton token and keep Anton in the request.
   - Use Space Grotesk for portfolio display text, Archivo for portfolio body text, and update the base heading family/tracking.

2. **Unified warm surface and ink tokens**
   - Make the warm near-black ground and raised card surface the global background/card values.
   - Add sunk-ground, faint-ink, fluid type, gutter, and section-spacing tokens; tie foreground, borders, and selection to the Refinery palette.
   - Replace homepage hardcoded colors and pure-white content text with semantic ink/gold/furnace/ground tokens, while preserving the gold finale’s correct dark-on-gold treatment.

3. **Hero word spacing**
   - Move headline separators outside each overflow mask so every word remains visibly separated at every breakpoint.

4. **Consistent type and spacing rhythm**
   - Apply the shared fluid display, section-heading, subheading, lead, gutter, and vertical-spacing tokens throughout homepage sections.
   - Constrain long paragraph measures to approximately 68 characters without altering their copy.

5. **Restrained furnace accent**
   - Remove decorative red from the work/audit block and design-philosophy eyebrow.
   - Keep furnace red only for the single primary action per viewport and text selection.

## Validation
- Run focused lint, TypeScript checking, and the full test suite.
- Check 360, 768, 1440, and 1920 widths for headline spacing, horizontal overflow, visible focus states, motion-pause/reduced-motion behavior, and console errors.
- Confirm no hardcoded hex colors remain in homepage components and record the completed increment in the roadmap.
