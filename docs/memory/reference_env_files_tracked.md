---
name: env-files-tracked
description: Env files (.env, .env.development, .env.staging, .env.production) are tracked in git on purpose for now: Vi...
metadata:
  type: reference
---

Env files (.env, .env.development, .env.staging, .env.production) are tracked in git on purpose for now: Vite inlines VITE_* at build time and deploy.yml supplies only VITE_APP_ENV, VITE_APP_RELEASE and VITE_SENTRY_DSN, so untracking them would build green and break Supabase, Firebase, Vapi and checkout at runtime. See docs/env-handling.md for the migration order.

*Saved 2026-09-17 via brain store.*
