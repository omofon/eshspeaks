import type { Article, ArticleImage, Section } from "@/lib/data/types";
import type { ApiArticleDetail, ApiArticleSummary, ApiSection } from "@/lib/api/types";
import type { Paginated } from "@/lib/api/client";
import type { ContentTier, DraftState, SourceType, ArticleStatus } from "@/lib/cms/types";

/**
 * The backend has no color/"tint" concept for a section — that's purely a
 * frontend design token (--color-tint-politics etc. in globals.css). Real
 * sections get one of the existing named tints assigned round-robin so
 * they still render with intentional color rather than falling through to
 * an undefined CSS variable; this is a cosmetic default only; the fixed
 * palette itself (see CLAUDE.md) is untouched.
 */
const TINT_ROTATION = [
  "politics",
  "business",
  "security",
  "stateofplay",
  "energy",
  "law",
  "foreign",
  "tech",
];

/**
 * Enum casing normalization — confirmed live: the public `GET /articles/:slug` response sends
 * lowercase (`"contentTier": "premium"`, `"sourceType": "original"`), while editorial endpoints
 * (`/articles/editorial/mine`, create/update responses) send the DTO's uppercase
 * (`"PREMIUM"`/`"ORIGINAL"`). `ArticleStatus` is lowercase-canonical everywhere else in this
 * codebase, so a `"PUBLISHED"` from an editorial endpoint needs lowercasing instead. Normalizing
 * once here — right where raw API JSON becomes a typed article — means every component
 * downstream (including ones that read the raw `ApiArticleDetail` directly, like ArticleView,
 * not just ones that go through toUiArticle) only ever sees one canonical casing, instead of a
 * `.toUpperCase()` scattered at every comparison site.
 */
const CONTENT_TIERS: readonly ContentTier[] = ["FREE", "PREMIUM"];
const SOURCE_TYPES: readonly SourceType[] = ["ORIGINAL", "CURATED", "PARTNER"];
const ARTICLE_STATUSES: readonly ArticleStatus[] = ["draft", "in_review", "published", "archived"];

function normalizeContentTier(value: unknown): ContentTier {
  const upper = typeof value === "string" ? value.toUpperCase() : "";
  return (CONTENT_TIERS as readonly string[]).includes(upper) ? (upper as ContentTier) : "FREE";
}

function normalizeSourceType(value: unknown): SourceType {
  const upper = typeof value === "string" ? value.toUpperCase() : "";
  return (SOURCE_TYPES as readonly string[]).includes(upper) ? (upper as SourceType) : "ORIGINAL";
}

function normalizeArticleStatus(value: unknown): ArticleStatus {
  const lower = typeof value === "string" ? value.toLowerCase() : "";
  return (ARTICLE_STATUSES as readonly string[]).includes(lower)
    ? (lower as ArticleStatus)
    : "draft";
}

/** Some responses nest the featured image (`{url,alt,width,height}`) instead of sending the
 *  flat `featuredImageUrl`/... fields the confirmed CreateArticleDto uses — read whichever is
 *  present rather than assuming one specific response shape. */
function resolveFeaturedImage(raw: ApiArticleSummary) {
  if (raw.featuredImageUrl) {
    return {
      url: raw.featuredImageUrl,
      alt: raw.featuredImageAlt,
      width: raw.featuredImageWidth,
      height: raw.featuredImageHeight,
    };
  }
  const nested = raw.featuredImage;
  return {
    url: nested?.url ?? null,
    alt: nested?.alt ?? null,
    width: nested?.width ?? null,
    height: nested?.height ?? null,
  };
}

function normalizeArticleFields<T extends ApiArticleSummary>(raw: T): T {
  const img = resolveFeaturedImage(raw);
  return {
    ...raw,
    contentTier: normalizeContentTier(raw.contentTier),
    sourceType: normalizeSourceType(raw.sourceType),
    status: normalizeArticleStatus(raw.status),
    featuredImageUrl: img.url,
    featuredImageAlt: img.alt,
    featuredImageWidth: img.width,
    featuredImageHeight: img.height,
  };
}

/** Apply to every single-article response (`GET /articles/:slug`, create/update responses). */
export function normalizeApiArticle<T extends ApiArticleSummary>(raw: T): T {
  return normalizeArticleFields(raw);
}

