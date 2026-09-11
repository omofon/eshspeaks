import type { Paginated, PaginationMeta } from "@/lib/api/client";
import type {
  ApiArticleDetail,
  ApiArticleSummary,
  ApiSection,
  ApiSubsegment,
} from "@/lib/api/types";
import { sections as mockSections } from "./sections";
import { allArticles, bySection, bySubsegment, getArticle, relatedTo } from "./articles";
import type { Article } from "./types";

/**
 * Dev-only fallback so the public reading pages (home, section, subsegment, article) show a
 * fully populated UI before the live backend has real published content, without ever mixing
 * mock data into a production response silently. Same `NEXT_PUBLIC_USE_MOCK_DATA` gate and
 * "controlled dev fallback" rule as `useSectionsCatalog.ts` — see that file's comment for why
 * this is opt-in rather than an automatic empty-state fallback. Every mock id is prefixed
 * `mock-` so nothing here is ever mistaken for a real backend id (a mutation built from one of
 * these, like a like or comment POST, will fail against the real API rather than silently
 * writing to the wrong record).
 */
export const USE_MOCK_FALLBACK = process.env["NEXT_PUBLIC_USE_MOCK_DATA"] === "true";

function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const meta: PaginationMeta = {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrevious: safePage > 1,
  };
  return { items: items.slice(start, start + limit), meta };
}

function toApiSummary(article: Article): ApiArticleSummary {
  const section = mockSections.find((s) => s.slug === article.section);
  const subsegment = section?.subsegments.find((s) => s.slug === article.subsegment);
  const publishedAt = `${article.date}T09:00:00.000Z`;
  return {
    id: `mock-${article.slug}`,
    headline: article.title,
    slug: article.slug,
    dek: article.dek,
    featuredImageUrl: article.image?.src ?? null,
    featuredImageAlt: article.image?.alt ?? null,
    featuredImageWidth: null,
    featuredImageHeight: null,
    sectionId: `mock-${article.section}`,
    subsegmentId: article.subsegment ? `mock-${article.section}-${article.subsegment}` : null,
    section: section
      ? { id: `mock-${section.slug}`, name: section.name, slug: section.slug }
      : null,
    subsegment: subsegment
      ? {
          id: `mock-${article.section}-${subsegment.slug}`,
          name: subsegment.name,
          slug: subsegment.slug,
        }
      : null,
    author: { id: "mock-author", username: null, displayName: article.byline, avatarUrl: null },
    sectorTags: [],
    contentTier: article.premium ? "PREMIUM" : "FREE",
    sourceType: article.curatedFrom ? "CURATED" : "ORIGINAL",
    status: "published",
    likesCount: article.likes,
    commentsCount: article.commentCount,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
  };
}

function toApiDetail(article: Article): ApiArticleDetail {
  return {
    ...toApiSummary(article),
    body: article.body.join("\n\n"),
    metaTitle: article.title,
    metaDescription: article.dek,
    relatedArticles: relatedTo(article).map(toApiSummary),
  };
}

export function mockSection(slug: string): ApiSection | null {
  const section = mockSections.find((s) => s.slug === slug);
  if (!section) return null;
  return {
    id: `mock-${section.slug}`,
    name: section.name,
    slug: section.slug,
    isSponsored: false,
    subsegments: section.subsegments.map((sub) => ({
      id: `mock-${section.slug}-${sub.slug}`,
      name: sub.name,
      slug: sub.slug,
      sectionId: `mock-${section.slug}`,
    })),
  };
}

export function mockSubsegment(sectionSlug: string, subSlug: string): ApiSubsegment | null {
  return mockSection(sectionSlug)?.subsegments.find((s) => s.slug === subSlug) ?? null;
}

export function mockArticlesBySection(
  sectionSlug: string,
  page = 1,
  limit = 20,
): Paginated<ApiArticleSummary> {
  return paginate(bySection(sectionSlug).map(toApiSummary), page, limit);
}

export function mockArticlesBySubsegment(
  sectionSlug: string,
  subSlug: string,
  page = 1,
  limit = 20,
): Paginated<ApiArticleSummary> {
  return paginate(bySubsegment(sectionSlug, subSlug).map(toApiSummary), page, limit);
}

export function mockAllArticles(page = 1, limit = 60): Paginated<ApiArticleSummary> {
  return paginate(allArticles.map(toApiSummary), page, limit);
}

export function mockArticleDetail(slug: string): ApiArticleDetail | null {
  const article = getArticle(slug);
  return article ? toApiDetail(article) : null;
}
