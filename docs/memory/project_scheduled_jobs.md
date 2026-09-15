---
name: scheduled-jobs
description: Two hourly pg_cron jobs run in Supabase - follow-up autopilot at :17 and prospect CRM sync at :47.
metadata:
  type: project
---

Scheduled work runs as **pg_cron inside Supabase**, not as GitHub Actions and not on a VPS. Each job calls a private trigger function that POSTs to a public automation endpoint with a shared token held in `private.automation_config`.

| Job | Schedule | Endpoint |
|---|---|---|
| `followup-autopilot-hourly` | `17 * * * *` | `/api/public/automation/followups` |
| `prospect-crm-sync-hourly` | `47 * * * *` | `/api/public/automation/prospect-sync` |
| `gsc_index_watch` | **not in any migration** | `/api/public/automation/gsc-index-watch` |

The GSC index watch has its job row (`automation_jobs`), its trigger function `private.trigger_gsc_index_watch()` and its endpoint in the repo, but no `cron.schedule` call — its cadence was set outside migrations. Verify it in the Supabase dashboard.

The follow-up handler is bounded, single-flight, idempotent and self-pausing on billing blocks, and also sweeps pending onboarding as a safety net for purchases the Stripe webhook could not finish.

*Source: supabase/migrations/20260822060858_*.sql, 20260822075713_*.sql, 20260823074041_*.sql, src/routes/api/public/automation/*.ts*
