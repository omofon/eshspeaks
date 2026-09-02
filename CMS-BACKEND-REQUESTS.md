# CMS / Newsroom — Backend requests

What the frontend needs from `eshspeak-backend.onrender.com` (`/api/v1`) to
finish Sprint 2 (CMS) and unblock Sprint 4/5 work. Grouped by priority.
Every item is something the FE has a UI for, or a shell wired to the
contract below, waiting on the endpoint.

Response envelope for everything: `{ success, data, message, errorCode?, appErrorCode? }`
(unchanged). Branch on `appErrorCode`, never message text.

---

## Already live (for reference, do not rebuild)

`POST /articles` · `PATCH /articles/{id}` · `PATCH /articles/{id}/status`
· `DELETE /articles/{id}` · `GET /articles/{slug}` · `GET /articles/editorial/mine`
· `POST /articles/images` · `POST /articles/{id}/like` · `POST /articles/{id}/feedback`
· `POST /articles/{id}/share` · `GET /articles/{id}/comments` · `POST /articles/{id}/comments`
· `GET /roles/editorial-users` · `POST /roles/assign` · `POST /roles/sections`
· `POST /payments/initialize` · `GET /payments/verify/{reference}` · comments moderation endpoints.

Legal `status` transitions in use by the editor:
`draft` to `in_review | published`, `in_review` to `draft | published`,
`published` to `archived`, `archived` to `published | draft`. Only
`section_lead` / `chief_editor` may reach `published` / `archived`.

---

## Sprint 3 — payments, subscriptions, engagement

The frontend now integrates the live Paystack endpoints. What it still
needs from the backend to finish the account and pricing experience:

### S3.1 Paystack redirect target

`POST /payments/initialize` takes no body, so the frontend cannot pass a
`callbackUrl`. Confirm where Paystack redirects the reader after payment.
The frontend expects it to land on:

```
https://<frontend-origin>/account?checkout={reference}
```

Paystack's own `?trxref=` / `?reference=` query params on that URL are also
read, so either style works. If the redirect currently points somewhere
else (a backend URL, the API root), please repoint it, or add an optional
`callbackUrl` field to the initialize body.

### S3.2 Subscription detail on `GET /auth/me`

Today `/auth/me` returns only `membershipTier: "FREE" | "PREMIUM"`. The
account page needs, as a nested object:

```
subscription: {
  tier: "FREE" | "PREMIUM",
  status: "active" | "past_due" | "canceled" | "none",
  currentPeriodEnd: string | null,     // ISO date, drives "Renews on"
  cancelAtPeriodEnd: boolean,
  startedAt: string | null             // drives "Member since"
} | null
```

### S3.3 Cancel and resume

```
POST /subscriptions/cancel     (auth)  -> sets cancelAtPeriodEnd = true, keeps access to period end
POST /subscriptions/resume     (auth)  -> undoes a pending cancel
```

The account page has a Cancel control wired to this shape, disabled until
it exists.

### S3.4 Invoice history

```
GET /payments/invoices?limit=&cursor=   (auth)
  -> { items: [{ id, reference, amount, currency, status, paidAt, receiptUrl }], meta: { nextCursor? } }
```

### S3.5 Saved payment method

```
GET /payments/method   (auth)  -> { brand, last4, expMonth, expYear } | null
```

Card edits happen on Paystack's side, so no write endpoint is needed, only
this read to display the card on file.

### S3.6 Multi-tier and billing cycle (product target, not yet built server-side)

The pricing page shows three tiers (Grey, Slate, Bold) and a
monthly / yearly switch. Only Grey (free) and Slate on monthly resolve to
something real: Slate maps to the current single `PREMIUM` checkout, Bold
and the yearly cycle are shown disabled as "not available yet". To make
them real:

```
POST /payments/initialize
  body: { tier: "slate" | "bold", billingCycle: "monthly" | "yearly" }
GET  /payments/plans
  -> [{ tier, name, price: { monthly, yearly }, currency, features }]   // so the FE stops hardcoding prices
```

Placeholder prices currently live in `src/lib/membership.ts` and must be
replaced by `GET /payments/plans`.

