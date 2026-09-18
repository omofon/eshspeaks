import { notFound } from "next/navigation";
import {
  fetchSection,
  fetchSubsegment,
  SectionsApiError,
  type ApiSubsegment,
} from "@/lib/api/sections";
import { fetchArticlesBySubsegment, fetchArticleBySlug, ArticleApiError } from "@/lib/api/articles";
import { toUiArticle } from "@/lib/api/adapters";
import { ArticleView } from "@/components/ArticleView";
import { SectionLandingPage, type SectionFilter } from "@/components/sections/SectionLandingPage";
import { hueForSlug } from "@/lib/data/sectionHue";
import {
  USE_MOCK_FALLBACK,
  mockArticlesBySubsegment,
  mockArticleDetail,
  mockSubsegment,
} from "@/lib/data/mockFallback";

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
    if (data.slug) return data;
  } catch (e) {
    if (!(e instanceof SectionsApiError && e.kind === "not_found")) throw e;
  }
  // Dev-only fallback (see mockFallback.ts): the live backend currently returns every section
  // with an empty `subsegments` array, so a real lookup always misses. Without this, a mock
  // subsegment link would misclassify as an article slug instead.
  return USE_MOCK_FALLBACK ? mockSubsegment(section, slug) : null;
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
      const subsegmentData = await resolveSubsegment(section, resolved.subsegmentSlug);
      if (subsegmentData) {
        return {
          title: subsegmentData.name,
          description: `Latest ${subsegmentData.name.toLowerCase()} reporting from Colouresh.`,
        };
      }
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
  return { title: "Colouresh" };
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
      if (e instanceof ArticleApiError && e.kind === "not_found") {
        // Dev-only fallback (see mockFallback.ts): the backend has no real row for this slug,
        // but it may be one of the mock article slugs — useArticle() re-checks the same way
        // client-side, so this only decides whether to notFound() here, not what renders.
        if (!(USE_MOCK_FALLBACK && mockArticleDetail(resolved.articleSlug))) notFound();
      } else {
        throw e;
      }
    }
    return (
      <div className="container-colouresh py-8 lg:py-12">
        <ArticleView
          section={section}
          subsegment={resolved.subsegmentSlug}
          slug={resolved.articleSlug}
        />
      </div>
    );
  }

  // resolved.kind === "subsegment"
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const subsegmentSlug = resolved.subsegmentSlug;

  let sectionData;
  try {
    sectionData = await fetchSection(section);
  } catch (e) {
    if (e instanceof SectionsApiError && e.kind === "not_found") notFound();
    throw e;
  }
  const subsegmentData = await resolveSubsegment(section, subsegmentSlug);
  if (!subsegmentData) notFound();

  // A mock-only subsegment (the real backend currently has none) may not exist server-side at
  // all, so the real fetch can 404 outright rather than come back with an empty list — caught
  // the same way as an empty result, not just as a 200 with `items: []`.
  let fetched;
  try {
    fetched = await fetchArticlesBySubsegment(section, subsegmentSlug, { page, limit: 20 });
  } catch (e) {
    if (e instanceof ArticleApiError && e.kind === "not_found" && USE_MOCK_FALLBACK) {
      fetched = null;
    } else {
      throw e;
    }
  }
  const { items, meta } =
    (fetched === null || fetched.items.length === 0) && USE_MOCK_FALLBACK
      ? mockArticlesBySubsegment(sectionData.slug, subsegmentData.slug, page, 20)
      : fetched!;

  const articles = items.map((a) =>
    toUiArticle(a, { sectionSlug: sectionData.slug, subsegmentSlug: subsegmentData.slug }),
  );
  const { hue, hueDeep } = hueForSlug(sectionData.slug);
  const filters: SectionFilter[] = [{ label: "All" }];

  return (
    <SectionLandingPage
      sectionSlug={sectionData.slug}
      hue={hue}
      hueDeep={hueDeep}
      chipLabel={sectionData.name}
      title={subsegmentData.name}
      description={`${meta.total} ${meta.total === 1 ? "story" : "stories"} filed under ${subsegmentData.name.toLowerCase()}.`}
      filters={filters}
      moreHeading={`More from ${subsegmentData.name}`}
      briefTitle={`${subsegmentData.name}, Weekly`}
      briefDescription={`The latest from ${subsegmentData.name.toLowerCase()}, in your inbox.`}
      articles={articles}
      pagination={{
        page: meta.page,
        totalPages: meta.totalPages,
        hasNext: meta.hasNext,
        hasPrevious: meta.hasPrevious,
      }}
    />
  );
}
