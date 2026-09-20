# Rebuild the About page

## What will change
- Add the requested resume, social, and contact constants to the shared site configuration. Null social/resume values will render nothing, so no dead links appear.
- Rebuild `/about` with the same architectural-noir structure as the homepage: shared portfolio header, dark surfaces, gold accents, typography, spacing, portrait treatment, and existing site-wide footer.
- Create the personal hero with a responsive social rail, Rory’s portrait, requested copy and facts, plus working `/book` and `/case-study` links.
- Add the concise “How I work” story and “Dirt, refined into gold” pull quote without invented claims.
- Add a four-card “What I do” section sourced from the existing shared pricing catalog, with each card linking to `/pricing`.
- Add the closing audit/discovery CTA matching the homepage’s closing treatment.
- Extend the shared footer contact area with LinkedIn/X icons only when their URLs are configured.

## SEO and accessibility
- Preserve the About page’s existing title, description, canonical, and social metadata.
- Add Person structured data using the canonical site URL and include `sameAs` only for configured social URLs.
- Give social links descriptive labels, safe external-link attributes, and keep decorative duplicated text hidden from assistive technology.

## Verification
- Run focused lint, TypeScript checks, and relevant tests.
- Check `/about` at desktop and 375px for layout, working links, hidden null links, the collapsed social row, and no horizontal scrolling.
- Keep all work preview-only; do not publish.
