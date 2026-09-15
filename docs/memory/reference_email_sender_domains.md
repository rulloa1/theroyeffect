---
name: email-sender-domains
description: Transactional email sends from notify.theroyeffect.com; the From header shows theroyeffect.com.
metadata:
  type: reference
---

Transactional email goes through `@lovable.dev/email-js` (`sendLovableEmail`), reading `LOVABLE_API_KEY` server-side.

- `SENDER_DOMAIN` = `notify.theroyeffect.com` — the **verified sender subdomain**, which must match the subdomain delegated to Lovable's nameservers. Never use the root domain here.
- `FROM_DOMAIN` = `theroyeffect.com` — cosmetic only, the domain shown in the `From:` header.
- Site name baked in as "The Roy Effect".

*Source: src/lib/email-templates/send-email.ts*
