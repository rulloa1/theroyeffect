# theroyeffect — workspace map

Marketing site + client portal for The Roy Effect. TanStack Start (React 19, Vite,
Tailwind v4), Supabase for data/auth/cron, deployed to Lovable hosting **and**
Cloudflare Workers. See `AGENTS.md` for the Lovable git rules — they are binding.

## Layout

| Where | What |
|---|---|
| `src/routes/` | Pages and API endpoints (file-based routing) |
| `src/components/` | UI — `portal/` and `admin/` are the authenticated surfaces |
| `src/lib/` | Server and shared logic, one folder per domain |
| `src/integrations/` | Supabase / Firebase / Lovable clients |
| `supabase/migrations/` | Schema **and** the pg_cron schedules |
| `docs/` | Voice agent spec, CI/error-tracking, Vapi setup |
| `docs/memory/` | The memory index and one-fact-per-file notes |
| `rubric-second-brain/` | Workspace map + the brain.js retrieval engine |

Departments the brain groups these into: **Site & Brand**, **Automation & CRM**,
**Voice Agent**, **Commerce**, **Platform** (catch-all).

## Finding things

- **brain recall FIRST (MANDATORY for stored facts)** — when the question is about a
  stored fact (decisions, prices, schedules, domains, settings, "what did we decide
  about X"), your FIRST tool call is
  `node rubric-second-brain/brain.js recall "question"` via Bash — before any Read or
  Grep. Answer from its output, citing the file; open the file it names only if the
  slice isn't enough. `node rubric-second-brain/brain.js ask "question"` builds the
  one-turn prompt with evidence attached and copies it to the clipboard — brain.js
  itself never invokes any API. If recall misses, fall through to grep.
- For code, grep `src/` directly. The brain indexes decisions, not implementations.

## Saving facts

**Saving facts (default):**
`node rubric-second-brain/brain.js store "fact" --type feedback|project|user|reference --name slug`
— writes the convention-correct memory file in `docs/memory/` **and** the index line in
one step, with zero exploration reads. Hand-write only when a memory needs rich
structure (a table, a Why, several links).

One fact per file. Keep `docs/memory/MEMORY.md` as the only hub index.

## The workspace map

```
node rubric-second-brain/server.js     # then open http://localhost:5210
```

Applications, Routines, Memory and Skills as one navigable graph, rebuilt from disk
on every load. Config lives in `rubric-second-brain/config/*.json` — edit those, not
the engine.