### S3.7 Reader activity counts (optional, for the account page)

```
GET /users/me/activity   (auth)  -> { likes: number, comments: number, shares: number }
```

Drives the "Your activity" tiles. Low priority.

---

## P1 — CMS completion (blocking "Sprint 2 100%")

### 1. Fetch an editorial article by server id

`GET /articles/id/{id}` (or accept an id on `GET /articles/{slug}`).

- Today the only single-article read is `GET /articles/{slug}`. A `draft`
  that has never been published still has a slug, but the FE editor holds
  the **server id** (`remoteId`) after create, not the slug, and a draft's
  slug can change on every edit. Re-opening a server draft after a reload
  is currently unreliable.
- Must return the full editable body + all `CreateArticleDto` fields, not
  the gated public projection.
- Auth: the author, plus any `section_lead` for the article's section, plus
  `chief_editor`.

### 2. Cross-author read for reviewers

Confirm (and fix if needed) that `GET /articles/{slug}` returns the full
body of another author's `draft` / `in_review` article when the caller is a
`section_lead` for that section or `chief_editor`. The review queue is
useless if a section lead can only open their own drafts.

### 3. Editor → writer review notes ← FE shell built, disabled

The single biggest CMS gap. When a section lead returns a story to draft or
requests changes, the writer needs to see why.

```
POST /articles/{id}/review-notes      (auth: section_lead of section, or chief_editor)
  body: {
    body: string,                     // the note, 1–4000 chars
    decision?: "changes_requested" | "approved" | "rejected"
  }
  → 201 { id, articleId, authorId, body, decision, createdAt }

GET  /articles/{id}/review-notes      (auth: article author, section leads of section, chief_editor)
  → 200 [{ id, author: { id, displayName, role }, body, decision, createdAt }]  // newest first
```

- Posting a note with `decision: "changes_requested"` should **not** itself
  change `status` — the FE calls `PATCH /articles/{id}/status` separately —
  but the backend may also emit a notification (see P2.4).
- Notes are immutable; no edit/delete needed for v1.

### 4. Server-side revision history ← FE shows a local-only list today

```
GET /articles/{id}/revisions          (auth: same as review-notes read)
  → 200 [{ id, savedAt, authorId, authorName, summary }]      // summary = short diff label
GET /articles/{id}/revisions/{revId}  → 200 { ...full snapshot of editable fields }
```

Autosave can stay client-side, but a `published`/`in_review` article should
snapshot on every `PATCH` so an editor can see what changed and roll back.

---

## P2 — Admin dashboard

### 5. Notifications ← FE bell + dropdown built, disabled ("pending backend")

```
GET   /notifications?status=unread|all&limit=&cursor=   (auth: any editorial role)
  → 200 { items: [{ id, type, title, body, entityType, entityId, href, read, createdAt }],
          meta: { unreadCount, nextCursor? } }
PATCH /notifications/{id}/read        → 200 { id, read: true }
POST  /notifications/read-all         → 200 { unreadCount: 0 }
```

Event `type`s the FE will render (add more freely):

| type                           | recipient                                  | trigger                                    |
| ------------------------------ | ------------------------------------------ | ------------------------------------------ |
| `article.submitted_for_review` | section leads of the section               | writer submits                             |
| `article.changes_requested`    | the writer                                 | reviewer posts a `changes_requested` note  |
| `article.published`            | the writer                                 | reviewer publishes                         |
| `article.archived`             | the writer                                 | reviewer archives                          |
| `comment.awaiting_moderation`  | section leads of the section, chief_editor | flagged comment lands                      |
| `role.assigned`                | the affected user                          | chief_editor changes their role / sections |

Real-time (SSE `GET /notifications/stream` or WS) is a nice-to-have for
later; polling every 60s is fine for v1.

---

## P3 — Aggregation (Sprint 5 — Trending / Latest)

### 6. RSS ingestion source list

The backend polls a configured set of feeds, normalises items, and
runs them through the section-lead review queue (no auto-publish — a human
approves, per PRD §7). The FE needs the **config endpoint** and the
**read endpoints**; the backend needs the **starting feed list** below.

