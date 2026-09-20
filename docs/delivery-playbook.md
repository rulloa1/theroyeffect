# Delivery Playbook

Everything the website promises, and exactly how to deliver it when a lead lands.

Each section maps a website promise to the internal SOP — what to do, in what order, with what templates, and by what deadline. If a lead comes in and you can't follow these steps, either the promise on the site needs to change or the infrastructure needs to catch up.

---

## Table of Contents

1. [Free 5-Minute Audit](#1-free-5-minute-audit)
2. [Project Brief Reply](#2-project-brief-reply)
3. [Paid Discovery Call ($49)](#3-paid-discovery-call-49)
4. [Brand Sprint ($2,500+)](#4-brand-sprint-2500)
5. [Web Design & UI/UX ($5,000+)](#5-web-design--uiux-5000)
6. [Design + Build ($8,000+)](#6-design--build-8000)
7. [Monthly Retainer ($3,000/mo)](#7-monthly-retainer-3000mo)
8. [The Approval Promise](#8-the-approval-promise)
9. [Post-Launch Support (14 days)](#9-post-launch-support-14-days)
10. [Email Template Reference](#10-email-template-reference)

---

## 1. Free 5-Minute Audit

### What the site says

> "I'll send a complimentary video teardown of your homepage, mobile UX and conversion flow, with three quick wins you can apply this week."
> Delivered within 1 business day. No call, no pitch, no spam.

### When it triggers

Lead submits the audit form at `/audit` with their name, email, website URL, primary bottleneck, and optional notes. The system:

1. Saves to `contact_inquiries` in Supabase
2. Syncs to GoHighLevel with tags `website-lead`, `audit-request`
3. Sends you a notification email at `rory@theroyeffect.com`
4. Sends the lead an auto-confirmation ("Got your audit request — The Roy Effect")

### Delivery SOP

**Step 1 — Review (within 4 hours of notification)**

- Open the notification email. Click the website link. Open it on your phone first, then desktop.
- Read the bottleneck they selected and any notes.
- Check the lead in the admin pipeline view. Confirm the stage is `new` and the audit status is `audit_in_progress`.

**Step 2 — Record the audit (within 1 business day)**

Record a 5-minute screen recording (Loom, Loom Chrome extension, or OBS) covering:

1. **First impression (30 seconds)** — Open the site cold on mobile. Say what you see in the first 3 seconds. Would a customer know what this business does and how to buy?
2. **Conversion teardown (90 seconds)** — Walk the primary conversion path (homepage → service/contact/book). Where does friction start? Is the CTA visible? Is the form short enough? Does the contact method match how a customer actually reaches out?
3. **Mobile UX review (90 seconds)** — Check tap targets, text size, load speed, layout shift. Is the navigation usable one-handed? Does anything break?
4. **Brand positioning (60 seconds)** — Does the visual language match the price point? Does it look like the business it claims to be? Where does it look cheap or dated?
5. **Three actionable fixes (60 seconds)** — Name three specific changes ranked by impact. Be concrete: "Move the booking button above the fold on mobile" not "improve your layout."

**Step 3 — Deliver**

- Upload the video to Loom (or your recording tool). Set it to unlisted.
- Reply to the lead's email with this structure:

  **Subject:** Your website audit for [domain] — 3 fixes inside

  Hi [first name],

  I recorded a 5-minute teardown of [domain]. Here's what I found:

  1. [Top-priority fix — one sentence]
  2. [Second fix — one sentence]
  3. [Third fix — one sentence]

  The full video walks through each one and shows exactly where to make the change: [video link]

  If you want me to make these fixes, we can talk. If not, the notes are yours to keep.

  Rory

- Update the audit status to `delivered` in the admin pipeline.
- Update the lead stage from `new` to `contacted`.
- If they reply wanting the fixes, move to the proposal flow (Section 4, 5, or 6 depending on scope).

**Step 4 — Follow-up (if no reply in 3 days)**

The automation system's `audit_pending` playbook will draft a follow-up email for you. Review it in the admin autopilot view, edit if needed, and send. The follow-up confirms the audit was delivered and offers a call to walk through findings.

### What you need to have ready

- Loom account (free tier works for up to 25 videos)
- Chrome (for screen recording extension)
- Phone with mobile data (to check the site as a real mobile user, not devtools)

---

## 2. Project Brief Reply

### What the site says

> "Your brief landed safely and I'll get back to you personally within one business day."
> "I'll review it and reply within one business day with scope, schedule and next steps."

### When it triggers

Lead submits the brief form at `/brief` with name, email, company, project type, goals, audience, deliverables, references, budget, timeline, and extra notes. The system sends the lead an auto-confirmation and you a notification email.

### Delivery SOP

**Step 1 — Read the brief (within 4 hours)**

- Read the full brief in the notification email or admin inquiries view.
- Check: project type, budget range, timeline, goals. Do they match a tier on your pricing page?
- If the brief came with a `session_id` (post-purchase), check whether they've already paid a deposit.

**Step 2 — Reply (within 1 business day)**

Reply personally. Do not use the auto-confirmation as the reply. Structure:

**Subject:** Re: your project brief — [their project type]

Hi [first name],

Thanks for the detail. Here's where I land:

**Scope:** [1-2 sentences confirming what they're asking for, in your words]
**Ballpark:** [Match to a pricing tier or give a range. If they're way off budget, say so plainly.]
**Timeline:** [Confirm or adjust their stated timeline]
**Next step:** [Book a discovery call / send a proposal / fill out the full brief / "I can't take this on right now"]

[One line referencing something specific from their brief that shows you read it.]

Rory

**Step 3 — Route**

- If budget and scope align with a tier → send a proposal link (Section 4/5/6).
- If they need a call first → send the `/book` link.
- If they're way off budget → be honest. "I work in the $5–10k range for full design-and-build. If that's not where you are, I can recommend [alternative]."
- If it's not a fit → say so. Don't string it along.

---

## 3. Paid Discovery Call ($49)

### What the site says

> "Pick a slot below and pay the $49 fee to lock it in. I'll call you at the scheduled time to discuss your project, scope, and timeline."
> "Bring the goal, timeline, and budget. I'll leave you with a clear written recommendation."

### When it triggers

Lead books a call at `/book`, pays $49 via Stripe, and selects a time slot. The system:

1. Creates a `voice_bookings` record
2. Sends a booking confirmation email with the time and a link to complete their intake
3. Creates a project + milestone plan in the onboarding system (discovery playbook)

### Delivery SOP

**Step 1 — Prepare (before the call)**

- Check the admin pipeline for the lead's booking. Read any intake form they submitted.
- Review their website (if provided). Note 2-3 things to ask about.
- Have your notes ready: what they said they want, what they probably need, and what the likely tier is.

**Step 2 — The call (15 minutes)**

Structure:
1. **(2 min)** Rapport + restate what they said in the brief/intake.
2. **(5 min)** Ask about the business: What does success look like? What's the bottleneck? Who are the customers? What's the budget reality?
3. **(5 min)** Share your take: what you'd actually do, what tier it maps to, what the timeline looks like.
4. **(3 min)** Next step: "I'll send you a written recap and a proposal link within 24 hours. If it looks right, you sign and pay the deposit, and we start."

**Step 3 — Written recommendation (within 24 hours)**

Send an email with this structure:

**Subject:** Recap from our call — [their business name]

Hi [first name],

Great talking today. Here's what I heard and where I'd start:

**What you're solving:** [1-2 sentences from the call]
**What I recommend:** [Tier name + why it fits — e.g., "Design + Build at $8,000 because you need both the design and a live site, not just mockups"]
**Timeline:** [Weeks from kickoff to launch]
**What's included:** [3-4 bullet points from the tier's deliverables]
**Investment:** [Price] — 50% deposit to start, balance at delivery

Review and sign the proposal here: [proposal link]

Any questions, reply to this email.

Rory

**Step 4 — After the call**

- Mark the booking as `completed` in the admin pipeline.
- Move the lead stage to `proposal_sent` after sending the proposal.
- The automation's `post_call_no_proposal` playbook will remind you if 24 hours pass without a proposal being sent.

---

## 4. Brand Sprint ($2,500+)

### What the site says

Deliverables:
- Brand strategy workshop
- Logo system + variations
- Color palette & typography
- Written brand guidelines
- 2 revision rounds

Process: Brief & scope → Direction → Design → (no build) → After launch

### Delivery SOP

**Step 1 — Proposal & deposit**

- Create a proposal in the admin proposals view with:
  - Project title: "[Client] — Brand Identity"
  - Scope: the 5 deliverables above, customized to their business
  - Timeline: 2-3 weeks
  - Total: $2,500 (or higher if scoped up)
  - Deposit: 50% ($1,250)
- Send the proposal link. Lead signs and pays deposit.
- The onboarding system creates a project with commission milestones.

**Step 2 — Brand strategy workshop (Day 1-2)**

Run a 45-minute call (or async questionnaire) covering:
- Business positioning: What do you do? For whom? Why you?
- Competitive landscape: Name 3 competitors. What's different about you?
- Brand personality: 3 adjectives. What feeling should the brand create?
- Target audience: Who's the customer? What are they choosing between?
- Must-haves and no-gos: Colors they love/hate, styles that feel right/wrong.

**Step 3 — Direction (Day 3-5)**

Present ONE visual direction:
- Typography pairing (2 fonts: display + body)
- Color palette (3-5 colors with hex values)
- Logo concept (2-3 variations: horizontal, stacked, icon-only)
- Mood board showing the direction in context

**The Approval Promise applies here:** the lead signs off on the direction before any refinement happens. No building on top of an unapproved direction.

**Step 4 — Design (Day 6-12)**

Refine the approved direction into:
- Final logo system (horizontal, stacked, icon, favicon)
- Color palette with hex/RGB values
- Typography scale (display, headings, body, captions)
- Basic brand guidelines PDF (3-5 pages: logo usage, color, type, do's and don'ts, examples)

**Revision rounds:** 2 rounds. Each round = collect feedback, revise, re-present. After round 2, additional revisions are $350/round (add-on).

**Step 5 — Delivery**

- Export all files: AI/EPS (vector), PNG (transparent), SVG, PDF (guidelines)
- Send via a Google Drive folder or Dropbox link
- Update the project status to `delivered` in the admin
- Send the final balance invoice (remaining $1,250)

**Step 6 — After delivery**

- 14-day post-launch support: answer questions, fix small issues, provide usage guidance
- After 14 days, offer the retainer for ongoing brand stewardship

---

## 5. Web Design & UI/UX ($5,000+)

### What the site says

Deliverables:
- UX audit & wireframes
- High-fidelity UI design
- Responsive mobile → desktop screens
- Clickable prototype
- 3 revision rounds

Process: Brief & scope → Direction → Design → (handoff only, no build) → After launch

### Delivery SOP

**Step 1 — Proposal & deposit**

- Create a proposal with:
  - Project title: "[Client] — Web Design & UI/UX"
  - Scope: the 5 deliverables above, customized
  - Timeline: 3-4 weeks
  - Total: $5,000 (or higher if scoped up; typical $5-7k)
  - Deposit: 50% ($2,500)

**Step 2 — UX audit & wireframes (Day 1-5)**

- Review their current site (if any) or competitors
- Map the page structure: what pages, what order, what hierarchy
- Wireframe each page at low fidelity (gray boxes, placeholder text, no styling)
- Present wireframes for sign-off before moving to visual design

**Step 3 — Direction (Day 5-7)**

Present ONE visual direction:
- Homepage hero treatment
- Typography pairing
- Color system
- Component language (buttons, cards, sections)

**Approval Promise:** lead signs off on the direction before any full-page design.

**Step 4 — Design (Day 8-18)**

- Design each page at high fidelity, mobile-first, then desktop
- Use real content (not lorem ipsum). If they haven't provided copy, write draft copy and flag it.
- Build a clickable Figma prototype linking all screens
- Responsive: show mobile and desktop for every page

**Revision rounds:** 3 rounds. Each round = collect feedback, revise, re-present.

**Step 5 — Handoff**

- Export Figma file with all screens, components, and styles organized
- Provide a Figma prototype link
- Export any assets (images, icons, illustrations)
- Send a handoff document with: page list, component inventory, spec notes
- The client takes this to their developer, or you upsell to Design + Build (Section 6)

**Step 6 — Delivery & balance**

- Update project status to `delivered`
- Send the final balance invoice (remaining $2,500)
- 14-day support: answer questions about the files, make small adjustments

---

## 6. Design + Build ($8,000+)

### What the site says

Deliverables:
- Everything in Web Design & UI/UX
- No-code / AI-assisted development
- CMS, forms & payments
- Launch, analytics & SEO basics
- 14-day post-launch support

### Delivery SOP

**Step 1 — Proposal & deposit**

- Create a proposal with:
  - Project title: "[Client] — Design + Build"
  - Scope: full design + build + launch
  - Timeline: 4-6 weeks
  - Total: $8,000 (typical $7-9k; can scope up for larger sites)
  - Deposit: 50% ($4,000)

**Step 2 — Follow the Web Design & UI/UX process (Steps 2-4)**

Same as Section 5: UX audit → wireframes → direction → full design → 3 revision rounds.

**Step 3 — Build (after design sign-off)**

**The Approval Promise gate:** No build work starts until the lead has signed off on the final design in writing. The design they approved is what gets built.

Build checklist:
- [ ] Set up the project (Next.js / Vite / TanStack — match the stack to the site's needs)
- [ ] Implement all approved screens pixel-accurate
- [ ] Responsive: mobile, tablet, desktop breakpoints
- [ ] CMS setup (if content needs to be editable): Sanity, Supabase, or file-based
- [ ] Contact form: wire to the contact API endpoint → Supabase + GHL + notification email
- [ ] Payments: Stripe integration (if the site needs checkout)
- [ ] Analytics: Google Analytics 4 or Plausible
- [ ] SEO basics: meta titles, descriptions, OG tags, sitemap.xml, robots.txt, schema markup
- [ ] Performance: image optimization, lazy loading, font loading strategy
- [ ] Accessibility: alt text, keyboard navigation, contrast check

**Step 4 — Launch**

- [ ] Domain configuration (DNS, SSL)
- [ ] Deploy to production (Vercel / Cloudflare / Netlify)
- [ ] Test all forms end-to-end (submit a test lead, confirm it arrives)
- [ ] Test all payment flows end-to-end (if applicable)
- [ ] Check analytics tracking
- [ ] Check sitemap and robots
- [ ] Mobile testing on real devices
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

**Step 5 — Handover**

- [ ] Provide admin access (CMS, hosting, analytics)
- [ ] Record a 10-minute walkthrough video of how to edit content, check leads, and manage the site
- [ ] Send the walkthrough link + written quick-start guide
- [ ] Update project status to `launched`
- [ ] Send the final balance invoice (remaining $4,000)

**Step 6 — Post-launch support (14 days)**

- Monitor for bugs, broken forms, performance issues
- Fix any issues that arise
- Answer questions about editing content
- After 14 days: offer the retainer for ongoing design/build capacity

---

## 7. Monthly Retainer ($3,000/mo)

### What the site says

Deliverables:
- Ongoing design & build capacity
- Priority turnaround
- Design system upkeep
- Weekly async sync
- Pause or cancel anytime

### Delivery SOP

**Step 1 — Setup**

- Create a project in the admin with the retainer onboarding playbook milestones:
  1. Care plan kickoff (Day 3): Access granted, priorities agreed, reporting cadence set
  2. First improvement shipped (Day 10): First change live on the site
  3. Monthly review (Day 30): What shipped, what's next

- Grant access to: project repo, CMS, hosting, analytics, Supabase (as needed)
- Agree on the weekly async sync format (see below)

**Step 2 — Weekly async sync**

Send every Monday (or agreed day):

**Subject:** Weekly sync — [week of date]

Hi [first name],

**Shipped last week:**
- [item]
- [item]

**In progress:**
- [item]

**Up next:**
- [item]

**Blockers / questions:**
- [if any]

Reply with any changes to priority.

Rory

**Step 3 — Monthly review**

On the last business day of each month:

- Send a summary of what shipped, what's in progress, and what's planned for next month
- Confirm retainer renewal (or pause/cancel)
- The automation's `subscription-notification` template handles billing notifications

**Step 4 — Pause or cancel**

- If the client pauses: set the retainer status to `paused` in Supabase. Resume when they're ready.
- If the client cancels: set status to `cancelled`. Ensure any in-progress work is wrapped up. Hand over any remaining assets.

---

## 8. The Approval Promise

### What the site says

> "You see the full design before a single page is built."
> "Nothing moves to build until you've approved it."
> "What you approved is what ships — no bait-and-switch."

### How to enforce it

This is the most important promise on the site. Here's how it works in practice:

1. **Design phase ends with a formal sign-off.** After the final revision round, present the complete design and explicitly ask for approval. The proposal system's digital signature flow handles this — the lead signs the proposal, which locks the scope.

2. **No build work starts until the signature is recorded.** The proposal system tracks `status: "signed"` and `deposit_paid_at`. Check both before starting any build work.

3. **If the client wants changes after sign-off but before launch:** those are change requests. Quote them as add-ons (extra revision round: $350, extra page: $900). Don't silently absorb them.

4. **If you need to deviate from the approved design during build:** flag it to the client first. "The approved design has X, but during build I found Y works better because Z. OK to proceed?" Get it in writing.

5. **At launch:** the site that goes live matches the approved design. Any differences need to be explained and agreed.

### What the infrastructure already does

- The proposal system (`/proposal/$token`) has a digital signature flow
- The onboarding milestones include a "Design sign-off" gate at Day 12 for commissions
- The client welcome email says "You approve the design before anything is built, and the design you approve is what goes live"

### What's missing

- No explicit design approval gate page in the portal. The proposal signing covers the contract, but a separate "design approval" checkpoint where the client sees the final design and clicks "I approve this design" would strengthen the promise. Add this as a portal feature.

---

## 9. Post-Launch Support (14 days)

### What the site says

> "Post-launch support is included for the first two weeks."

### Delivery SOP

- After launch, set a calendar reminder for 14 days out
- During the 14 days: monitor for errors, respond to client questions, fix small issues at no charge
- Common items: content edits, form testing, analytics verification, mobile rendering fixes, broken links
- After 14 days: any new work is billed (retainer or hourly). Send a message: "Your 14-day support window wrapped up today. For ongoing work, the monthly retainer ($3,000/mo) covers continuous design and build. Want to set it up?"

---

## 10. Email Template Reference

### Templates that exist and what they do

| Template key | When it's sent | What it says |
|---|---|---|
| `brief-confirmation` | Auto-sent when a brief/audit form is submitted | "Your brief/audit landed safely, I'll be in touch within 1 business day" |
| `brief-notification` | Auto-sent to you when a lead submits a form | All lead details + reply button + GHL link |
| `booking-confirmation` | Auto-sent when a discovery call is booked | "Your call is booked for [time]. Complete the intake here." |
| `booking-notification` | Auto-sent to you when a call is booked | Booking details + lead info |
| `order-confirmation` | Auto-sent when a payment is received | "Payment received. Send your project brief." |
| `order-notification` | Auto-sent to you when a payment is received | Order details |
| `client-welcome` | Auto-sent by onboarding system after purchase | "Your project is set up. Here's the plan and your next step." |
| `proposal-ready` | Sent when you create and send a proposal | "Your proposal is ready to review and sign." |
| `project-brief-notification` | Auto-sent to you when a detailed brief is submitted | Full brief details |
| `voice-agent-followup` | Used by the voice agent follow-up system | Generic follow-up with custom heading/body/CTA |
| `voice-agent-notification` | Auto-sent to you when the voice agent captures a lead | Lead details from the voice agent |
| `prospect-outreach` | Used for cold outreach | Custom outreach email |
| `subscription-notification` | Retainer billing events | "Retainer [event] — The Roy Effect" |

### Templates that are MISSING and need to be built

1. **`audit-delivered`** — Sent to the lead when you deliver the audit video. Should include: their name, domain, the 3 fixes summary, the video link, and a CTA to book a call if they want the fixes made.

2. **`discovery-recap`** — Sent after a discovery call with the written recommendation. Should include: recap of what they're solving, recommended tier, timeline, investment, and proposal link.

3. **`design-approval-request`** — Sent when the design is ready for sign-off. Should include: link to the design (Figma or portal), instructions to review, and a clear "approve or request changes" CTA.

4. **`launch-ready`** — Sent when the build is complete and ready to go live. Should include: pre-launch checklist summary, go-live timeline, and what the client needs to provide (domain access, final content).

5. **`post-launch-handover`** — Sent after launch with the walkthrough video link, access details, and a quick-start guide for managing the site.

6. **`retainer-weekly-sync`** — The weekly async update template. Could be sent as a regular email rather than a React Email template, but having it as a template keeps it consistent.

7. **`support-window-closing`** — Sent at day 12 of the post-launch support period. "Your 14-day support window wraps up in 2 days. Here's how to get ongoing help."

---

## Quick Reference: Lead → Action Map

| Lead type | Form/API | Auto-confirmed | You must do within 24h | You must do within 1 business day |
|---|---|---|---|---|
| Free audit | `/audit` → `contact` API | Yes (brief-confirmation) | Read the notification, check the site on mobile | Record and send the 5-min audit video |
| Project brief | `/brief` → `brief-intake` API | Yes (brief-confirmation) | Read the full brief | Reply with scope, schedule, next steps |
| Discovery call | `/book` → Stripe + booking | Yes (booking-confirmation) | Read intake, prep notes | Complete the call, send written recap + proposal within 24h |
| Paid service | `/pricing` → Stripe checkout | Yes (order-confirmation + client-welcome) | Read the order, confirm project setup | Create proposal, send proposal link, start onboarding |
| Retainer | `/pricing` → Stripe subscription | Yes (order-confirmation + client-welcome) | Confirm retainer setup, grant access | Send weekly sync template, agree priorities |
