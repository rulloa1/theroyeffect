---
name: ci-gates
description: CI lint reports but does not block; typecheck and tests are the hard gates.
metadata:
  type: project
---

In `.github/workflows/ci.yml` the verify job runs lint, typecheck, test and build — but **lint does not block the build**. The workflow says so directly: the repo carries pre-existing formatting/lint debt, so lint reports while **typecheck and tests are the hard gates**.

CI runs on pushes and PRs to `main` and `staging`, with `cancel-in-progress` concurrency.

**How to apply:** a red lint line in CI output is not a failing build. Check which step actually failed before chasing formatting.

*Source: .github/workflows/ci.yml*
