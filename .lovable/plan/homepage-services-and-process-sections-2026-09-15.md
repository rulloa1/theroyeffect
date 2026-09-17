# Homepage services and process sections

## Scope
- Add a new `ServicesSection` component after the homepage work section and before the approval promise.
- Render all four entries from `SERVICES`, including their existing names, summaries, and starting prices.
- Link each service card to its confirmed matching anchor on `/services#<slug>`.
- Adapt the requested card treatment to the existing navy, gold, red, square-cornered visual system, with a subtle diagonal texture and Lucide icons.
- Add a new `ProcessTimeline` component immediately before homepage pricing.
- Render all five `PROCESS_STEPS` entries verbatim on a responsive vertical rail that ends at step 05.
- Use the existing `ScrollReveal` behavior for both sections; its current reduced-motion handling will remain intact.
- Leave the header Services link pointing to `/services`, since it already targets the real services page rather than a homepage anchor.
- Do not alter pricing, existing copy, the GHL widget, legal links, or publishing state.

## Technical details
- Reuse `src/lib/site-content.ts` directly; no content duplication or schema changes are needed.
- Use semantic links and ordered-list markup, with mobile gutters sized to avoid horizontal overflow at 375px.
- Add the two sections to `src/routes/index.tsx` in the requested order.
- Track the two preview-only tasks in the existing roadmap.

## Verification
- Run formatting, targeted lint, TypeScript checks, and the existing test suite.
- Inspect the homepage at 1280px and 375px.
- Confirm both sections render all required entries, service links resolve to real anchors, the timeline rail stops at step 05, and neither viewport has horizontal scrolling.
- Do not publish.
