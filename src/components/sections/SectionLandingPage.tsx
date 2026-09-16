import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/data/types";
import { articleHref } from "@/components/home/primitives";
import { AdSlot } from "@/components/AdSlot";
import { SectionBrief } from "./SectionBrief";

export interface SectionFilter {
  label: string;
  href?: `/${string}`;
}

interface SectionLandingPageProps {
  sectionSlug: string;
  hue: string;
  hueDeep: string;
  chipLabel: string;
  title: string;
  description: string;
  filters: SectionFilter[];
  moreHeading: string;
  briefTitle: string;
  briefDescription: string;
  briefBg?: string;
  briefText?: string;
  articles: Article[];
  marketStrip?: ReactNode;
  pagination?: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

function StoryCard({ article, hue }: { article: Article; hue: string }) {
  return (
    <Link
      href={articleHref(article)}
      className="flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white"
    >
      <div
        className="relative aspect-[16/10]"
        style={{ background: `linear-gradient(150deg,${hue},#fff)` }}
      >
        {article.image ? (
          <Image
            src={article.image.src}
            alt={article.image.alt}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : null}
        <span className="absolute bottom-2.5 left-3 rounded-full border-2 border-ink bg-white px-2.5 py-1 text-[10.5px] font-bold">
          {article.sectionName ?? article.section}
        </span>
        {article.premium ? (
          <span className="absolute right-2.5 top-2.5 rounded-full border-2 border-ink bg-yellow px-2 py-1 text-[10px] font-bold">
            Premium
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="text-[16px] font-bold leading-[1.35] text-ink">{article.title}</h4>
        <p className="text-[12.5px] text-ink-soft">{article.dek}</p>
        <div className="mt-auto flex justify-between border-t border-dashed border-line pt-2 text-[11.5px] font-semibold text-ink-soft">
          <span>{article.byline}</span>
          <span>{article.readMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}

export function SectionLandingPage({
  sectionSlug,
  hue,
  hueDeep,
  chipLabel,
  title,
  description,
  filters,
  moreHeading,
  briefTitle,
  briefDescription,
  briefBg,
  briefText,
  articles,
  marketStrip,
  pagination,
}: SectionLandingPageProps) {
  const [lead, ...rest] = articles;
  const grid = rest.slice(0, 8);
  const wires = articles.filter((a) => a.curatedFrom).slice(0, 3);
  const trending = [...articles].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <div>
      <header className="relative overflow-hidden border-b-2 border-ink pb-8 pt-10 sm:pt-12">
        <div
          className="absolute -right-10 -top-20 h-[200px] w-[200px] rounded-full opacity-35"
          style={{ background: hue }}
          aria-hidden
        />
        <div className="container-eshspeaks relative z-[1]">
          <span className="chip">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: hue }} />
            {chipLabel}
          </span>
          <h1 className="mt-3 text-[28px] font-semibold text-ink sm:text-[36px]">{title}</h1>
          <p className="mt-2 max-w-[520px] text-[14.5px] text-ink-soft">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {filters.map((filter, i) =>
              i === 0 ? (
                <span
                  key={filter.label}
                  className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-[12.5px] font-bold text-white"
                >
                  {filter.label}
                </span>
              ) : filter.href ? (
                <Link
                  key={filter.label}
                  href={filter.href}
                  className="rounded-full border-2 border-ink bg-white px-4 py-2 text-[12.5px] font-bold text-ink"
                >
                  {filter.label}
                </Link>
              ) : (
                <span
                  key={filter.label}
                  className="rounded-full border-2 border-ink bg-white px-4 py-2 text-[12.5px] font-bold text-ink-soft"
                >
                  {filter.label}
                </span>
              ),
            )}
          </div>
        </div>
      </header>

      {marketStrip}

      <section className="container-eshspeaks pt-10 sm:pt-11">
        {lead ? (
          <div className="mb-11 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <Link
              href={articleHref(lead)}
              className="relative block aspect-[16/10] overflow-hidden rounded-[20px] border-2 border-ink"
              style={{ background: `linear-gradient(150deg,${hue},#fff)` }}
            >
              {lead.image ? (
                <Image
                  src={lead.image.src}
                  alt={lead.image.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : null}
              <span className="absolute bottom-3 left-3.5 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-[11px] font-bold">
                {chipLabel.split(" ")[0]}
              </span>
            </Link>
            <div>
              <span className="chip">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: hue }} />
                Lead story
              </span>
              <h3 className="mt-3 text-2xl leading-[1.3] font-semibold text-ink">
                <Link href={articleHref(lead)}>{lead.title}</Link>
              </h3>
              <p className="mt-2.5 text-sm text-ink-soft">{lead.dek}</p>
              <div className="mt-3 text-xs font-semibold text-ink-soft">
                {lead.byline} · {lead.location} · {lead.readMinutes} min read
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-11">
          <AdSlot placement="leaderboard" section={sectionSlug} />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <h2 className="mb-6 text-[26px] font-semibold text-ink">{moreHeading}</h2>
            {grid.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing else filed here yet, check back soon.</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {grid.map((article) => (
                  <StoryCard key={article.slug} article={article} hue={hue} />
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-between border-t-2 border-line pt-6">
                {pagination.hasPrevious ? (
                  <Link
                    href={`/${sectionSlug}?page=${pagination.page - 1}`}
                    className="rounded-full border-2 border-ink px-4 py-2 text-[13px] font-semibold text-ink"
                  >
                    ← Newer
                  </Link>
                ) : (
                  <span className="rounded-full border-2 border-line px-4 py-2 text-[13px] font-semibold text-ink-soft/40">
                    ← Newer
                  </span>
                )}
                <span className="text-[13px] font-semibold text-ink-soft">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                {pagination.hasNext ? (
                  <Link
                    href={`/${sectionSlug}?page=${pagination.page + 1}`}
                    className="rounded-full border-2 border-ink px-4 py-2 text-[13px] font-semibold text-ink"
                  >
                    Older →
                  </Link>
                ) : (
                  <span className="rounded-full border-2 border-line px-4 py-2 text-[13px] font-semibold text-ink-soft/40">
                    Older →
                  </span>
                )}
              </div>
            ) : null}

            {wires.length > 0 ? (
              <>
                <h2 className="mb-6 mt-14 text-2xl font-semibold text-ink">
                  Curated from the wires
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {wires.map((article) => (
                    <a
                      key={article.slug}
                      href={article.curatedUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border-2 border-line bg-white p-4"
                    >
                      <div className="mb-2 text-[10.5px] font-bold text-purple">
                        CURATED · {article.curatedFrom}
                      </div>
                      <h5 className="mb-2 text-sm leading-[1.3] font-semibold text-ink">
                        {article.title}
                      </h5>
                      <div className="text-[11.5px] font-semibold text-ink-soft">
                        Read on {article.curatedFrom} ↗
                      </div>
                    </a>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <aside>
            <div className="sticky top-[88px] mb-5 rounded-2xl border-2 border-ink bg-white p-5">
              <h4 className="mb-3 text-[13px] font-bold text-ink">Trending in {title}</h4>
              {trending.map((article, i) => (
                <Link
                  key={article.slug}
                  href={articleHref(article)}
                  className="flex items-center justify-between border-b border-line py-2.5 text-[12.5px] text-ink last:border-b-0"
                >
                  <span className="w-5 font-serif text-[13px]" style={{ color: hue }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ml-2 flex-1">{article.title}</span>
                </Link>
              ))}
            </div>

            <div className="mb-5">
              <AdSlot placement="sidebar" section={sectionSlug} />
            </div>

            <SectionBrief
              title={briefTitle}
              description={briefDescription}
              background={briefBg ?? "var(--ink)"}
              textColor={briefText ?? "#fff"}
              accent={hue}
              accentDeep={hueDeep}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}
