/**
 * Shared control classes for the auth split-card forms.
 *
 * The sign-in / verify / username screens run a distinct palette from the
 * newsroom design system — `--ink`, `--peach`, `--line`, `--input-soft`,
 * `--gallery` etc., defined in `src/app/globals.css` and used only on the
 * `(auth)` routes. This is a deliberate product decision (an "editorial
 * magazine cover" front door); see the note in `CLAUDE.md`. Headings stay
 * on the site serif (`font-serif` = Newsreader) and UI text on Inter.
 */

export const authMicroLabelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft";

export const authFieldClass =
  "h-12 w-full rounded-[10px] border border-line bg-input-soft text-[15px] text-ink transition-colors placeholder:text-ink-faint focus:outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-peach/45 disabled:opacity-60 aria-[invalid=true]:border-error";

export const authPrimaryButtonClass =
  "group flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-ink px-4 text-[14px] font-semibold text-card transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-45";

export const authOutlineButtonClass =
  "flex h-12 w-full items-center justify-center gap-3 rounded-[10px] border border-line bg-card px-4 text-[14px] font-medium text-ink transition-colors hover:bg-input-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-disabled:cursor-not-allowed aria-disabled:opacity-50";
