import type { Article, ArticleImage, Section } from "@/lib/data/types";
import type { ApiArticleDetail, ApiArticleSummary, ApiSection } from "@/lib/api/types";
import type { DraftState } from "@/lib/cms/types";

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
    (api.author?.username ? `@${api.author.username}` : "EshSpeaks Newsroom");
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
