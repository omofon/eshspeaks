# CLAUDE.md

EshSpeaks Newsroom — a Nigerian political/business/security news platform
(free/premium tiers) plus a standalone lead-gen product, "The Seat."

## Stack and history

Next.js App Router (React 19, TypeScript strict, Tailwind v4). The project
was originally scaffolded as TanStack Start (see stale references in
`AGENTS.md`), then migrated to Next.js. **The App Router lives at
`src/app/`, not a top-level `app/`.** A top-level `app/` from before the
`src/` move still exists as deleted-but-uncommitted in git status — don't
resurrect it or create a new top-level `app/`; it will silently shadow
nothing (Next only reads one app dir) but confuses tooling. `vite.config.ts`
and TanStack-era deps are leftover, not active.

`README.md`'s "mock data only, no backend, no real auth" is **stale**.
There is a real backend now (see Auth and CMS below); article _reads_ on
the public site still come from `src/lib/data/` mocks, but auth and
article-create are live network calls.

## Auth (`src/lib/auth/`)

- Backend base URL: `NEXT_PUBLIC_API_BASE_URL` (see `config.ts`); requests
  go to `${API_BASE_URL}/api/v1/...`. Empty in `.env.local` by default —
  auth calls fail closed (see `AuthError` "server" kind) until it's set.
- **Bearer-token API, not cookies.** `tokenStore.ts` and `AuthProvider.tsx`
  both state explicitly that this API has no session cookies: access token
  lives in a module-level JS variable (memory only, never localStorage),
  refresh token lives in `localStorage` under `esh.refreshToken`. This is a
  documented tradeoff, not an oversight.
  - **Known contradiction to resolve before trusting it:** `getServerSession.ts`
    forwards `cookies()` to the backend and assumes HttpOnly session
    cookies exist — that assumption conflicts with the bearer-only model
    documented in `tokenStore.ts`/`AuthProvider.tsx`. One of these is wrong
    about the live API; verify against the real backend before relying on
    server-side session gating.
- Response envelope is always `{success, data, message, errorCode}` —
  branch on `errorCode` (see `MESSAGES` map in `authService.ts`), never on
  `message` text.
- Roles (`UserRole`) are confirmed from the live backend as lower_snake_case
  wire values (`state_correspondent`, not `state-correspondent` etc.) —
  this exact mismatch already caused a silent publish-rights bug once (see
  `cms/types.ts` `EditorRole` comment). `membershipTier` (`FREE`/`PREMIUM`)
  and `role` are separate facts — gate paywalled content on
  `isSubscriber`/`membershipTier`, never on `role === "premium"`.
- `AuthProvider`'s `hasRole` is rank-based (`ROLE_RANK`), not exact-match —
  a `chief_editor` passes a `contributor`-only check.

## CMS / article editor (`src/lib/cms/`, `src/lib/api/articles*.ts`, `src/components/admin/editor/`)

- **This section previously said only `POST /articles` was live — that is
  now stale.** Confirmed-live write endpoints (see `src/lib/api/articles.ts`):
  `POST /articles`, `PATCH /articles/{id}` (content), `PATCH
/articles/{id}/status` (the _only_ way to move status — the update DTO
  rejects `status`), `DELETE /articles/{id}` (chief_editor), `POST
/articles/images`. Single-article read is `GET /articles/{slug}` only
  (auth-aware); there is still **no `GET /articles/{id}` by server id**.
  - `ArticleStatus` (`draft`/`in_review`/`published`/`archived`) is real
    server state once an article has a `remoteId`. Legal transitions and
    who may publish/archive (`section_lead`/`chief_editor`) are enforced by
    the backend; `STATUS_TRANSITIONS` in `ArticleEditor.tsx` only decides
    which actions to _offer_.
  - Autosave (`useAutosave.ts`) still writes to `localStorage` only —
    that's a deliberate choice (no per-keystroke PATCH), not a missing
    endpoint. Explicit "Save changes" calls `updateArticle()` (PATCH).
- Still genuinely missing (tracked in `CMS-BACKEND-REQUESTS.md`):
  `GET /articles/{id}` by id, editor→writer **review notes**
  (`/articles/{id}/review-notes`), server-side **revision history**, and
  **notifications** (`/notifications*`). The review UI
  (`src/components/admin/ReviewActions.tsx`) and `NotificationBell.tsx` are
  shells wired to that contract — they degrade to a "pending backend" state
  on 404, they don't fake success.

## Routing conventions

- Route groups: `(public)` for the reader-facing site, `(auth)` for the
  OTP-style email login flow (`login` → `verify` → `username`), `admin/`
  for the editorial CMS. Dynamic public routes are
  `[section]/[subsegment]/[slug]`.
- `tsconfig.json` path alias: `@/*` → `src/*`.

## Design rules (non-negotiable, see `README.md` for full palette/type table)

- No gradients, no emojis, no decorative stock photography, small radii
  (4–8px), sentence case UI copy (article headlines are the one exception).
- Fixed brand palette — don't introduce new colors ad hoc; muted gold is
  reserved for premium badges only.

## Dev-only tier/role preview

`src/lib/dev/previewTier.tsx` (`PreviewProvider`/`usePreview`) and
`DevTierToggle.tsx` let you preview the UI as logged-out/free/premium and
as different editorial roles **without a second backend account per
role**. This is display-only and inert in production
(`process.env.NODE_ENV !== "production"`) — it never decides real access;
SSR gates and the API remain the actual authority.

## Before committing

Run `npm run lint` and `npm run typecheck`. Favicon assets
(`public/favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`,
`apple-touch-icon.png`, `android-chrome-*.png`) are real images
regenerated from `public/eshspeaks_logo.png` with an external favicon
generator and committed directly; `scripts/generate-favicon.cjs` is
retired. Keep `public/site.webmanifest` and the `icons` block in
`src/app/layout.tsx` in sync if any filenames change.
