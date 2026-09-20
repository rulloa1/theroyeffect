# Memory Index

The hub index for this workspace. **One fact per file**, typed filename prefixes
(`project_`, `reference_`, `user_`, `feedback_`), one pointer line each.

Sessions read this file first. `node rubric-second-brain/brain.js recall "question"`
scores these lines, opens only the winner, and serves the matching section —
no model call, no token cost.

To add a fact:

```
node rubric-second-brain/brain.js store "the fact" --type reference --name some-slug
```

That writes the file and the pointer line in one step. Hand-write only when a
fact needs rich structure (a table, a Why, several links).

## Project

- [Brain Runs Commonjs](project_brain_runs_commonjs.md) — 2026-09-15 The brain engine is vendored at rubric-second-brain/ and runs CommonJS via its own package.json, because th...
- [Scheduled Jobs](project_scheduled_jobs.md) — 2026-09-15 Two hourly pg_cron jobs run in Supabase — follow-up autopilot at :17 and prospect CRM sync at :47.
- [Ci Gates](project_ci_gates.md) — 2026-09-15 CI lint reports but does not block; typecheck and tests are the hard gates.

## Reference

- [Deploy Targets](reference_deploy_targets.md) — 2026-09-15 The site ships to two places — Lovable hosting and Cloudflare Workers — from the same build.
- [Ghl Lead Sync](reference_ghl_lead_sync.md) — 2026-09-15 Inbound leads sync to GoHighLevel through a workflow webhook; unset secret skips the sync silently.
- [Lovable Git Rule](reference_lovable_git_rule.md) — 2026-09-15 Never rewrite published git history — this repo is Lovable-connected and rewriting loses project history.
- [Site Mcp Server](reference_site_mcp_server.md) — 2026-09-15 The site hosts its own MCP server at /mcp, OAuth-protected through Supabase auth.
- [Ai Provider Order](reference_ai_provider_order.md) — 2026-09-15 Drafting prefers the Lovable AI Gateway and falls back to direct Gemini only when the gateway key is absent.
- [Email Sender Domains](reference_email_sender_domains.md) — 2026-09-15 Transactional email sends from notify.theroyeffect.com; the From header shows theroyeffect.com.

## User

_Preferences and working style — nothing filed yet._

## New / Unsorted (filed by brain store — sort into a section when touched)
- [Refinery Motion System](refinery_motion_system.md) — 2026-09-20 Refinery homepage motion uses choreographed transform/opacity entrances, magnetic CTAs, gold focus rings, a...