/** Apply to every list-article response (section/subsegment/all/editorial-mine feeds), including
 *  the `relatedArticles` the detail response embeds — those are ApiArticleSummary shapes too and
 *  need the same casing/image normalization before anything renders a card from them. */
export function normalizePaginatedArticles<T extends ApiArticleSummary>(
  result: Paginated<T>,
): Paginated<T> {
  return { ...result, items: result.items.map(normalizeArticleFields) };
}

export function toUiSection(api: ApiSection, index = 0): Section {
  return {
    slug: api.slug,
    name: api.name,
    blurb: "",
    tint: TINT_ROTATION[index % TINT_ROTATION.length]!,
    subsegments: api.subsegments.map((s) => ({ slug: s.slug, name: s.name })),
  };
}

/**
 * Adapts a real API article (list summary or full detail) into the
 * existing canonical `Article` shape that editorial.tsx's card system and
 * the home/* components already render. Deliberately does NOT change
 * Article's shape or those components — per the "don't reintroduce
 * duplicate component systems" rule, the fix is to feed them real data in
 * the shape they already expect, not to fork a second card system.
 *
 * Some mock-only concepts (byline "location", a lifted pull-quote) have no
 * backend equivalent — those get a reasonable derived value rather than an
 * empty gap in the layout; see the per-field notes below.
 */
export function toUiArticle(
  api: ApiArticleSummary | ApiArticleDetail,
  fallback: { sectionSlug?: string; subsegmentSlug?: string } = {},
): Article {
  const byline =
    api.author?.displayName ??
    (api.author?.username ? `@${api.author.username}` : (api.author?.name ?? "EshSpeaks Newsroom"));
  const bodyText = "body" in api && typeof api.body === "string" ? api.body : "";
  const publishedAt = api.publishedAt ?? api.createdAt;

  const image: ArticleImage | null = api.featuredImageUrl
    ? { src: api.featuredImageUrl, alt: api.featuredImageAlt || api.headline }
    : null;

  return {
    slug: api.slug,
    title: api.headline,
    dek: api.dek,
    section: api.section?.slug ?? fallback.sectionSlug ?? "",
    sectionName: api.section?.name ?? undefined,
    subsegment: api.subsegment?.slug ?? fallback.subsegmentSlug ?? "",
    byline,
    // No backend equivalent of a reporting dateline — omitted rather than fabricated.
    location: "",
    date: safeIsoDate(publishedAt),
    readMinutes: estimateReadMinutes(bodyText || api.dek),
    premium: api.contentTier === "PREMIUM",
    image,
    likes: api.likesCount ?? 0,
    commentCount: api.commentsCount ?? 0,
    body: bodyText
      ? bodyText
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
      : [],
    // No dedicated pull-quote field on the API — the dek reads fine in that slot and is never empty.
    pullQuote: api.dek,
  };
}

/**
 * Reopens a real, already-created article in the editor. Used by
 * useDraftLoader when the routed id isn't a local draft — it's the slug of
 * an article the caller already owns (editorial/mine) or is entitled to
 * edit. `remoteId`/`status` come straight from the server response so the
 * editor immediately knows this is a PATCH target, not a fresh POST.
 */
export function apiArticleToDraft(api: ApiArticleDetail): DraftState {
  return {
    id: api.slug,
    remoteId: api.id,
    status: api.status,
    headline: api.headline,
    slug: api.slug,
    slugEdited: true,
    dek: api.dek,
    body: api.body,
    featuredImageUrl: api.featuredImageUrl ?? "",
    featuredImagePublicId: api.featuredImagePublicId ?? "",
    featuredImageAlt: api.featuredImageAlt ?? "",
    featuredImageWidth: api.featuredImageWidth,
    featuredImageHeight: api.featuredImageHeight,
    sectionId: api.sectionId,
    subsegmentId: api.subsegmentId ?? "",
    sectorTags: api.sectorTags ?? [],
    contentTier: api.contentTier,
    sourceType: api.sourceType,
    metaTitle: api.metaTitle ?? "",
    metaDescription: api.metaDescription ?? "",
    canonicalUrl: api.canonicalUrl ?? "",
    ogImage: api.ogImage ?? "",
  };
}

function safeIsoDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

/** ~200wpm, matching how this newsroom's mock fixtures already read. */
function estimateReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
