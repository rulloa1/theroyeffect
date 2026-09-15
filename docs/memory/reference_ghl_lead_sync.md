---
name: ghl-lead-sync
description: Inbound leads sync to GoHighLevel through a workflow webhook; unset secret skips the sync silently.
metadata:
  type: reference
---

Inbound leads — contact form, project brief, MCP inquiries — are synced to **GoHighLevel** via a GHL workflow Inbound Webhook.

The webhook URL lives in the `GHL_INBOUND_WEBHOOK_URL` secret (Project Settings → Secrets). **If it is unset the sync is skipped and form submissions are unaffected** — the form still succeeds, the lead just never reaches GHL.

**Why it matters:** a missing secret fails silently. "Leads aren't showing up in GHL" is a secret problem before it is a code problem.

*Source: README.md, src/lib/ghl*
