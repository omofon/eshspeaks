import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchSection,
  fetchSubsegment,
  SectionsApiError,
  type ApiSubsegment,
} from "@/lib/api/sections";
import { fetchArticlesBySubsegment, fetchArticleBySlug, ArticleApiError } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { ListCard } from "@/components/editorial";
import { AdSlot } from "@/components/AdSlot";
import { ArticleView } from "@/components/ArticleView";

/**
 * Replaces the old fixed `[section]/[subsegment]/page.tsx` +
 * `[section]/[subsegment]/[slug]/page.tsx` pair. Those assumed every article lives under a
 * subsegment — but articles can have no subsegment (`subsegmentId` is optional on the create/
 * update DTO), and for those, the real URL is 2 segments (`/business-economy/some-article`),
 * which had no matching route at all and 404'd. A catch-all is the only way to let one segment
 * position mean "subsegment" for some URLs and "article slug" for others in the App Router
 * (two sibling `[x]`/`[y]` dynamic folders at the same depth is a build-time conflict), so this
 * resolves `rest` itself instead: 1 segment tries a subsegment first, then falls back to a
 * direct article-under-section; 2 segments is the existing subsegment+slug shape.
 */

type RouteParams = { section: string; rest?: string[] };

async function resolveSubsegment(section: string, slug: string): Promise<ApiSubsegment | null> {
  try {
    const data = await fetchSubsegment(section, slug);
    // fetchSubsegment doesn't always throw on a miss — some backends answer a missing
    // subsegment with `200 {success:true, data:null}` rather than a 404, which normalizes to
    // an empty-string stub here rather than an error. Treat "no real slug came back" as a miss
    // too, not just a thrown not_found.
    return data.slug ? data : null;
  } catch (e) {
    if (e instanceof SectionsApiError && e.kind === "not_found") return null;
    throw e;
  }
}

type Resolved =
  | { kind: "subsegment"; subsegmentSlug: string }
  | { kind: "article"; subsegmentSlug: string; articleSlug: string }
  | { kind: "not-found" };

async function resolveRoute(section: string, rest: string[]): Promise<Resolved> {
  if (rest.length === 1) {
    const [segment] = rest as [string];
    const subsegment = await resolveSubsegment(section, segment);
    if (subsegment) return { kind: "subsegment", subsegmentSlug: subsegment.slug };
    return { kind: "article", subsegmentSlug: "", articleSlug: segment };
  }
  if (rest.length === 2) {
    const [subsegmentSlug, articleSlug] = rest as [string, string];
    return { kind: "article", subsegmentSlug, articleSlug };
  }
  return { kind: "not-found" };
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { section, rest = [] } = await params;
  const resolved = await resolveRoute(section, rest);

  try {
    if (resolved.kind === "subsegment") {
      const subsegmentData = await fetchSubsegment(section, resolved.subsegmentSlug);
      return {
        title: subsegmentData.name,
        description: `Latest ${subsegmentData.name.toLowerCase()} reporting from EshSpeaks.`,
      };
    }
    if (resolved.kind === "article") {
      const article = await fetchArticleBySlug(resolved.articleSlug);
      return {
        title: article.headline,
        description: article.metaDescription || article.dek,
        alternates: {
          canonical:
            article.canonicalUrl ||
            (resolved.subsegmentSlug
              ? `/${section}/${resolved.subsegmentSlug}/${resolved.articleSlug}`
              : `/${section}/${resolved.articleSlug}`),
        },
        openGraph: {
          title: article.headline,
          description: article.dek,
          images:
            article.ogImage || article.featuredImageUrl
              ? [article.ogImage || article.featuredImageUrl!]
              : undefined,
        },
      };
    }
  } catch {
    // fall through to the generic titles below
  }
  return { title: "EshSpeaks" };
}

export default async function SectionRestPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { section, rest = [] } = await params;
  const resolved = await resolveRoute(section, rest);

  if (resolved.kind === "not-found") notFound();

  if (resolved.kind === "article") {
    // Confirm the slug is real before committing to the article layout — a 1-segment URL that
    // matches neither a subsegment nor an article is a genuine 404, not an empty article page.
    try {
      await fetchArticleBySlug(resolved.articleSlug);
    } catch (e) {
      if (e instanceof ArticleApiError && e.kind === "not_found") notFound();
      throw e;
    }
    return (
      <ArticleView
        section={section}
        subsegment={resolved.subsegmentSlug}
        slug={resolved.articleSlug}
      />
    );
  }

  // resolved.kind === "subsegment"
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const subsegmentSlug = resolved.subsegmentSlug;

  let sectionData;
  let subsegmentData;
  try {
    [sectionData, subsegmentData] = await Promise.all([
      fetchSection(section),
      fetchSubsegment(section, subsegmentSlug),
    ]);
  } catch (e) {
    if (e instanceof SectionsApiError && e.kind === "not_found") notFound();
    throw e;
  }

  const { items, meta } = await fetchArticlesBySubsegment(section, subsegmentSlug, {
    page,
    limit: 20,
  });

  return (
    <>
      <header className="border-b border-border pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          {sectionData.name}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">
          {subsegmentData.name}
        </h1>
        <p className="mt-3 text-base leading-7 text-text-secondary">
          {meta.total} {meta.total === 1 ? "story" : "stories"} filed under{" "}
          {subsegmentData.name.toLowerCase()}.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-text-secondary">
              No stories published here yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((article) => (
                <ListCard
                  key={article.slug}
                  article={toUiArticle(article, {
                    sectionSlug: sectionData.slug,
                    subsegmentSlug: subsegmentData.slug,
                  })}
                />
              ))}
            </div>
          )}

          {meta.totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm">
              <PageLink
                section={sectionData.slug}
                subsegment={subsegmentData.slug}
                page={page - 1}
                disabled={!meta.hasPrevious}
                label="Newer"
              />
              <span className="text-text-secondary">
                Page {meta.page} of {meta.totalPages}
              </span>
              <PageLink
                section={sectionData.slug}
                subsegment={subsegmentData.slug}
                page={page + 1}
                disabled={!meta.hasNext}
                label="Older"
              />
            </nav>
          ) : null}
        </div>
        <aside>
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </>
  );
}

function PageLink({
  section,
  subsegment,
  page,
  disabled,
  label,
}: {
  section: string;
  subsegment: string;
  page: number;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return <span className="cursor-not-allowed text-text-secondary/40">{label}</span>;
  }
  return (
    <Link
      href={`/${section}/${subsegment}?page=${page}`}
      className="font-semibold text-brand-orange hover:underline"
    >
      {label}
    </Link>
  );
}
