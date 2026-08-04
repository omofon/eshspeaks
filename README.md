# EshSpeaks Newsroom

if nextjs isnt supported use react You are building the frontend for EshSpeaks, a Nigerian political, business, and security news platform with a free/premium tier and a standalone lead-gen product called "The Seat." Build a static Next.js site (App Router, static export) styled as a modern editorial newsroom — not a generic blog theme, not a SaaS dashboard.

Tech stack

Next.js (App Router), configured for static export (output: 'export')

Tailwind CSS

TypeScript

Mock data layer only — no real backend or auth yet. Simulate logged-out / free / premium states with local component state (e.g. a dev toggle), so the UI is fully demonstrable without a server.

No external UI libraries that impose their own visual style (no default shadcn theme, no Bootstrap). Hand-build components on Tailwind.

Non-negotiable design rules

No gradients anywhere. Flat, solid color fills only.

No emojis anywhere, in UI copy or as icons. Use a proper icon set (e.g. Lucide or Tabler, outline style only) for any icons.

No drop shadows except a subtle one for elevated cards/modals — keep it minimal, not glassy.

No decorative stock photography or filler gradients behind hero sections. Typography and layout carry the design.

Sentence case for all UI labels and headings, never Title Case or ALL CAPS (headline copy in article titles is the one exception, written naturally).

Rounded corners stay small and restrained (4–8px) — this is a newsroom, not a bubbly consumer app. No pill-shaped buttons except small tags/badges.

Visual identity

Primary — Navy #0D1B3D: header/masthead background, primary text, nav

Accent — Burnt orange #C9541F: CTAs, active nav states, The Seat's branding, links

Premium marker — Muted gold #D9A441 (on #3D2C0A text): reserved only for Premium tags/badges — do not reuse this color elsewhere

Background — warm off-white #F5F1E8, not pure white

Body text — charcoal #2C2C2A, not pure black

Market ticker colors — green #8FB08A for up, muted red #E07A5F for down, on navy background

Section tint system — assign each of the 8 sections (Politics, Business & Economy, Security Watch, State of Play, and 4 more you name sensibly for a Nigerian political/business/security publication) a distinct muted tag color used only on small section labels, not full backgrounds

Typography

Headlines: a serif with editorial weight — use "Newsreader" or "Source Serif 4" from Google Fonts

UI, nav, metadata, body copy: a clean grotesk sans — use "Inter"

Market ticker and any tabular data: a monospace font (e.g. "IBM Plex Mono") for numeric alignment

Two weights only per font family in general UI (regular + one bold weight) — avoid a pile of font-weight variations

Layout language

Header: navy masthead bar with wordmark, primary nav (8 sections), search icon, account/subscribe control

Below the header: a thin navy ticker strip showing 3–4 live-style market figures (mocked, animate/update client-side every few seconds using setInterval on the mock data to feel alive)

Print-inspired grid on the homepage and section pages: a lead story, then a grid of secondary stories, clear horizontal rule dividers between zones, no card-soup of identical boxes

Footer: full sitemap of all sections/subsegments (for SEO/internal linking), plus a compact newsletter signup

Pages to build (all with mock data, all reachable via working nav)

Core reading experience

/ — Home hub: lead story, curated grid across all 8 sections, a "trending" rail, newsletter signup block

/[section] — Section landing (dynamic route, works for all 8 sections): section-specific hero + feed of subsegment stories

/[section]/[subsegment] — Subsegment feed: filtered list/grid of articles

/[section]/[subsegment]/[slug] — Article page: headline, byline, body copy (2–3 real paragraphs of placeholder editorial text, not lorem ipsum), inline pull quote, engagement bar (like, share, comment count), comment thread below, related articles rail. Free articles show in full; articles marked premium show ~40% of the body then a distinct paywall panel (not a generic "subscribe" box — make it feel like a considered part of the page) covering the rest

/search — Search results page: search input + filterable mock result list by section

Standalone product 6. /the-seat — No shared header/footer nav at all — its own self-contained page shell, punchier layout using the same fonts/colors but with its own hero and a distinct micro-brand feel. Includes a 3-field capture form (name, email, constituency/state) and a separate "request print edition" form. Both forms are functional in the UI (client-side validation, success state) but don't need to actually submit anywhere.

Account & commerce 7. /login and /register — Simple, clean auth forms, no backend wiring needed (form UI + validation only) 8. /account — Tier display (free/premium), section preferences, comment history list, all with mock data 9. /account/newsletters — Toggle list: general newsletter + one toggle per section for curated sends 10. /pricing — Monthly/annual Premium plan comparison, clear CTA

Supporting 11. /[section]/the-market — Special subsegment under Business & Economy: fuller version of the ticker as a live-feeling dashboard (mock line/number changes), plus market-related articles feed 12. /404 — On-brand not-found page, not a default Next.js error page

Components to build once, reuse everywhere

Header/nav with a working mobile menu (hamburger → slide-in or dropdown, still no gradients/shadows-heavy)

Article card: 3 variants — featured (large, for hero slots), list (compact, for feeds), curated (with an external source attribution + outbound link icon)

Paywall panel (distinct, reusable across any premium article)

Ticker strip (accepts an array of {label, value, direction} and animates mock changes)

Engagement bar (like count, share menu with copy-link, comment count — all functional client-side state, no backend)

Comment thread (nested one level, "post a comment" input gated behind a logged-in mock state)

Ad slot placeholder component (clearly labeled placeholder box, in leaderboard/in-feed/sidebar variants) — must visually disappear when the mock user state is "premium," since premium removes ads

Newsletter signup box (compact variant for footer, larger variant for /account/newsletters)

Footer with full section/subsegment sitemap

Interactivity requirements

Full working client-side navigation between every page listed above — no dead links

Mobile menu must open/close

Ticker numbers must visibly update on an interval

The free/premium/logged-out toggle (put it somewhere unobtrusive, like a small dev control in the header or footer) must actually change what's visible: ads appear/disappear, paywall panel appears/disappears on article pages, account page reflects the selected tier

Search input must filter the mock article list client-side as the user types

All forms (login, register, The Seat capture, newsletter toggles) must have working client-side validation and a visible success/error state, even without a real backend

Data layer

Create a typed mock data file (or a few, organized by entity) covering: Article, Section, Subsegment, Comment, MarketTicker, User (with a tier field). Seed enough realistic-sounding mock articles (Nigerian political/business/security context, plausible but clearly placeholder headlines and bylines) to make every feed, section, and the homepage look genuinely populated — not just 2 items per page.

Folder structure guidance

Use the Next.js App Router convention (app/[section]/[subsegment]/[slug]/page.tsx, etc.), colocate mock data under lib/data/, shared components under components/, and keep The Seat's route (app/the-seat/) using its own layout file so it doesn't inherit the main site header/footer.

What "done" looks like

Every page above exists, is reachable through real navigation (not just typed URLs), looks visually distinct from a default template, uses no emojis or gradients anywhere, and the interactive elements (ticker, search, tier toggle, forms, mobile menu) all function client-side against the mock data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/76e945c5-26a2-41e2-b9b3-2e25454bfe9e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
