import Link from "next/link";
import type { Article } from "@/lib/data/types";

/** The Seat — executive desk panel. Navy elevation, deliberately quiet. */
export function TheSeatCard({ article }: { article: Article }) {
  const initials = article.byline
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="flex flex-col gap-4 rounded-lg border-l-4 border-brand-navy bg-brand-navy p-5 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-serif text-lg leading-none tracking-wide">The Seat</span>
        <span className="inline-flex rounded-md border border-brand-orange/40 bg-brand-orange/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
          Executive access
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3 border-y border-white/10 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold">
          {article.image ? (
            <img src={article.image.src} alt={article.image.alt} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            initials
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{article.byline}</span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-white/60">
            {article.location} · {article.readMinutes} min read
          </span>
        </span>
      </div>

      <Link
        href={`/${article.section}/${article.subsegment}/${article.slug}`}
        className="group block"
      >
        <h2 className="font-serif text-2xl font-bold leading-[1.1] transition-colors group-hover:text-brand-orange">
          {article.title}
        </h2>
      </Link>
      <p className="line-clamp-2 text-sm leading-6 text-white/70">{article.dek}</p>

      <Link
        href="/the-seat"
        className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-orange hover:underline"
      >
        Explore The Seat <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
