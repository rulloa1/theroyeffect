# `.claude/` — agent tooling for this repo

## n8n skills — TWO packs are installed

| | Official | Community |
|---|---|---|
| Source | [n8n-io/skills](https://github.com/n8n-io/skills) v1.2.0 | [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) v1.34.0 |
| Licence | Apache-2.0 (`hooks/LICENSE-n8n-skills-Apache-2.0.txt`) | MIT (`hooks/community/LICENSE-n8n-mcp-skills-MIT.txt`) |
| Skills | 14, all named `*-official` | 15, unsuffixed |
| Hook scripts | `hooks/` | `hooks/community/` |
| Pairs with | official instance-level n8n MCP server | community `n8n-mcp` server |

The community pack was installed at the maintainer's explicit request after
the server mismatch below was flagged. Both are vendored; both are wired.

### The two servers, and why matchers are server-scoped

The packs teach **different, largely non-overlapping tool surfaces**:

- **Official server** (n8n 2.2.0+, *Settings → Instance-level MCP*, at
  `https://<your-n8n>/mcp-server/http`): `create_workflow_from_code`,
  `update_workflow`, `get_node_types`, `validate_workflow`, `test_workflow`,
  `execute_workflow`, `publish_workflow`, `get_workflow_sdk_reference`.
- **Community server** (czlonkowski/n8n-mcp): `n8n_create_workflow`,
  `n8n_update_partial_workflow`, `get_node`, `n8n_instances`,
  `n8n_manage_credentials`, `n8n_autofix_workflow`, `tools_documentation`.

Of the 15 tools the community skills reference most, only `search_nodes` and
`validate_workflow` exist on the official server. So each pack's guidance is
wrong for the other's server.

**This is why the hook matchers name their server explicitly** rather than
using upstream's `^mcp__.*__<tool>$` wildcard:

```
official   ^mcp__n8n__<tool>$
community  ^mcp__n8n-mcp__<tool>$
```

Without that, `validate_workflow` — the one tool both servers expose — would
fire both packs' hooks on a single call, injecting two contradictory sets of
guidance.

> **If you rename either MCP server, update the matchers in `settings.json`
> to match.** A matcher naming a server that isn't connected is simply inert;
> a stale one means the hooks silently stop firing. The server names assumed
> here are `n8n` (official, currently connected) and `n8n-mcp` (community,
> the name in that pack's own `.mcp.json.example`).

### Routing between the two packs

Both packs' skills are visible to Claude at once, and their descriptions
overlap in subject (expressions, error handling, subworkflows, agents…) while
differing in target server. The hooks disambiguate at tool-call time, but for
non-tool work — designing a flow, writing an expression — **nothing
mechanically prevents Claude reaching for the wrong pack's skill.** The
reliable signal is the suffix: `*-official` skills are for the official
server, unsuffixed ones for the community server. Say which server you are
targeting when the answer matters.

### Why this is vendored instead of installed as a plugin

Upstream ships as a Claude Code plugin, where hooks resolve through
`${CLAUDE_PLUGIN_ROOT}`. Vendored in a repo there is no plugin root, so the
hooks are registered in `settings.json` with `${CLAUDE_PROJECT_DIR}` paths.

The layout is deliberate:

- The **official** `session-start.sh` falls back to `$(dirname "$0")/..` for
  its root, which resolves to `.claude/`, so
  `.claude/skills/using-n8n-skills-official/SKILL.md` is found with no
  environment variable set. Keep `hooks/` and `skills/` as siblings under
  `.claude/` or that fallback breaks (silently — the hook fails open). This is
  why the official hooks sit at `hooks/` rather than being moved into a
  `hooks/official/` subdirectory for symmetry with the community pack.
- The **community** pack lives entirely under `hooks/community/` because
  seven of its script filenames are identical to the official pack's
  (`get-node.sh`, `create-workflow.sh`, `update-workflow.sh`,
  `validate-workflow.sh`, `test-workflow.sh`, `_emit.sh`,
  `post-tool-use/validate-workflow.sh`). Copying them side by side would have
  silently overwritten the official ones.
- `PreToolUse` scripts locate `_emit.sh` via `$(dirname "$0")`, so each pack's
  scripts only need to stay siblings of their own `_emit.sh`. They do.
- The two packs write dedup markers to **different** directories
  (`$TMPDIR/n8n-skills-state/` vs `$TMPDIR/n8n-mcp-skills-state/`), so their
  one-shot reminders never suppress each other. Verified.

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
(see `docs/memory/project_scheduled_jobs.md`). These 29 skills are installed
for workspace-level n8n work, not because this codebase needs them. With
`SessionStart` unregistered (for both packs) they carry no always-on context
cost; they load on relevance like any other skill.

### Updating

Re-clone the relevant upstream and re-copy its `skills/` and `hooks/` (the
community pack into `hooks/community/`), then re-check that its `hooks.json`
has not added or renamed a hook that `settings.json` here needs to mirror —
**re-applying the server scoping**, since upstream ships `^mcp__.*__` wildcards
that would reintroduce cross-firing. Neither upstream `hooks.json` is vendored,
so `settings.json` stays the single source of truth.
