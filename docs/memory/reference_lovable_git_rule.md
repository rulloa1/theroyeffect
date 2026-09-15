---
name: lovable-git-rule
description: Never rewrite published git history - this repo is Lovable-connected and rewriting loses project history.
metadata:
  type: reference
---

This repository is connected to **Lovable**. Commits pushed to the connected branch sync back and appear in the Lovable editor.

**Never rewrite published history** — no force pushing, and no rebasing, amending or squashing commits that are already pushed. Doing so rewrites history on Lovable's side and the project history is likely lost.

Corollary: keep the connected branch in a working state, since whatever is on it is what the editor shows.

*Source: AGENTS.md*
