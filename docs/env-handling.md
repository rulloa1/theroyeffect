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
loads _every_ variable in these files into `process.env`, not just `VITE_` ones.
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
VITE_APP_ENV: ${{ env.TARGET_ENV }}
VITE_APP_RELEASE: ${{ github.sha }}
VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

Everything else the browser needs comes from the committed files:

| Variable                                                 | Comes from                | Supplied by CI? | Populated today?                             |
| -------------------------------------------------------- | ------------------------- | --------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL` / `_PUBLISHABLE_KEY` / `_PROJECT_ID` | `.env`                    | no              | yes                                          |
| `VITE_VAPI_ASSISTANT_ID` / `_PUBLIC_KEY`                 | `.env`, `.env.production` | no              | yes                                          |
| `VITE_PAYMENTS_CLIENT_TOKEN`                             | `.env.production`         | no              | yes                                          |
| `VITE_FIREBASE_*` (7 vars)                               | `.env`, `.env.production` | no              | **partly — the API key is blank, see below** |

Delete the files and those inline as `undefined`. **The build still succeeds** —
Vite does not fail on a missing `VITE_` var — and the deploy goes out green
while Supabase, the Vapi concierge and checkout are all broken at runtime. That
is the worst shape of failure: green pipeline, dead site.

### Firebase is not part of the risk

Five of the seven Firebase variables are populated, but the two that matter are
not: `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_MEASUREMENT_ID` are set to the
empty string (literally `""`) in **all four tracked files**. Vite strips the
quotes, so both reach the bundle as a zero-length string. Since the API key is
required, Firebase is already inert, and untracking the files would not change
that:

- `integrations/firebase/config.ts` validates the config with
  `apiKey: z.string().min(1)`. With the key empty, `getFirebaseConfig()`
  `safeParse`s to a failure, logs `[Firebase] Client config incomplete`, and
  returns `null`; `initializeFirebase()` then returns `null` and
  `getFirebaseAuth()` / `getFirebaseFirestore()` throw
  "Firebase is not initialized."
- Everything downstream of that null is therefore a no-op. `FirebaseProvider`
  (`src/routes/__root.tsx`) calls `startFirebaseAnalytics()`, which returns
  `null` on the same failed config, and **eight components and routes** now call
  `trackAnalyticsEvent` — `SiteHeader`, `SiteFooter`, `PortfolioHeader`,
  `PortfolioSections`, `PortfolioWorkGallery`, `HeroContent`,
  `ClosingMarqueeCta` and `routes/audit.tsx`. None of them records anything
  today. Nothing outside the `integrations/firebase` barrel calls
  `getFirebaseAuth` / `getFirebaseFirestore`, so there is no auth or Firestore
  dependency on Firebase — only this silent analytics surface.
- `src/firebase.ts` is a second, older config path that initializes
  unconditionally with the empty key. Nothing imports it — it is dead code and a
  reasonable cleanup candidate.

So the blocker for untracking is **Supabase, Vapi and the payments token**, not
Firebase. Verify those three in step 4 below; Firebase needs its keys filled in
before it can be verified at all, which is separate work.

That separate work is worth scheduling on its own merits: the analytics calls are
already in place across eight surfaces, so filling in `VITE_FIREBASE_API_KEY`
would switch on the tracking those calls were written for. Until then the site is
paying the import cost and recording nothing.

## Migration path, if you want them untracked

In this order, not in one step:

1. Add each client variable above as a GitHub Actions **variable** under the
   `staging` and `production` Environments. They are public-by-design values
   inlined into the browser bundle, so they are variables, not secrets.
2. Add them to the `env:` block of the Build step in `deploy.yml`.
3. Confirm how **Lovable** supplies these for its own builds — this repo is
   Lovable-connected and builds there too. If Lovable relies on the committed
   files, it needs its own configuration before the files can go. _This is the
   open question; it was not verified._
4. Deploy to **staging** and confirm Supabase auth, the voice widget and checkout
   all work in the deployed bundle. Not just that the build passed. (Firebase
   cannot be verified either way — its keys are blank today; see above.)
5. Only then `git rm --cached .env .env.development .env.staging .env.production`.

Step 3 remains the one unverified item. Steps 1, 2 and 4 are mechanical; step 3
needs an answer from the Lovable side before step 5 is safe.

## On history

Untracking does not remove the values from git history, and `AGENTS.md` forbids
rewriting published history in this Lovable-connected repo. That is an accepted
limit rather than a gap: every value in the committed files is publishable by
design — `VITE_`-prefixed variables ship inside the browser bundle, and the
Supabase key is the publishable one. If a genuine secret is ever found in
history, the remedy is **rotating the credential**, not rewriting history.

### Audit of the committed values

An earlier revision of this document noted that only key _names_ had been
checked, so "publishable by design" was an inference. That audit has now been
done, across all four tracked files. Each value was classified rather than
transcribed, so no value was copied out of the repo:

| Check                                                                                                                                           | Result                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Supabase keys (`SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`)                                                                     | `sb_publishable_…` — the publishable key, in both cases                                                                        |
| Any privileged Supabase credential (`sb_secret_…`, or a JWT whose `role` claim is not `anon`)                                                   | none                                                                                                                           |
| Secret-shaped values (`sk_live`, `sk_test`, `rk_live`, `whsec_`, PEM private keys, anything matching `service_role` / `secret` / `private_key`) | none                                                                                                                           |
| Remaining values                                                                                                                                | opaque public config (project ids, URLs, Firebase ids, Vapi public key / assistant id, the payments **client** token) or empty |

Method: each `KEY=value` line was read and reduced to a category — JWTs were
base64-decoded far enough to report the `role` claim only. This confirms nothing
sensitive has been pasted into a `VITE_` variable, so **no credential rotation is
needed** on account of these files.

This narrows the reason for untracking them: it is repo hygiene against a
_future_ mistake, not remediation of a current exposure. The `.env*` ignore rule
already covers the future mistake, which is why the tracked files are not urgent.

Two caveats on scope. The audit classifies by shape and prefix, so a value that
is secret but looks like ordinary config would not be caught — `VITE_PAYMENTS_CLIENT_TOKEN`
is judged publishable from its name, its `VITE_` prefix (it ships in the bundle
regardless) and the separate `PAYMENTS_*_WEBHOOK_SECRET` entries in
`.env.example`, not from inspecting the token itself. And it says nothing about
values in older commits; it covers the files as they stand.
