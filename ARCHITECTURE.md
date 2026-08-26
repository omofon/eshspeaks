# EshSpeaks Newsroom — Architecture & Project Guide

A working reference for understanding the codebase: what it is, how the pieces fit together, where
everything lives, and where to go to make a change. Written for someone who needs to make UI
updates and explain the system to others — not a sales document (see the client-facing sprint
report for that framing).

Companion docs: `CLAUDE.md` (rules the codebase must follow — read that too, it's shorter and more
authoritative on conventions), `public/docs/` (original PRD/TRD/5-week sprint plan from
SenseConnect, `.docx`).

---

## 1. What this is

EshSpeaks is a Nigerian politics/business/security news platform with a free/premium tier split,
plus a standalone editorial channel called **The Seat**. It has two audiences baked into one
codebase:

- **Readers** — the public site: homepage, section/subsegment feeds, article pages, comments,
  likes, search, subscription marketing.
- **Editorial staff** — a custom CMS under `/admin` for four roles (`contributor`,
  `state_correspondent`, `section_lead`, `chief_editor`) to draft, review, publish, and manage
  content, sections, and other editorial users.

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-based `@theme`, no `tailwind.config.js`) |
| Server state | TanStack React Query v5 (client-side cache/dedup) |
| Forms | react-hook-form + zod (where used) |
| Icons | lucide-react — this is the only icon library in the project |
| UI primitives | Radix UI, wrapped as shadcn-style components in `src/components/ui/` |
| Backend | A separate NestJS-style REST API at `https://eshspeak-backend.onrender.com`, consumed entirely over HTTP — this repo has no database and no server-side business logic beyond thin Next.js route handlers |

Path alias: `@/*` → `src/*` (see `tsconfig.json`).

Two abandoned things still visible in the repo, ignore them: a `vite.config.ts` /
TanStack-Start-era leftover from before the project moved to Next (see `AGENTS.md` for the stale
history), and `src/components/SiteShell.tsx`, which is dead code — nothing imports it. The real
page shell is `(public)/layout.tsx` / `admin/layout.tsx`, described below.

## 3. Where things stand

Everything described in this document is real, working code — not a plan. Article CRUD, the full
draft→review→publish lifecycle, comments/likes/feedback, section/subsegment management, editorial
role assignment, and comment moderation are all live against the real backend. The two things that
are **not** live end-to-end:

- **Payments/subscriptions.** `/pricing` is marketing UI with a CTA; there's no Paystack
  integration because the backend doesn't have one yet. Nothing here fakes a successful
  subscription.
- **Search.** There's no `/search` backend endpoint. `SearchOverlay` and `/search` filter the real
  `GET /articles` response client-side by headline/dek — honest results over real data, not a
  fabricated index, but not full-text search either.

Everything else — including things the original sprint-planning doc undersold (e.g. the editor is
a full rich-text/WYSIWYG editor, not the "Markdown-first" editor originally scoped) — is built and
wired to the real API.

---

## 4. Directory map

