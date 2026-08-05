# EshSpeaks Newsroom

Frontend for EshSpeaks, a Nigerian political, business, and security news
platform with free/premium tiers and a standalone lead-gen product, "The Seat."
Styled as a modern editorial newsroom — not a blog theme, not a SaaS dashboard.

The original brief called for Next.js App Router with static export. This is
built on **TanStack Start** instead, which keeps file-based routing and adds SSR;
routes live in `src/routes/` rather than `app/`. Everything else in the brief
holds.

## Stack

- TanStack Start (React 19, file-based routing) on Vite 8
- Tailwind CSS v4
- TypeScript (strict)
- Nitro for the deploy build — targets Vercel automatically in CI
- Mock data only. No backend, no real auth. Logged-out / free / premium states
  are driven client-side by `src/lib/tier.tsx` and a small dev toggle.

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
| `npm run preview`   | Serve the production build locally                         |
| `npm run lint`      | ESLint                                                     |
| `npm run typecheck` | `tsc --noEmit`                                             |
| `npm run favicon`   | Regenerate icon assets from `scripts/generate-favicon.cjs` |

## Deploying to Vercel

The repo is ready to import as-is. Vercel detects the Vite build, and Nitro
emits a Vercel-compatible bundle when `VERCEL=1` is set in the build
environment, which Vercel does automatically.

- Build command: `npm run build`
- Install command: `npm install`
- Output: handled by Nitro's Vercel preset — leave the output directory blank

No environment variables are required. `vercel.json` pins the framework to
`vite` and adds long-lived cache headers for hashed assets.

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
