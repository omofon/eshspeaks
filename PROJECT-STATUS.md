# EshSpeaks Newsroom — Project Status

A snapshot of where this project stands, written after the Colouresh
integration audit and cleanup pass on `rebrand/colouresh`. For deep
architecture detail see `ARCHITECTURE.md`; for the rules the codebase must
follow see `CLAUDE.md`. This file is the "what do we have right now and
what just changed" view.

## What this project is

EshSpeaks is a Nigerian politics/business/security news platform with a
free/premium reader tier, plus a standalone lead-gen product called **The
Seat**. One codebase serves two audiences: public readers and an
editorial/admin CMS.

- Next.js App Router, React 19, TypeScript strict, Tailwind v4
- Real backend for auth and article create/edit (bearer-token API,
  `NEXT_PUBLIC_API_BASE_URL`); public article *reads* still come from
  static mock data in `src/lib/data/`
- Currently being rebranded from the old navy/gold "EshSpeaks" look to
  **Colouresh**: five crayon hues (orange, green, yellow, purple, red) on
  a warm paper/ink neutral base, Fredoka display type, pill buttons with a
  hard offset shadow

## Route map and Colouresh conversion status

All public prototype pages under `public/colouresh/` (the static HTML
design reference) are integrated into live routes. Confirmed by audit:

| Prototype | Route | Notes |
|---|---|---|
| index.html | `/` | Home, composed from `src/components/home/colouresh/*` |
| state-of-play.html | `/state-of-play` | Politics & governance desk |
| business.html | `/the-bag` | Trade/SME/corporate desk, renamed "The Bag" |
| finance.html | `/money-moves` | Markets/naira desk, renamed "Money Moves" |
| the-seat.html | `/the-seat` | Standalone lead-gen product |
| thread.html | `/thread/[id]` | Live/discussion thread view |
| topics.html | `/topics` | Topic browser |
| story.html | `ArticleView` component | Used by the `[section]/[...rest]` article route |
| advertise.html | `/advertise` | |
| membership.html | `/membership` | |
| nominate.html | `/nominate` | |
| partner.html | `/partner` | |
| rsvp.html | `/rsvp` | |
| events.html | `/events` | |
| gallery.html | `/gallery` | |
| legal.html | `/legal` | |
| coming-soon.html | `/coming-soon` | Placeholder for not-yet-live desks |
| style-guide (1).html | *(reference only, no route)* | Design tokens live in `src/app/globals.css` |

Desks not yet built (route to `/coming-soon`): Red Zone (security), The
Vibe (entertainment), The Whistle (sports), Next Wave (technology), The
Brief (governance), Home Ground (real estate). See `src/lib/data/desks.ts`.

The `(auth)` sign-in flow (`/login`, `/verify`, `/username`) has **no**
prototype counterpart in `public/colouresh/` — it's a from-scratch
split-card design, purple-accented (purple is auth's hue in the
section-tint system). It was fully rebuilt but its styling broke partway
through the rebrand (see "What just changed" below); that's fixed now.

Admin/CMS routes (`src/app/admin/`) don't follow the Colouresh
public-facing palette at all — they run a plainer operator-tool look and
are out of scope for the rebrand: `/admin`, `/admin/articles`,
`/admin/moderation`, `/admin/roles`, `/admin/sections`, `/admin/users`.

## What just changed (this session)

1. **Fixed broken auth styling.** During the rebrand, the CSS custom
   properties `--peach`, `--peach-strong`, `--input-soft`, `--ink-faint`,
   and `--gallery` were removed from `globals.css`, but `AuthShell`,
   `AuthGallery`, `OTPForm`, `UsernameForm`, `EmailAuthForm`,
   `AuthDivider`, and the login page still referenced Tailwind classes
   built on those tokens (`bg-peach`, `ring-peach`, `bg-input-soft`,
   `text-ink-faint`, `bg-gallery`). Those classes had nothing to resolve
   against, so the elements using them rendered unstyled. All of them now
   point at the current shared tokens (`purple`, `ink-soft`,
   `background-soft`), matching the rest of Colouresh.
2. **Removed ~37 unused shadcn/ui scaffold files** from
   `src/components/ui/` (accordion, alert, avatar, badge, calendar, card,
   carousel, chart, checkbox, command, dialog primitives never wired up,
   sidebar, tabs, tooltip, and more), confirmed unused by tracing the
   actual import graph from `src/app` and `src/components`, not just a
   name search. Only `accordion`, `alert-dialog`, `avatar`, `button`,
   `dialog`, `dropdown-menu`, `label`, `skeleton`, and `switch` are
   genuinely reachable from real pages and were kept.