```
src/
  app/                          Next.js App Router — routes live here, not a top-level app/
    layout.tsx                  Root layout: fonts, QueryProvider, PreviewProvider, AuthProvider,
                                 CookieBanner/CookieSettingsModal (global, outside any route group)
    globals.css                 The entire design system: colors, type scale, spacing, utilities
    error.tsx / global-error.tsx / not-found.tsx    App-wide error/404 boundaries
    api/markets/route.ts        The one real Next.js API route (proxies market-ticker data)

    (public)/                   Reader-facing site — route group, no URL segment
      layout.tsx                 Wraps every public page in SiteHeader + SiteFooter
      loading.tsx                 Root-level skeleton fallback
      page.tsx                    Homepage
      [section]/page.tsx          Section feed, e.g. /business-economy
      [section]/[subsegment]/page.tsx        Subsegment feed
      [section]/[subsegment]/[slug]/page.tsx Article page
      search/page.tsx             Full search results page
      the-seat/page.tsx           The Seat editorial channel
      account/page.tsx            Signed-in reader account page
      pricing/page.tsx            Subscription/membership marketing page
      about/, contact/, advertise/, careers/, privacy/, terms/, cookies/   Legal & company pages

    (auth)/                     Passwordless login flow — route group, no URL segment
      layout.tsx
      login/page.tsx              Email entry + Google OAuth button
      verify/page.tsx              OTP code entry
      username/page.tsx            First-time username claim (post-verify onboarding)

    admin/                      Editorial CMS — requires an editor role, gated client-side
      layout.tsx                 Role gate + admin sub-nav (Overview/Articles/Moderation/Roles/Sections)
      page.tsx                    Overview dashboard (real counts, quick links)
      error.tsx
      articles/
        layout.tsx
        page.tsx                  Article list (status filter, "mine only" toggle, pagination)
        editor/page.tsx           New-story editor
        editor/[id]/page.tsx      Edit-existing-story editor (id = slug or local draft id)
      moderation/page.tsx        Comment moderation queue (section_lead+)
      roles/page.tsx              Editorial user + role/section assignment (chief_editor only)
      sections/page.tsx           Section & subsegment CRUD (chief_editor only)

  components/
    editorial.tsx                THE canonical article card system — FeaturedCard, ListCard,
                                  HorizontalCard, OpinionCard, CuratedCard, SectionBadge, etc.
                                  Used by section/subsegment pages, article page, search, the-seat,
                                  account, MarketDashboard.
    home/                         A SEPARATE card system used ONLY by the homepage — see §7.
      cards.tsx, primitives.tsx, sections.tsx, TrendingRail.tsx, TheSeatCard.tsx, index.ts
    editorial/PaywallPanel.tsx    The "subscribe to keep reading" panel
    ArticleView.tsx               Full article page body (breadcrumb, headline, paywall gate,
                                   engagement bar, feedback, comments, related stories)
    ArticleFeedback.tsx           "Was this useful?" widget
    EngagementBar.tsx             Like + share + comment-count bar
    CommentThread.tsx             Comment list + post form
    SearchOverlay.tsx             The header's inline search (not a page navigation)
    SearchResults.tsx             /search page's result list
    AdSlot.tsx                    Placeholder ad unit, hidden for subscribers
    SiteHeader.tsx / SiteFooter.tsx   Top-level header/footer, composed into layouts
    HeaderAccountMenu.tsx          Signed-in account dropdown in the header
    CookieBanner.tsx / CookieSettingsModal.tsx   Cookie consent UI
    NewsletterSignup.tsx
    MarketDashboard.tsx            Market ticker detail view (still mock data — see §12)

    layout/                       Header/nav building blocks
      MobileHeader.tsx             Mobile top bar (logo, search, hamburger)
      MobileNavigationDrawer.tsx   Mobile slide-out nav (sections + sign in/subscribe)
      UtilityBar.tsx                Desktop top strip (search, date, logo, subscribe, account)
      SectionNavigation.tsx         Desktop section nav bar
      SectionDropdown.tsx           A section's subsegment dropdown, used inside SectionNavigation
      MarketTicker.tsx               Scrolling ticker strip
      Masthead.tsx, Wordmark.tsx, whiteLogo.tsx   Logo/wordmark variants

    admin/editor/                 The CMS article editor, split into focused pieces
      ArticleEditor.tsx             The orchestrator — owns DraftState, autosave, status transitions
      SelectionToolbar.tsx          Bold/italic/link toolbar on text selection
      InsertMenu.tsx                 "/"-style insert menu (image, embed, etc.)
      MentionMenu.tsx                "@"-mention picker (byline/collaborator lookup — mock data, see §12)
      InlinePopover.tsx              Shared popover shell used by the toolbar/menus
      StorySettingsDrawer.tsx        Side drawer: featured image, title/slug, section/subsegment/
                                      tags (taxonomy), tier + source type, revision history
      HelperBar.tsx                   Word count / read time / autosave status strip

    account/ProfileSettings.tsx     Avatar upload/remove + username change, used on /account
    legal/LegalPageLayout.tsx       Shared shell for about/contact/privacy/terms/etc.
    auth/                           Login flow components
      EmailAuthForm.tsx, OTPForm.tsx, UsernameForm.tsx, SocialAuthButtons.tsx, AuthShell.tsx,
      AuthDivider.tsx, ArticleAccessGate.tsx (wraps content behind an auth check)

    skeletons.tsx                  Shared skeleton primitives (ArticleCardSkeleton, etc.)
    ui/                             shadcn/Radix-based primitives (button, dialog, dropdown-menu,
                                    input, select, tabs, skeleton, alert-dialog, sonner toasts, ...)
                                    — generic, not EshSpeaks-specific; edit sparingly

  hooks/
    useSectionsCatalog.ts          THE shared section-data hook — React Query, one fetch for every consumer
    useArticle.ts                   Loads one article by slug (client-side, so the reader's bearer
                                     token is attached and gating is evaluated correctly)
    useArticleLike.ts               Like toggle with optimistic update + rollback
    useComments.ts                  Comment list + optimistic post
    useAutosave.ts                  Debounced localStorage draft persistence
    useDraftLoader.ts               Resolves a route id to either a local draft or a real article
    useEditorRole.ts                Current user's role, narrowed to editor roles (or null)
    useOutsideClick.ts               Generic "close on click outside" hook
    use-mobile.tsx                  Viewport breakpoint hook (shadcn boilerplate)

  lib/
    api/
      client.ts                     THE HTTP client: envelope unwrapping, ApiError, bearer auth,
                                     401-refresh-and-retry, pagination helper. Everything else in
                                     lib/api/ is built on top of this.
      types.ts                      Wire types for API responses (ApiSection, ApiArticleSummary,
                                     ApiArticleDetail, ApiComment, isArticleUnlocked(), ...)
      adapters.ts                   Converts API shapes into the UI's Article/Section shapes
                                     (toUiArticle, toUiSection, apiArticleToDraft)
      articles.ts                    Article CRUD + list + like + feedback + image upload
      sections.ts                    Section/subsegment CRUD + fetch, with Next.js fetch caching
      comments.ts                    Comment fetch/post/moderate
      roles.ts                       Editorial user fetch + role/section assignment
      users.ts                       Avatar upload/remove
      oembed.ts                      Social embed detection/normalization (Twitter/X, YouTube, FB)
    auth/
      AuthProvider.tsx                React context: current user, session status, hasRole(), signOut()
      authService.ts                  Auth HTTP calls (email OTP request/verify, refresh, logout, /me)
      tokenStore.ts                   Bearer token storage (access token in memory, refresh in localStorage)
      config.ts                       API_BASE_URL from env
      types.ts                        UserRole, MembershipTier, CurrentUser
      returnTo.ts                     Safe post-login redirect handling
      useAuthGatedAction.ts           "Run this action, or redirect to login first" helper
      maskEmail.ts                    Email masking for OTP-sent-to display
    cms/
      types.ts                        DraftState, ArticleStatus, ContentTier, SourceType, EditorRole,
                                       canPublishDirectly(), status-transition rules
      slugify.ts                      Headline → URL slug
    data/                             MOCK DATA — legacy fixtures, mostly superseded by the real API.
                                       Still live for: market ticker (MarketDashboard), the CMS
                                       editor's @-mention people list, and as a documented dev-only
                                       fallback in useSectionsCatalog behind an env flag. See §12.
    dev/previewTier.tsx               Dev-only role/tier preview context (PreviewProvider/usePreview) —
                                       inert in production, used by the CMS editor's role-preview control
    query/QueryProvider.tsx           React Query client setup (staleTime, retry policy)
    storage/draftStorage.ts           localStorage draft persistence (the autosave backing store)
    cookieConsent.tsx                 Cookie consent state/context
    utils.ts                          `cn()` class-merge helper (shadcn boilerplate)
```

