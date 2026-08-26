import type { ArticleStatus, ContentTier, SourceType } from "@/lib/cms/types";

/**
 * Domain types for API *responses*. The backend's OpenAPI spec
 * (GET /api/docs-json) only documents request DTOs — every response schema
 * is undocumented ("{}" / "[{}]" in Swagger) — and the live database has
 * zero sections and zero articles right now, so none of these response
 * shapes could be confirmed against real data. They are inferred from:
 *   1. the confirmed request DTO field names (CreateArticleDto etc.), and
 *   2. the confirmed envelope/pagination shape (see lib/api/client.ts),
 * kept optional/defensive wherever a field wasn't in a request DTO, so a
 * missing or renamed field degrades gracefully instead of crashing.
 * Re-verify against a real response once articles/sections exist.
 */

export interface ApiSubsegmentRef {
  id: string;
  name: string;
  slug: string;
}

export interface ApiSectionRef {
  id: string;
  name: string;
  slug: string;
  isSponsored?: boolean;
}

export interface ApiSubsegment extends ApiSubsegmentRef {
  sectionId?: string;
}

export interface ApiSection extends ApiSectionRef {
  isSponsored: boolean;
  subsegments: ApiSubsegment[];
}

export interface ApiAuthorRef {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

/**
 * Fields common to both the list shape (GET /articles/sections/:slug,
 * GET /articles/editorial/mine) and the detail shape.
 */
export interface ApiArticleSummary {
  id: string;
  headline: string;
  slug: string;
  dek: string;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  featuredImageWidth: number | null;
  featuredImageHeight: number | null;
  sectionId: string;
  subsegmentId: string | null;
  section?: ApiSectionRef | null;
  subsegment?: ApiSubsegmentRef | null;
  author?: ApiAuthorRef | null;
  sectorTags: string[];
  contentTier: ContentTier;
  sourceType: SourceType;
  status: ArticleStatus;
  likesCount: number;
  commentsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /articles/:slug — "full article with server-side gating". The
 * gating contract itself is unconfirmed (no premium article exists yet to
 * test against), so this client treats the *presence* of `body` as the
 * access signal rather than re-deriving access from contentTier — see
 * isArticleUnlocked() below. That keeps the backend authoritative per the
 * product spec (#5/#13): render what the response contains, don't
 * independently decide who counts as premium.
 */
export interface ApiArticleDetail extends ApiArticleSummary {
  body: string;
  /** Optional short teaser some gating implementations send for locked content; falls back to `dek` if absent. */
  preview?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string | null;
  featuredImagePublicId?: string | null;
  isLikedByCurrentUser?: boolean;
  /** Explicit access flag, used first when a backend implementation happens to send one. */
  hasAccess?: boolean;
  locked?: boolean;
}

export function isArticleUnlocked(article: ApiArticleDetail): boolean {
  if (typeof article.hasAccess === "boolean") return article.hasAccess;
  if (typeof article.locked === "boolean") return !article.locked;
  return Boolean(article.body && article.body.trim().length > 0);
}

export type CommentStatus = "pending" | "approved" | "rejected";

export interface ApiComment {
  id: string;
  articleId: string;
  authorId: string;
  author?: ApiAuthorRef | null;
  body: string;
  parentCommentId: string | null;
  status: CommentStatus;
  createdAt: string;
  replies?: ApiComment[];
}

export interface ApiModerationComment extends ApiComment {
  article?: ApiArticleSummary | null;
}

export interface ApiLikeResult {
  liked: boolean;
  likesCount: number;
}

export interface ApiFeedbackResult {
  isUseful: boolean;
  /** Whether this call recorded a new response or updated an existing one — unconfirmed shape, optional. */
  alreadySubmitted?: boolean;
}

export interface ApiImageUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export interface ApiEditorialUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role: string;
  sections: ApiSectionRef[];
}
