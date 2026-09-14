/**
 * Shared control classes for the auth split-card forms.
 *
 * Previously ran a distinct palette from the rest of the site
 * (`--peach`/`--input-soft`/`--ink-faint`, its own `:root` block). That
 * divergence is gone — auth now runs the same paper/ink base + purple
 * accent as the rest of Colouresh (purple is membership/account's hue in
 * the section-tint system), so every class below resolves through the
 * shared tokens in `src/app/globals.css`. Headings stay on `font-serif`
 * (= Fredoka) and UI text on Inter, same as the rest of the site.
 */

export const authMicroLabelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft";

export const authFieldClass =
  "h-12 w-full rounded-[var(--radius-md)] border border-line bg-background-soft text-[15px] text-ink transition-colors placeholder:text-ink-soft/70 focus:outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-purple/45 disabled:opacity-60 aria-[invalid=true]:border-error";

export const authPrimaryButtonClass =
  "group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-[14px] font-semibold text-card transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-45";

export const authOutlineButtonClass =
  "flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-card px-4 text-[14px] font-medium text-ink transition-colors hover:bg-background-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-disabled:cursor-not-allowed aria-disabled:opacity-50";
