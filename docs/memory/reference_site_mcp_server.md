---
name: site-mcp-server
description: The site hosts its own MCP server at /mcp, OAuth-protected through Supabase auth.
metadata:
  type: reference
---

theroyeffect **exposes** an MCP server of its own at `/mcp` — this is an outbound surface others connect to, not a connector the site consumes.

- Server name `pixel-perfect-capture`, title "Pixel Perfect Capture", SDK `@lovable.dev/mcp-js`.
- Auth: OAuth, issuer `https://<project>.supabase.co/auth/v1`, accepted audience `authenticated`.
- Tools include `list_services` (every service tier and add-on) and `get_service` (one tier by name, e.g. Brand Sprint, Website / UI-UX, Design + Build, Retainer).

**How to apply:** when service names or prices change, the MCP tool descriptions are a second place they live.

*Source: .lovable/mcp/manifest.json, src/routes/mcp.ts, src/lib/mcp*