---

## 5. Every page, what it renders, and what it fetches

| Route (URL) | File | Renders | Real data from |
|---|---|---|---|
| `/` | `app/(public)/page.tsx` | Homepage — lead section grid + per-section story grids | `fetchSections()` + `fetchAllArticles()` (single call, grouped client-side by section) |
| `/[section]` | `app/(public)/[section]/page.tsx` | Section feed with subsegment chips, paginated list | `fetchSection(slug)` + `fetchArticlesBySection(slug, {page,limit})` |
| `/[section]/[subsegment]` | `.../[subsegment]/page.tsx` | Subsegment feed | `fetchSubsegment()` + `fetchArticlesBySubsegment()` |
| `/[section]/[subsegment]/[slug]` | `.../[slug]/page.tsx` → `<ArticleView>` | Full article: breadcrumb, headline, body/paywall, engagement, comments, related stories | `fetchArticleBySlug()` (client-side, via `useArticle`, so the reader's token is attached) |
| `/search` | `app/(public)/search/page.tsx` → `<SearchResults>` | Search results | Client-side filter over `fetchAllArticles()` |
| `/the-seat` | `app/(public)/the-seat/page.tsx` | The Seat channel | `fetchArticlesBySubsegment("features-ideas", "the-seat")` — modeled as a real backend subsegment |
| `/account` | `app/(public)/account/page.tsx` | Reader account: identity, subscription status, activity (stub), editorial shortcut | `useAuth()` + `<ProfileSettings>` |
| `/pricing` | `app/(public)/pricing/page.tsx` | Subscription marketing/CTA | No backend — payments don't exist yet |
| `/about`, `/contact`, `/advertise`, `/careers`, `/privacy`, `/terms`, `/cookies` | `app/(public)/<name>/page.tsx` | Static legal/company pages via `<LegalPageLayout>` | Static content |
| `/login` → `/verify` → `/username` | `app/(auth)/...` | Email OTP login flow, then Google OAuth alternative, then first-time username claim | `authService` (email/request, email/verify, google redirect) |
| `/admin` | `app/admin/page.tsx` | CMS overview: real story counts by status, quick links by role | `fetchEditorialArticles({limit:1})` × 4, `fetchEditorialUsers()` |
| `/admin/articles` | `app/admin/articles/page.tsx` | Editorial article list, status filter, "mine only" | `fetchEditorialArticles()` |
| `/admin/articles/editor` | `.../editor/page.tsx` | New story editor | — |
| `/admin/articles/editor/[id]` | `.../editor/[id]/page.tsx` | Edit story | `useDraftLoader` (local draft or `fetchArticleBySlug`) |
| `/admin/moderation` | `app/admin/moderation/page.tsx` | Comment moderation queue | `fetchModerationQueue()` / `moderateComment()` |
| `/admin/roles` | `app/admin/roles/page.tsx` | Editorial user + role/section assignment | `fetchEditorialUsers()` / `assignRole()` / `assignSections()` |
| `/admin/sections` | `app/admin/sections/page.tsx` | Section/subsegment CRUD | `createSection`/`updateSection`/`deleteSection`/`createSubsegment`/... |

---

## 6. Layout composition — how the chrome fits together

**Public pages** (`app/(public)/layout.tsx`):

```
PublicLayout
 └─ SiteHeader                        (components/SiteHeader.tsx)
     ├─ MobileHeader                   visible < md: logo, search, hamburger → MobileNavigationDrawer
     └─ sticky desktop header, visible ≥ md:
         ├─ UtilityBar                 search overlay trigger, date, logo, Subscribe CTA, HeaderAccountMenu
         ├─ SectionNavigation          section links (+ SectionDropdown for ones with subsegments), "The Seat"
         └─ MarketTicker                scrolling market strip
 └─ <main> page content
 └─ SiteFooter                        sections (live), company links, account links, newsletter, legal
```

Both `SectionNavigation` and `MobileNavigationDrawer` call the same `useSectionsCatalog()` hook —
React Query dedupes this to one network call no matter how many components mount it (see §8).

**Admin pages** (`app/admin/layout.tsx`): a client-side role gate (`isAuthenticated &&
isEditorRole(role)`, redirects to `/login` otherwise — **not a security boundary**, just avoids
flashing admin UI; every actual write is re-authorized by the backend) plus a top nav bar linking
to Overview/Articles/Moderation (`section_lead`+)/Roles (`chief_editor`)/Sections
(`chief_editor`), rendered conditionally by role.

`CookieBanner` / `CookieSettingsModal` are mounted once in the root `app/layout.tsx`, outside both
route groups, so they appear everywhere.

---

## 7. The two card systems — read this before touching a card

There are genuinely **two separate article-card component sets**. This is not an accident to
"fix" — it's a deliberate split at exactly one boundary:

- **`src/components/editorial.tsx`** — the canonical system. `FeaturedCard`, `ListCard`,
  `HorizontalCard`, `OpinionCard`, `CuratedCard`, `SectionBadge`, `PremiumBadge`. Used by
  **everything except the homepage**: section pages, subsegment pages, search, the-seat, account,
  `ArticleView`'s related-stories rail, `MarketDashboard`.
- **`src/components/home/*`** — used **only by the homepage** (`app/(public)/page.tsx`), via
  `SectionLeadGrid` / `SectionStoryGrid` (from `home/sections.tsx`), which render `StoryCard` /
  `CompactStoryCard` (from `home/cards.tsx`). This system has its own primitives file
  (`home/primitives.tsx`: `Kicker`, `Byline`, `Media`, `SectionHeader`) with a different visual
  grammar (CSS custom-property class names like `headline-lg`, `.kicker`) — both ultimately draw
  from the same design tokens in `globals.css`, they're just named differently.

If you're changing how an article card looks on the **homepage**, edit `home/cards.tsx` /
`home/primitives.tsx`. If you're changing it **anywhere else**, edit `editorial.tsx`. Don't try to
unify them without a deliberate decision to do so — that's a real architectural change, not a
"minor UI update."

Both systems read from the same `Article` type (`src/lib/data/types.ts`), which real API data is
adapted into via `toUiArticle()` (`src/lib/api/adapters.ts`). Note the `sectionName` field on
`Article`: it comes straight from the API response's embedded section reference, precisely so
cards never need to re-resolve a slug through a separate section lookup.

---

## 8. Data layer — how a page gets real data

**The HTTP client** (`src/lib/api/client.ts`) is the single foundation everything else builds on:

- `apiRequest<T>(path, opts)` — unwraps the `{success, data, message, errorCode}` envelope,
  attaches `Authorization: Bearer <token>` when `opts.auth` is true, retries once on 401 via
  `authService.refresh()`, throws a typed `ApiError` (`kind`: `network` / `unauthorized` /
  `forbidden` / `not_found` / `conflict` / `validation` / `rate_limited` / `server` / `unknown`).
- `apiRequestPaginated<T>(path, opts)` — same, but returns `{items, meta}` for list endpoints.
- Works from both server components (Next's `fetch` cache via `next: {revalidate}`) and client
  components (plain browser `fetch`, deduped/cached by React Query instead).

**Feature modules** in `lib/api/` (`sections.ts`, `articles.ts`, `comments.ts`, `roles.ts`,
`users.ts`) are thin wrappers over `apiRequest`/`apiRequestPaginated` — one function per backend
endpoint, each documented with the exact confirmed request/response shape. See §9 for the full
endpoint table.

**Adapters** (`lib/api/adapters.ts`) convert wire types (`ApiArticleSummary`, `ApiSection`, ...)
into the UI's presentation types (`Article`, `Section` from `lib/data/types.ts`), so the card
components and the homepage never touch raw API shapes directly.

**Section-data caching** (the fix for a real 429/duplicate-request problem this project had) works
like this: `useSectionsCatalog()` (`hooks/useSectionsCatalog.ts`) wraps `fetchSections()` in a
React Query `useQuery` with a shared key (`SECTIONS_QUERY_KEY = ["sections"]`), `staleTime: 5min`.
Every consumer — header nav, mobile drawer, footer, admin roles page, admin sections page — calls
this same hook, and React Query collapses concurrent/repeated calls into one network request. The
`QueryClient` itself (`lib/query/QueryProvider.tsx`, mounted once in root `layout.tsx`) sets a
global `staleTime: 60s`, `refetchOnWindowFocus: false`, and backs off retries entirely on
`rate_limited`/`unauthorized`/`forbidden` errors rather than hammering the backend. Article-list
endpoints similarly sit behind `next: {revalidate: 60}` server-side.

---

## 9. Auth — how a session actually works

This backend is **bearer-token only, no usable session cookies** (it does set cookies on
`/auth/email/verify`, but they're scoped to the backend's own domain and this frontend runs on a
different origin, so the browser never sends them here — see the comment in `authService.ts`).
Concretely:

1. **Login**: `EmailAuthForm` → `authService.requestEmailCode(email)` (`POST /auth/email/request`)
   → `OTPForm` → `authService.verifyEmailCode(email, code)` (`POST /auth/email/verify`) → response
   includes `{accessToken, refreshToken, expiresIn}`, stored via `tokenStore.set()`. Google OAuth
   is the alternative path: `authService.startGoogle()` redirects to `GET /auth/google`.
2. **Token storage** (`tokenStore.ts`): access token lives in a **module-level JS variable**
   (memory only — never touches localStorage, so a compromised third-party script/ad tag can't
   read it). Refresh token lives in `localStorage["esh.refreshToken"]` — the necessary tradeoff of
   a bearer-only API with no httpOnly cookie option.
3. **Session bootstrap** (`AuthProvider.tsx`, mounted once in root `layout.tsx`): on load, checks
   for a stored refresh token; if present, calls `authService.refresh()` (`POST /auth/refresh`)
   then `GET /auth/me` to populate `user`. `AuthProvider` also schedules a **proactive refresh**
   ~60s before the access token expires, so requests don't eat a reactive 401-retry round trip.
4. **`useAuth()`** exposes: `user`, `status` (`loading`/`authenticated`/`anonymous`),
   `isAuthenticated`, `isSubscriber` (= `membershipTier === "PREMIUM"` — **never** gate paywall
   content on `role`), `role`, `needsUsername`, `hasRole(roles)` (rank-based: `chief_editor`
   passes a `contributor`-only check), `signOut()`.
5. **Route protection**: `useAuthGatedAction.ts` provides "run this now, or send them to
   `/login?returnTo=...` first" for reader actions (like, comment, subscribe); `admin/layout.tsx`
   does the equivalent at the route level for the CMS. Neither is the real authorization boundary
   — the backend's own guard on every write is.

**Roles** (`UserRole` in `lib/auth/types.ts`): `reader`, `premium`, `contributor`,
`state_correspondent`, `section_lead`, `chief_editor` — confirmed lower_snake_case wire values.
`EditorRole` (`lib/cms/types.ts`) is a derived subset (`contributor` | `state_correspondent` |
`section_lead` | `chief_editor`) used everywhere in the CMS. `canPublishDirectly(role)` is true for
`section_lead`/`chief_editor` — a story they submit goes straight to `published`; anyone else's
goes to `in_review` first.

---

## 10. CMS / article editor — how content gets made

**Draft model** (`lib/cms/types.ts`): `DraftState` mirrors the real `POST /articles` request body
exactly (`headline`, `slug`, `dek`, `body`, image fields, `sectionId`, `subsegmentId`,
`sectorTags`, `contentTier` (`FREE`/`PREMIUM`), `sourceType` (`ORIGINAL`/`CURATED`/`PARTNER`), meta
fields). `ArticleStatus` = `draft` → `in_review` → `published` → `archived`, server-authoritative
once the draft has a `remoteId`.

**Autosave** (`hooks/useAutosave.ts` + `lib/storage/draftStorage.ts`) is **localStorage-only** — it
never hits the network. `useDraftLoader.ts` resolves the editor route's `[id]` param: if it matches
a local draft, load it from localStorage; otherwise treat it as a real article slug and fetch it
via `fetchArticleBySlug()`, converting the response to a `DraftState` with `apiArticleToDraft()` so
the editor knows immediately it's editing (PATCH target), not creating (POST).

**`ArticleEditor.tsx`** is the orchestrator: owns the `DraftState`, wires up the toolbar/menus,
computes which status transitions to offer via `STATUS_TRANSITIONS` (gated by
`canPublishDirectly`), and calls the right API function on save/submit/publish/delete
(`submitArticle` / `updateArticle` / `changeArticleStatus` / `deleteArticle`). The body itself is a
**`contentEditable` rich-text editor** using `document.execCommand` for bold/italic/underline/
strikethrough/links/headings (`SelectionToolbar.tsx`), a slash-style `InsertMenu.tsx` for
images/embeds, and `MentionMenu.tsx` for `@`-mentions (still backed by mock data — see §12).
`StorySettingsDrawer.tsx` holds the side-panel fields: featured image, title/slug, taxonomy
(section/subsegment/sector tags), tier + source type, and revision history.

---

## 11. Reader engagement — likes, comments, feedback, share

All wired to the real backend, no fake state:

- **Like**: `EngagementBar` → `useArticleLike` (`hooks/useArticleLike.ts`) → `toggleArticleLike()`
  (`POST /articles/:id/like`) — optimistic UI update with rollback on error, gated through
  `useAuthGatedAction`.
- **Comments**: `CommentThread` → `useComments` (`hooks/useComments.ts`) → `fetchComments()` /
  `postComment()` — optimistic insert, honors the server's returned moderation `status`
  (`pending`/`approved`/`rejected`), shows a "Pending review" badge on the reader's own unapproved
  comment.
- **Feedback**: `ArticleFeedback` → `submitArticleFeedback()` (`POST /articles/:id/feedback`).
- **Share**: `EngagementBar`'s share menu — native `navigator.share()` where supported, falling
  back to WhatsApp/X/Facebook/LinkedIn intent links + copy-to-clipboard. No backend endpoint exists
  for this (confirmed against the live OpenAPI spec), so nothing is logged server-side — this is
  intentional, not a gap.
- **Moderation**: `admin/moderation/page.tsx` → `fetchModerationQueue()` / `moderateComment()`
  (`lib/api/comments.ts`), gated to `section_lead`+.

---

## 12. Where mock data still lives (and why that's fine)

`src/lib/data/` is legacy mock fixtures from before the real backend existed. Three places still
use it deliberately, each documented in-code:

1. **`useSectionsCatalog.ts`** — a mock-catalog fallback, gated behind
   `NEXT_PUBLIC_USE_MOCK_DATA=true`, so the editor stays usable offline/pre-backend. Never mixed
   into a production response silently.
2. **`MarketDashboard.tsx`** — reads `lib/data/articles.ts`'s `bySubsegment` for its market-related
   story rail; there's no backend market-content endpoint.
3. **`MentionMenu.tsx`** (CMS editor's `@`-mention picker) — uses a static byline pool as a
   stand-in for a real newsroom-directory endpoint that doesn't exist yet.

`SiteFooter.tsx` used to read the mock `lib/data/sections.ts` too — that was a real bug (the
mock's slugs like `security-watch`/`energy-power` don't match the live backend's actual slugs like
`metro-security`, so footer section links 404'd). It's now switched to the real
`useSectionsCatalog()` hook like everything else.

---

## 13. Design system quick reference

Everything lives in `src/app/globals.css` under `:root` and `@theme inline` (Tailwind v4 — no
`tailwind.config.js`). Don't hardcode a color; use the token.

**Palette** (CSS var → Tailwind class, e.g. `--navy` → `bg-navy` / `text-navy`):

| Role | Token | Hex |
|---|---|---|
| Foundation | `--navy` / `--navy-soft` / `--navy-deep` | `#0d1b3d` / `#172a56` / `#070f24` |
| Signature accent | `--accent` / `--accent-hover` / `--accent-soft` | `#c9541f` / `#a9430f` / `#faeadf` |
| Secondary/editorial depth | `--maroon` / `--maroon-soft` | `#6e1f2a` / `#f6eaec` |
| Premium-only | `--gold` | `#d9a441` — **reserved for premium badges, don't reuse elsewhere** |
| Canvas | `--background` | `#fcfbf8` (off-white, not pure white) |
| Feedback | `--success` / `--warning` / `--error` / `--info` (+ `-soft` variants) | green / amber / red / blue |
| Section tints | `--tint-politics`, `--tint-business`, `--tint-security`, `--tint-stateofplay`, `--tint-energy`, `--tint-law`, `--tint-foreign`, `--tint-tech`, plus `--tint-culture`/`-opinion`/`-technology`/`-society`/`-interviews` | category-indicator colors, used by `SectionBadge`/`Kicker` |

**Type**: `--font-serif` (Newsreader — headlines/editorial body), `--font-sans` (Inter — UI chrome),
`--font-mono` (IBM Plex Mono — metadata/timestamps), `--font-wordmark` (Bodoni Moda — the
masthead). Utility classes: `headline-lg`/`-md`/`-sm`, `display-xl`, `body-editorial`,
`pull-quote`, `meta`, `kicker`/`kicker-muted`.

**Radius**: `--radius-sm: 4px`, `-md: 6px`, `-lg: 10px`, `-xl: 14px` — deliberately small/restrained,
per the "no decorative, small radii" design rule in `CLAUDE.md`.

**Buttons**: `.btn-primary` (navy), `.btn-accent` (orange), `.btn-ghost` (outlined) — utility
classes defined in `globals.css`, not a React `<Button>` wrapper for the editorial UI (the `ui/`
folder's shadcn `Button` component is separate and used more in form-heavy contexts like the CMS).

**Rules**: sentence case UI copy everywhere (article headlines are the one exception), no
gradients, no emojis, no stock photography — see `CLAUDE.md` for the full non-negotiable list.

---

## 14. Backend endpoint inventory (everything the frontend actually calls)

Base path `/api/v1` on `https://eshspeak-backend.onrender.com` (from `NEXT_PUBLIC_API_BASE_URL`).

| Endpoint | Method | Called from | Used by (pages/components) |
|---|---|---|---|
| `/auth/email/request` | POST | `authService.requestEmailCode` | `EmailAuthForm` |
| `/auth/email/verify` | POST | `authService.verifyEmailCode` | `OTPForm` |
| `/auth/google` | GET | `authService.googleAuthUrl`/`startGoogle` | `SocialAuthButtons` |
| `/auth/refresh` | POST | `authService.refresh` (internal `tryRefresh`) | `AuthProvider` bootstrap + proactive refresh, `client.ts`'s 401 retry |
| `/auth/logout` | POST | `authService.logout` | `useAuth().signOut()` (HeaderAccountMenu, account page) |
| `/auth/me` | GET | `authService.getCurrentUser` | `AuthProvider` |
| `/users/me/username` | POST | `authService.setUsername` | `UsernameForm` |
| `/users/me/avatar` | POST / DELETE | `uploadAvatar` / `removeAvatar` (`lib/api/users.ts`) | `ProfileSettings` (account page) |
| `/sections` | GET / POST | `fetchSections` / `createSection` | `useSectionsCatalog` (header/footer/drawer/roles/sections admin), `/admin/sections` |
| `/sections/:slug` | GET / PATCH / DELETE | `fetchSection` / `updateSection` / `deleteSection` | `[section]/page.tsx`, `/admin/sections` |
| `/sections/:slug/:subsegmentSlug` | GET | `fetchSubsegment` | `[section]/[subsegment]/page.tsx` |
| `/sections/:slug/subsegments` | POST | `createSubsegment` | `/admin/sections` |
| `/sections/:slug/subsegments/:subSlug` | PATCH / DELETE | `updateSubsegment` / `deleteSubsegment` | `/admin/sections` |
| `/articles` | GET / POST | `fetchAllArticles` / `submitArticle` | Homepage (GET); `/admin/articles/editor` (POST) |
| `/articles/:slug` | GET | `fetchArticleBySlug` | `useArticle` → `ArticleView`; `generateMetadata` on the article page |
| `/articles/:id` | PATCH / DELETE | `updateArticle` / `deleteArticle` | `/admin/articles/editor/[id]` |
| `/articles/:id/status` | PATCH | `changeArticleStatus` | `ArticleEditor`'s status-transition buttons |
| `/articles/sections/:slug` | GET | `fetchArticlesBySection` | `[section]/page.tsx`, `ArticleView`'s related-stories rail |
| `/articles/sections/:slug/:subSlug` | GET | `fetchArticlesBySubsegment` | `[section]/[subsegment]/page.tsx`, `/the-seat` |
| `/articles/editorial/mine` | GET | `fetchEditorialArticles` | `/admin`, `/admin/articles` |
| `/articles/images` | POST | `uploadArticleImage` | `ArticleEditor`'s image insert |
| `/articles/:id/like` | POST | `toggleArticleLike` | `EngagementBar` via `useArticleLike` |
| `/articles/:id/feedback` | POST | `submitArticleFeedback` | `ArticleFeedback` |
| `/articles/:id/comments` | GET / POST | `fetchComments` / `postComment` | `CommentThread` via `useComments` |
| `/articles/comments/moderation` | GET | `fetchModerationQueue` | `/admin/moderation` |
| `/articles/comments/:id/status` | PATCH | `moderateComment` | `/admin/moderation` |
| `/roles/editorial-users` | GET | `fetchEditorialUsers` | `/admin` (count), `/admin/roles` |
| `/roles/assign` | POST | `assignRole` | `/admin/roles` |
| `/roles/sections` | POST | `assignSections` | `/admin/roles` |

Endpoints referenced in the original sprint contract that **do not exist yet** on the backend:
subscription checkout/status (Paystack), search, newsletter subscribe, The Seat lead-capture,
share-event logging, admin analytics aggregation. Nothing in the frontend fakes these.

---

## 15. "I want to change X" — quick pointers

- **Homepage article card look** → `src/components/home/cards.tsx` + `home/primitives.tsx`
- **Any other page's article card look** → `src/components/editorial.tsx`
- **Header/nav** → `src/components/SiteHeader.tsx` composes `layout/UtilityBar.tsx` (desktop),
  `layout/MobileHeader.tsx` + `MobileNavigationDrawer.tsx` (mobile), `layout/SectionNavigation.tsx`
  + `SectionDropdown.tsx` (section links)
- **Footer** → `src/components/SiteFooter.tsx`
- **Colors/type/spacing** → `src/app/globals.css` only — never hardcode a hex value in a component
- **Paywall copy/upsell** → `src/components/editorial/PaywallPanel.tsx`
- **Article page layout** → `src/components/ArticleView.tsx`
- **Like/share/comment bar** → `src/components/EngagementBar.tsx`
- **Comment list/form** → `src/components/CommentThread.tsx`
- **Search overlay UI** → `src/components/SearchOverlay.tsx`
- **CMS editor toolbar/fields** → `src/components/admin/editor/` (see §10 for which file owns what)
- **Admin dashboard cards/nav** → `src/app/admin/page.tsx` (overview), `src/app/admin/layout.tsx` (nav)
- **Loading skeletons** → `src/components/skeletons.tsx` (shared primitives) or a route's own
  `loading.tsx` (e.g. `app/(public)/[section]/loading.tsx`)
- **Cookie banner** → `src/components/CookieBanner.tsx` / `CookieSettingsModal.tsx` /
  `src/lib/cookieConsent.tsx`

Before any UI change: run `npm run typecheck && npm run lint` (see `CLAUDE.md`), and for anything
touching layout/responsiveness, actually load the page — a couple of real bugs in this codebase
(dead footer links, silently-dropped section badges) only showed up by reading the rendered output,
not by reading the component code in isolation.
