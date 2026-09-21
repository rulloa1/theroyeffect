---
name: branch-cleanup
description: Merged branches cannot be deleted from a Claude Code remote session: the egress proxy answers git ref delet...
metadata:
  type: reference
---

Merged branches cannot be deleted from a Claude Code remote session: the egress proxy answers git ref deletion with HTTP 403 and the GitHub MCP has no delete-branch tool. Delete them with the PR's 'Delete branch' button or on the branches page, or turn on Settings → General → Pull Requests → 'Automatically delete head branches' so it never comes up.

**Why:** Found 2026-09-20 cleaning up claude/env-hygiene after PR #8 merged; four retries with backoff all failed on git-receive-pack, so the remote branch had to be deleted by hand.

*Saved 2026-09-20 via brain store.*
