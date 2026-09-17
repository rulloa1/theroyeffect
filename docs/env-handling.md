# Environment files: current state and why they are still tracked

## What this change did

Added an `.env*` ignore rule (with `!.env.example`) to `.gitignore`, plus
`.env.example` documenting every variable the code reads.

**A `.gitignore` rule does not untrack an already-tracked file.** So `.env`,
`.env.development`, `.env.staging` and `.env.production` are still committed and
every build still works exactly as before. This change is behaviour-neutral
today.

What it does prevent: a **new** env file — `.env.local`, `.env.secrets`, a
scratch copy — being committed by accident. That matters because
`vite.config.ts` calls `loadEnv(mode, cwd, "")` with an empty prefix, which
loads *every* variable in these files into `process.env`, not just `VITE_` ones.
Server code reads real secrets through that channel
(`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_LIVE_API_KEY`, `VAPI_SERVER_SECRET`,
`SLACK_API_KEY`, `LEADCONNECTOR_WEBHOOK_TOKEN`, …). None of those are in a
committed file today, and the rule is what keeps it that way.

## Why the tracked files were NOT removed

Removing them would break production, silently.

Vite loads `.env` in every mode and `.env.<mode>` on top. The deploy runs
`bun run build -- --mode production`, so the bundle's values come from `.env`
plus `.env.production`. Meanwhile `.github/workflows/deploy.yml` supplies only
three client variables of its own:

```yaml
VITE_APP_ENV:     ${{ env.TARGET_ENV }}
VITE_APP_RELEASE: ${{ github.sha }}
VITE_SENTRY_DSN:  ${{ secrets.SENTRY_DSN }}
```

Everything else the browser needs comes from the committed files:

| Variable | Comes from | Supplied by CI? |
|---|---|---|
| `VITE_SUPABASE_URL` / `_PUBLISHABLE_KEY` / `_PROJECT_ID` | `.env` | no |
| `VITE_FIREBASE_*` (7 vars) | `.env.production` | no |
| `VITE_VAPI_ASSISTANT_ID` / `_PUBLIC_KEY` | `.env.production` | no |
| `VITE_PAYMENTS_CLIENT_TOKEN` | `.env.production` | no |

Delete the files and those inline as `undefined`. **The build still succeeds** —
Vite does not fail on a missing `VITE_` var — and the deploy goes out green
while Supabase, Firebase, the Vapi concierge and checkout are all broken at
runtime. That is the worst shape of failure: green pipeline, dead site.

## Migration path, if you want them untracked

In this order, not in one step:

1. Add each client variable above as a GitHub Actions **variable** under the
   `staging` and `production` Environments. They are public-by-design values
   inlined into the browser bundle, so they are variables, not secrets.
2. Add them to the `env:` block of the Build step in `deploy.yml`.
3. Confirm how **Lovable** supplies these for its own builds — this repo is
   Lovable-connected and builds there too. If Lovable relies on the committed
   files, it needs its own configuration before the files can go. *This is the
   open question; it was not verified.*
4. Deploy to **staging** and confirm Supabase auth, Firebase, the voice widget
   and checkout all work in the deployed bundle. Not just that the build passed.
5. Only then `git rm --cached .env .env.development .env.staging .env.production`.

## On history

Untracking does not remove the values from git history, and `AGENTS.md` forbids
rewriting published history in this Lovable-connected repo. That is an accepted
limit rather than a gap: every value in the committed files is publishable by
design — `VITE_`-prefixed variables ship inside the browser bundle, and the
Supabase key is the publishable one. If a genuine secret is ever found in
history, the remedy is **rotating the credential**, not rewriting history.

The values in the committed files were not read while preparing this document —
only their key names — so "publishable by design" is an inference from naming
and from how each variable is used, not a verified audit of every value. A quick
manual look at `.env` is worth doing to confirm nothing sensitive was ever
pasted into a `VITE_` variable.
