# `.claude/` — agent tooling for this repo

## n8n-skills (vendored)

`skills/*-official/` and `hooks/` are the **n8n-io/skills** pack, v1.2.0,
vendored from https://github.com/n8n-io/skills (Apache-2.0 — full licence text
in `hooks/LICENSE-n8n-skills-Apache-2.0.txt`). Fourteen skills plus a hooks
enforcement layer that teach Claude to build production-grade n8n workflows.

### Which MCP server these pair with

The **official n8n instance-level MCP server** — n8n 2.2.0+, *Settings →
Instance-level MCP*, served at `https://<your-n8n>/mcp-server/http`. The skills
teach that server's tool surface: `create_workflow_from_code`, `update_workflow`,
`get_node_types`, `validate_workflow`, `test_workflow`, `execute_workflow`,
`publish_workflow`, `get_workflow_sdk_reference`.

They are **not** for the community `n8n-mcp` server (czlonkowski/n8n-mcp), whose
tools are named differently (`n8n_create_workflow`, `n8n_update_partial_workflow`,
`get_node`, `n8n_instances`, …). The community pack at
`czlonkowski/n8n-skills` targets that one instead. Mixing them gives Claude
guidance for tools that do not exist on the connected server.

### Why this is vendored instead of installed as a plugin

Upstream ships as a Claude Code plugin, where hooks resolve through
`${CLAUDE_PLUGIN_ROOT}`. Vendored in a repo there is no plugin root, so the
hooks are registered in `settings.json` with `${CLAUDE_PROJECT_DIR}` paths.

The layout is deliberate: `session-start.sh` falls back to
`$(dirname "$0")/..` for its root, which resolves to `.claude/`, so
`.claude/skills/using-n8n-skills-official/SKILL.md` is found with no
environment variable set. Keep `hooks/` and `skills/` as siblings under
`.claude/` or that fallback breaks (silently — the hook fails open).

The `PreToolUse` scripts locate `_emit.sh` via `$(dirname "$0")`, so they only
need to stay siblings of it.

### What the hooks do

| Event | Matcher | Effect |
|---|---|---|
| `PreToolUse` | `get_node_types`, `create_workflow_from_code`, `update_workflow`, `validate_workflow`, `execute_workflow`, `test_workflow` | One-shot reminder pointing at the relevant skill |
| `PostToolUse` | `validate_workflow` | Follow-up guidance on reading validation output |

`PreToolUse` reminders fire **once per session per marker**, deduped via marker
files in `$TMPDIR/n8n-skills-state/`. These cost nothing until an n8n MCP tool
is actually called.

### SessionStart is deliberately NOT registered

Upstream also ships a `SessionStart` hook that injects the router skill
(`using-n8n-skills-official`) into **every** session. It is not registered in
`settings.json` here: this repo is a marketing site with no n8n in it, so that
hook would spend context on n8n guidance in every unrelated session.

`hooks/session-start.sh` is still vendored, so re-enabling is just adding this
block back to `.claude/settings.json`:

```json
"SessionStart": [
  {
    "matcher": "startup|resume|clear|compact",
    "hooks": [
      { "type": "command", "command": "\"${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.sh\"" }
    ]
  }
]
```

One consequence of leaving it off: that script is also what wipes the
`PreToolUse` dedup markers on `clear`/`compact`. Without it, each reminder
fires only once per session even after a compaction has dropped it from
context. The skills themselves are unaffected — they load on relevance like
any other skill.

Every hook script fails open — it exits 0 and emits nothing rather than
blocking a tool call. `jq` is preferred, `python3` is the fallback; with
neither, hooks no-op.

### Note for this repo specifically

`theroyeffect` does not use n8n — its scheduled work is Supabase `pg_cron`
(see `docs/memory/project_scheduled_jobs.md`). These skills are installed for
workspace-level n8n work, not because this codebase needs them. With
`SessionStart` unregistered they carry no always-on context cost.

### Updating

Re-clone upstream and re-copy `skills/` and `hooks/`, then re-check that
`hooks/hooks.json` upstream has not added or renamed a hook that
`settings.json` here needs to mirror. The upstream `hooks.json` is deliberately
**not** vendored, so `settings.json` stays the single source of truth.
