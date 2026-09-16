/**
 * Compact pill-button variants (the prototype's `.btn-sm` modifier) used
 * throughout The Seat, which has far more small inline buttons than
 * anywhere else in the app. Plain className strings rather than new
 * globals.css utilities: combining a new `btn-sm` utility with the
 * existing full-size `btn-ghost`/`btn-purple`/etc utilities would mean two
 * rules fighting over the same `padding`/`font-size` properties with equal
 * selector specificity — whichever the framework happens to emit last
 * would win, which is fragile. These are self-contained instead.
 */
export const btnGhostSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-ink px-4 py-2 text-[13px] font-semibold text-ink transition-transform hover:-translate-y-0.5";

export const btnOutlineLightSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-white/55 px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5";

export const btnWhiteSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-white px-4 py-2 text-[13px] font-semibold text-ink transition-transform hover:-translate-y-0.5";

export const btnPurpleSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-purple px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_0_var(--purple-deep)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none";

export const btnOrangeSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-orange px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_0_var(--orange-deep)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none";

export const btnRedSm =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-red px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_0_var(--red-deep)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none";