3. **Removed ~26 now-orphaned npm dependencies** that backed the deleted
   UI files (Radix primitives, `recharts`, `embla-carousel-react`,
   `cmdk`, `vaul`, `react-day-picker`, `react-resizable-panels`,
   `input-otp`, `sonner`).
4. **Cleaned dead commented-out code** in `verify/page.tsx` and
   `AuthGallery.tsx`.
5. **Finalized the deletion of `CMS-BACKEND-REQUESTS.md`** (it was
   already removed from the working tree before this session) and fixed
   the now-dangling reference to it in `CLAUDE.md`.
6. **Corrected a stale `CLAUDE.md` note** about `vite.config.ts` and a
   top-level `app/` directory; both were already fully removed, the note
   still described them as pending cleanup.
7. Verified with `npm run typecheck`, `npm run lint`, and `npm run build`
   (all 37 routes) after every change. One pre-existing, unrelated lint
   error remains in the auto-generated `next-env.d.ts` file; not
   introduced by this work.

Committed as `f416897` on `rebrand/colouresh` and pushed to `origin`
(first push of this branch to the remote).

## Auth system (`src/lib/auth/`)

- Bearer-token API for email/OTP sign-in (access token in memory, refresh
  token in `localStorage`). No session cookies for this path.
- Google OAuth is a separate, cookie-based session (`esh_at`/`esh_rt`,
  `SameSite=None`) reached via a full-page redirect, with a CSRF
  double-submit header (`X-CSRF-Token`) required on writes for that path.
- Roles are lower_snake_case wire values from the backend
  (`state_correspondent`, etc.); `hasRole` is rank-based, not exact-match.
- `membershipTier` (`FREE`/`PREMIUM`) is separate from editorial `role` —
  paywall gating must use the former, never the latter.
- Dev-only tier/role preview (`src/lib/dev/previewTier.tsx`) lets you
  preview the UI as any tier/role without a second backend account; inert
  in production.

## CMS / article editor (`src/lib/cms/`, `src/components/admin/editor/`)

Live: create, content update (PATCH), status transitions (its own
dedicated endpoint), delete, image upload, single-article read by slug.

Still missing on the backend: `GET /articles/{id}` by server id,
review-notes endpoint, server-side revision history, and notifications.
The review UI and notification bell are built and wired to these
contracts but degrade to a "pending backend" state on 404 rather than
faking success. (The doc that used to track these requests,
`CMS-BACKEND-REQUESTS.md`, was removed — raise a new one if this needs
tracking again.)

## Known gaps / good next steps

- Public article *content* is still mock data (`src/lib/data/`), not
  backend-driven; only auth and article-create are live network calls.
- Six desks (Red Zone, The Vibe, The Whistle, Next Wave, The Brief, Home
  Ground) have no live route yet, only `/coming-soon` placeholders.
- The backend's section names don't carry Colouresh naming yet, so nav
  labels are hardcoded in `src/components/layout/navItems.ts` rather than
  backend-driven.
- No visual/browser regression pass was done on this cleanup (the Claude
  in Chrome extension wasn't connected in this environment) — worth a
  manual click-through of `/login` → `/verify` → `/username` next time a
  browser is available, to confirm the color fix looks right, not just
  that it compiles.

## Recent commit history (most recent first)

```
f416897 fix(auth): restore broken colouresh styling, remove unused shadcn scaffold
8ed244f feat(design): rebrand foundation — Colouresh tokens, fonts, and design rules
7e9c5d4 fix(admin,auth): resync section/subsegment slugs on rename, detect dead sessions in the background
08efe7f feat(newsroom): populate mock sections/articles, add dev-only mock fallback
edf8ecb feat(articles): ad slots, sticky engagement bar, threaded comments, reading progress
a7c6659 feat(admin,auth): editor fixes, people directory, writer feedback, CSRF header
2bc119a chore(assets): real favicon set, restore robots.txt, wire the manifest
ef6c7b0 style(footer): uppercase the Sections column headings
b791004 feat(membership): Paystack checkout, redesigned pricing and account
6eee17d feat(admin): role card, notifications, and an article review flow
5b4c914 feat(auth): rework sign-in on an editorial split-card layout
```
