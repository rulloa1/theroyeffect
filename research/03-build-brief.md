# 03 — Build brief: Emblem scroll-stop

## Landing pattern
Keep the existing page. Insert one new section directly after the hero: **"The Effect, layer by layer."** A sticky canvas plays the emblem breaking apart as you scroll, with four annotation cards that snap-hold at each layer. Then the existing Services section continues.

Why: competitors list services in grids; none has a signature object (02). The emblem already carries brand recall.

## Layer → message map (annotation cards, real copy)
| Frame range | Layer lifting off | Card |
|---|---|---|
| 0–20% | Whole seal | **01 · Strategy** — "Every build starts with what your customers need to hear." |
| 20–45% | Crimson outer ring | **02 · Websites** — "A site designed to be remembered and built to convert." |
| 45–70% | Gold "Stand out online" arc | **03 · AI** — "Voice and chat agents that answer when you can't." |
| 70–100% | R monogram floats forward | **04 · Automation** — "Follow-up that runs itself, so no lead goes cold." |

## Design system (from 00-state)
Space Grotesk / Archivo / IBM Plex Mono · #0a0a0a bg · #ff3333 accent · #dfba73 gold · glass cards (blur 20px, 20px radius, ink 12% border).

## Motion tier
Tier 3 (scroll-scrubbed frame sequence). 120 frames, JPEG q2, <100KB each, 1920w. Section height 350vh desktop / 300vh tablet / 250vh phone. Snap-hold 500ms per card. Reduced motion → static final frame plus the four cards as a list.

## Card scanner (opted in)
Placed after Selected Work: a Three.js particle field that "scans" a glass card bearing each service name. Three.js is already installed. Lazy-loaded, off for reduced motion and bots.

## Sections NOT added from the template
Starscape, loader, scroll progress bar, pill navbar, specs count-up, features grid — the homepage already has its own nav, hero, and service sections. **Specs count-up is dropped on purpose: there are no honest numbers to count.**

## Decisions that are expensive to reverse
1. **White-background frames on a dark site.** The pipeline needs prompt images on pure white. I'll show the animation inside a bright "light-table" panel framed by the dark page, rather than trying to cut the white out. Alternative: generate on black instead, which breaks the pipeline's rule but blends seamlessly. Your call.
2. **Placement right after the hero**, pushing Services lower.
3. **No stats section.**

## Conversion
CTAs unchanged: Start Your Project (/brief), Explore My Work (/work). The last card ends with a small "Start Your Project" link.
