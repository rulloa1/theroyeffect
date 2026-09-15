---
name: deploy-targets
description: The site ships to two places - Lovable hosting and Cloudflare Workers - from the same build.
metadata:
  type: reference
---

The site ships to **two** targets from the same `vite build` output:

- **Lovable hosting** — https://theroy3ffect.lovable.app, updated whenever commits land on the connected branch.
- **Cloudflare Workers** — `wrangler.toml` defines `theroyeffect-staging` and `theroyeffect-production`; `.github/workflows/deploy.yml` deploys `staging` → staging worker and `main` → production worker, with `workflow_dispatch` for manual runs.

The Cloudflare side is described in `wrangler.toml` as a **mirror** of the Lovable-hosted site, built through the nitro cloudflare preset.

**Why:** two hosts means a change is not "live" until you know which URL someone means.

*Source: wrangler.toml, .github/workflows/deploy.yml, README.md*
