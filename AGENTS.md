# Agent notes

EshSpeaks Newsroom — TanStack Start (React 19 + Vite 8 + Tailwind v4), deployed
on Vercel via Nitro.

## Conventions

- File-based routing under `src/routes/`. `routeTree.gen.ts` is generated — do
  not edit it by hand. See `src/routes/README.md` for the naming table.
- Mock data only, under `src/lib/data/`. There is no backend or real auth; the
  free/premium/logged-out states are driven by `src/lib/tier.tsx`.
- Design rules are non-negotiable and documented in `README.md`: no gradients,
  no emojis, sentence case, small radii, fixed brand palette.
- Run `npm run lint` and `npm run typecheck` before committing.

## Assets

`public/favicon.*`, `apple-touch-icon.png`, and `icon-*.png` are generated from
`scripts/generate-favicon.cjs`. Edit the shape data there (and `favicon.svg` to
match), then run `npm run favicon` — do not hand-edit the binaries.