**Config (chief_editor):**

```
GET    /aggregation/feeds        → [{ id, name, url, sectionSlug, pollIntervalMinutes, enabled, lastPolledAt, lastError }]
POST   /aggregation/feeds        body: { name, url, sectionSlug, pollIntervalMinutes }
PATCH  /aggregation/feeds/{id}   body: partial
DELETE /aggregation/feeds/{id}
```

**Read (public, cached ~60s):**

```
GET /articles/trending?limit=   → Paginated<ArticleSummary>   // ranked by engagement over a rolling window
GET /articles/latest?limit=     → Paginated<ArticleSummary>   // newest published, all sections
```

The FE currently fakes both with client-side sorts of `GET /articles`.

**Proposed starting feed list** (Nigerian politics / business / security —
backend team to confirm each URL resolves and pick the section mapping):

| Outlet               | RSS URL                               | Suggested section |
| -------------------- | ------------------------------------- | ----------------- |
| Punch                | `https://punchng.com/feed/`           | politics          |
| Premium Times        | `https://www.premiumtimesng.com/feed` | politics          |
| TheCable             | `https://www.thecable.ng/feed`        | politics          |
| Channels TV          | `https://www.channelstv.com/feed/`    | politics          |
| The Guardian Nigeria | `https://guardian.ng/feed/`           | politics          |
| Vanguard             | `https://www.vanguardngr.com/feed/`   | politics          |
| Daily Trust          | `https://dailytrust.com/feed/`        | security          |
| BusinessDay          | `https://businessday.ng/feed/`        | business          |
| Nairametrics         | `https://nairametrics.com/feed/`      | business          |
| Stears               | `https://www.stears.co/rss/`          | business          |

Normalised item shape the FE expects once a feed item is imported:
`{ sourceName, sourceUrl, title, summary, publishedAt, canonicalUrl, imageUrl? }`
with `sourceType: "CURATED"` and `status: "in_review"` on creation.

---

## P4 — Auth / access control (`returnTo` gating)

The FE has full `returnTo` handling (`src/lib/auth/returnTo.ts`,
`buildLoginHref`) but it can only bounce a user to `/login?returnTo=…` if
the backend signals "unauthorised" consistently.

1. **Consistent 401 on protected reads.** Any endpoint that requires auth
   must return HTTP `401` with `errorCode: "UNAUTHORIZED"` (and
   `appErrorCode: "INVALID_ACCESS_TOKEN"` / `"MISSING_ACCESS_TOKEN"`) when
   the bearer token is absent, expired, or invalid — never a `200` with an
   empty body or a `403` for the missing-token case. `403` is reserved for
   _authenticated but wrong role_.
2. **Endpoint access map.** A short doc (or an OpenAPI `security` block per
   operation) listing every `/api/v1` endpoint as `public` / `auth` /
   `role:<roles>`. The FE gates UI off this; today it guesses.
3. **Permissions on `/auth/me`.** Add `permissions: string[]` (or a
   capability map) to the `GET /auth/me` payload — e.g.
   `["article.publish", "comment.moderate", "role.assign"]` — so the FE
   shows/hides admin affordances from one source of truth instead of
   re-deriving from `role` + rank in several places.
4. Confirm `/articles/editorial/mine`, `/roles/*`, `/articles/comments/moderation*`,
   and the future `/notifications*` + `/aggregation/*` are all role-guarded
   server-side (the FE gate is UX only).

---

## P5 — Known carry-over gaps (not re-specced here)

Tracked from the original 5-week sprint plan, still missing, out of scope
for this note: server-side paywall gating and preview-vs-full-body
resolution (Sprint 3, the checkout half is now integrated, see the Sprint 3
section above for what remains); newsletter subscribe + CRM sync, The Seat
lead-capture + nurture + PDF, preference-event ingestion, ad-slot
resolution (Sprint 4); full-text search, admin analytics aggregation, NGX
market ticker feed (Sprint 5). Share-event logging is now live
(`POST /articles/{id}/share`, wired in `EngagementBar`).
