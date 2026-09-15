---
name: ai-provider-order
description: Drafting prefers the Lovable AI Gateway and falls back to direct Gemini only when the gateway key is absent.
metadata:
  type: reference
---

`src/lib/ai-gateway.server.ts` is server-only and resolves the drafting provider in a fixed order:

1. **Lovable AI Gateway** — `https://ai.gateway.lovable.dev/v1`, authenticated with a `Lovable-API-Key` header. Preferred for reliability and current models.
2. **Direct Gemini** — `https://generativelanguage.googleapis.com/v1beta/openai/`, used **only** when the gateway key is absent.

Both go through `@ai-sdk/openai-compatible`. Never import this module from client code.

*Source: src/lib/ai-gateway.server.ts*
