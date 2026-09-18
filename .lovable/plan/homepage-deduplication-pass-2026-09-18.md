# Homepage deduplication pass

## Scope
- Remove the homepage Services block while preserving the standalone `/services` route; point the header Services link and `#services` alias to the homepage Pricing section.
- Keep the Pricing component and checkout behavior intact, but on the homepage add each matching service summary and limit visible feature bullets to four.
- Reduce the approval promise to its animated headline and paragraph, keeping only one accessible text layer.
- Remove repeated hero audit, positioning, Houston, and stat copy; simplify duplicate section labels.
- Merge the audit and discovery-call blocks into one two-path section, keeping the useful audit details and discovery bullets.
- Remove the homepage footer CTA pair and the repeated Houston closing line while retaining footer navigation, contact, legal links, and client sign-in.
- Rewrite only the Houston paragraph’s repeated price sentence into local, factual service-area copy.

## Technical details
- Preserve all routes, forms, payment modal behavior, metadata, GHL wiring, motion guards, and the existing visual system.
- Keep `/pricing` content unchanged by applying service-summary and four-bullet presentation only in homepage mode.
- Give the existing Pricing section both usable `#services` and `#pricing` landing targets without duplicate IDs.
- Make footer CTA visibility route-aware so non-homepage pages are unaffected.

## Verification
- Run focused lint, TypeScript checks, and existing tests.
- Check 1280px and 375px layouts for content, working anchors, motion-safe rendering, and no horizontal overflow.
- Compare rendered homepage height before and after and report the approximate reduction.
- Do not publish.
