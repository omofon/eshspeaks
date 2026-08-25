# EshSpeaks Newsroom

Frontend for EshSpeaks, a Nigerian political, business, and security news
platform with free/premium tiers and a standalone lead-gen product, "The Seat."
Styled as a modern editorial newsroom — not a blog theme, not a SaaS dashboard.

The original brief called for Next.js App Router with static export. This is
now implemented as a conventional Next.js App Router project with the active
routes under `src/app/`. The legacy TanStack route files were removed after
the migration.

## Stack

- Next.js App Router (React 19)
- Tailwind CSS v4
- TypeScript (strict)
- Vercel-ready deployment
- Real backend for auth and article creation (bearer-token session via
  `src/lib/auth/AuthProvider.tsx`, calling `NEXT_PUBLIC_API_BASE_URL`).
  Public article _content_ is still static mock data under `src/lib/data/`
  — there is no live CMS read path yet. A dev-only "preview as" tier/role
  toggle (`src/lib/dev/previewTier.tsx`) lets you preview logged-out/free/
  premium and editorial-role UI states without a second backend account.

## Getting started

Requires Node.js 20+.

```sh
npm install
npm run dev
```

| Script              | Does                                                       |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Dev server with HMR                                        |
| `npm run build`     | Production build                                           |
| `npm run start`     | Serve the production build locally (run `build` first)     |
| `npm run lint`      | ESLint                                                     |
| `npm run typecheck` | `tsc --noEmit`                                             |
| `npm run favicon`   | Regenerate icon assets from `scripts/generate-favicon.cjs` |

## Deploying to Vercel

The repo is ready to import as-is. Vercel uses the Next.js build directly.

- Build command: `npm run build`
- Install command: `npm install`
- Output: default Next.js output

Set `NEXT_PUBLIC_API_BASE_URL` to the backend's base URL — auth and article
creation fail closed without it. Public article content itself needs no
environment variables, since it's still served from static mock data.

## Design rules

These are non-negotiable and apply to every new component.

- No gradients. Flat, solid fills only.
- No emojis, in copy or as icons. Use Lucide outline icons.
- No drop shadows except one subtle level for elevated cards and modals.
- No decorative stock photography. Typography and layout carry the design.
- Sentence case for all UI labels and headings. Article headlines are the one
  exception and are written naturally.
- Small radii (4–8px). No pill buttons except small tags and badges.

### Palette

| Token            | Hex                   | Use                                          |
| ---------------- | --------------------- | -------------------------------------------- |
| Navy             | `#0D1B3D`             | Masthead, primary text, nav                  |
| Burnt orange     | `#C9541F`             | CTAs, active nav, links, The Seat            |
| Muted gold       | `#D9A441`             | Premium badges only — never reused elsewhere |
| Warm off-white   | `#F5F1E8`             | Page background                              |
| Charcoal         | `#2C2C2A`             | Body text                                    |
| Ticker up / down | `#8FB08A` / `#E07A5F` | Market figures on navy                       |

Each of the 8 sections carries its own muted tint, used only on small section
labels — never as a full background.

### Type

- Headlines: Newsreader (serif)
- UI, nav, metadata, body: Inter
- Ticker and tabular numerics: IBM Plex Mono

Two weights per family — regular plus one bold.
