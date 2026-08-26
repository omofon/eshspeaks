import {
  apiRequest,
  apiRequestPaginated,
  toQueryString,
  ApiError,
  type Paginated,
} from "@/lib/api/client";
import type {
  ApiArticleDetail,
  ApiArticleSummary,
  ApiImageUploadResult,
  ApiLikeResult,
  ApiFeedbackResult,
} from "@/lib/api/types";
import type { ArticleStatus, ContentTier, DraftState, SourceType } from "@/lib/cms/types";

/** Re-exported so existing call sites (`ArticleApiError`) don't need to change. */
export { ApiError as ArticleApiError } from "@/lib/api/client";

/**
 * `type` rather than `interface` deliberately — toQueryString() takes a
 * `Record<string, ...>`, and TS only lets an object *type* (not a named
 * interface, even with an identical shape) satisfy an index-signature
 * parameter without an explicit index signature of its own.
 */
export type ListParams = {
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
};

export type EditorialMineParams = ListParams & {
  status?: ArticleStatus | undefined;
  sectionId?: string | undefined;
  mine?: boolean | undefined;
};

/** Exact body shape confirmed against the live CreateArticleDto/UpdateArticleDto OpenAPI schema. */
function toArticlePayload(draft: DraftState) {
  return {
    headline: draft.headline,
    slug: draft.slug,
    dek: draft.dek,
    body: draft.body,
    featuredImageUrl: draft.featuredImageUrl || undefined,
    featuredImagePublicId: draft.featuredImagePublicId || undefined,
    featuredImageAlt: draft.featuredImageAlt || undefined,
    featuredImageWidth: draft.featuredImageWidth ?? undefined,
    featuredImageHeight: draft.featuredImageHeight ?? undefined,
    sectionId: draft.sectionId,
    subsegmentId: draft.subsegmentId || undefined,
    sectorTags: draft.sectorTags,
    contentTier: draft.contentTier,
    sourceType: draft.sourceType,
    metaTitle: draft.metaTitle || draft.headline,
    metaDescription: draft.metaDescription || draft.dek,
    canonicalUrl: draft.canonicalUrl || undefined,
    ogImage: draft.ogImage || draft.featuredImageUrl || undefined,
  };
}

/** POST /api/v1/articles */
export async function submitArticle(draft: DraftState): Promise<{ id: string | null }> {
  if (!draft.sectionId) throw new ApiError("validation", "Choose a section before submitting.");
  if (!draft.slug)
    throw new ApiError("validation", "This story needs a URL slug before it can be submitted.");

  const created = await apiRequest<Partial<ApiArticleSummary> | null>("/articles", {
    method: "POST",
    auth: true,
    body: toArticlePayload(draft),
  });
  return { id: created?.id ?? null };
}

/** PATCH /api/v1/articles/{id} — every field optional; never accepts status (use changeArticleStatus). */
export async function updateArticle(
  id: string,
  patch: Partial<DraftState>,
): Promise<ApiArticleSummary> {
  const body: Record<string, unknown> = {};
  if (patch.headline !== undefined) body["headline"] = patch.headline;
  if (patch.slug !== undefined) body["slug"] = patch.slug;
  if (patch.dek !== undefined) body["dek"] = patch.dek;
  if (patch.body !== undefined) body["body"] = patch.body;
  if (patch.featuredImageUrl !== undefined)
    body["featuredImageUrl"] = patch.featuredImageUrl || undefined;
  if (patch.featuredImagePublicId !== undefined)
    body["featuredImagePublicId"] = patch.featuredImagePublicId || undefined;
  if (patch.featuredImageAlt !== undefined)
    body["featuredImageAlt"] = patch.featuredImageAlt || undefined;
  if (patch.featuredImageWidth !== undefined)
    body["featuredImageWidth"] = patch.featuredImageWidth ?? undefined;
  if (patch.featuredImageHeight !== undefined)
    body["featuredImageHeight"] = patch.featuredImageHeight ?? undefined;
  if (patch.sectionId !== undefined) body["sectionId"] = patch.sectionId;
  if (patch.subsegmentId !== undefined) body["subsegmentId"] = patch.subsegmentId || undefined;
  if (patch.sectorTags !== undefined) body["sectorTags"] = patch.sectorTags;
  if (patch.contentTier !== undefined) body["contentTier"] = patch.contentTier;
  if (patch.sourceType !== undefined) body["sourceType"] = patch.sourceType;
  if (patch.metaTitle !== undefined) body["metaTitle"] = patch.metaTitle;
  if (patch.metaDescription !== undefined) body["metaDescription"] = patch.metaDescription;
  if (patch.canonicalUrl !== undefined) body["canonicalUrl"] = patch.canonicalUrl || undefined;
  if (patch.ogImage !== undefined) body["ogImage"] = patch.ogImage || undefined;

  return apiRequest<ApiArticleSummary>(`/articles/${encodeURIComponent(id)}`, {
    method: "PATCH",
    auth: true,
    body,
  });
}

/** PATCH /api/v1/articles/{id}/status — the ONLY way to change status; UpdateArticleDto deliberately rejects it. */
export function changeArticleStatus(id: string, status: ArticleStatus): Promise<ApiArticleSummary> {
  return apiRequest<ApiArticleSummary>(`/articles/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    auth: true,
    body: { status },
  });
}

/** DELETE /api/v1/articles/{id} — Chief Editor only; hard delete, cascades likes/comments. */
export function deleteArticle(id: string): Promise<void> {
  return apiRequest<void>(`/articles/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
}

/**
 * GET /api/v1/articles/{slug} — full article with server-side gating.
 * `auth: true` so a signed-in reader's entitlement (and an editorial
 * user's own unpublished work) is evaluated correctly; the request still
 * succeeds for anonymous visitors since apiRequest only *attaches* a
 * token when one exists.
 */
export function fetchArticleBySlug(slug: string): Promise<ApiArticleDetail> {
  return apiRequest<ApiArticleDetail>(`/articles/${encodeURIComponent(slug)}`, {
    method: "GET",
    auth: true,
  });
}

/**
 * GET /api/v1/articles — the general cross-section feed. No filter/sort
 * params are documented in the live OpenAPI spec (empty `parameters: []`
 * for this operation), so only `page`/`limit`/`sortBy`/`sortOrder` are
 * sent — the same shape already proven against the other paginated list
 * endpoints. Nothing here is gated per-user (unlike the slug detail
 * endpoint), so it's safe to sit behind Next's shared fetch cache.
 */
export function fetchAllArticles(params: ListParams = {}): Promise<Paginated<ApiArticleSummary>> {
  return apiRequestPaginated<ApiArticleSummary>(`/articles${toQueryString(params)}`, {
    method: "GET",
    next: { revalidate: 60 },
  });
}

export function fetchArticlesBySection(
  sectionSlug: string,
  params: ListParams = {},
): Promise<Paginated<ApiArticleSummary>> {
  return apiRequestPaginated<ApiArticleSummary>(
    `/articles/sections/${encodeURIComponent(sectionSlug)}${toQueryString(params)}`,
    {
      method: "GET",
      next: { revalidate: 60 },
    },
  );
}

export function fetchArticlesBySubsegment(
  sectionSlug: string,
  subsegmentSlug: string,
  params: ListParams = {},
): Promise<Paginated<ApiArticleSummary>> {
  return apiRequestPaginated<ApiArticleSummary>(
    `/articles/sections/${encodeURIComponent(sectionSlug)}/${encodeURIComponent(subsegmentSlug)}${toQueryString(params)}`,
    { method: "GET", next: { revalidate: 60 } },
  );
}

/** GET /api/v1/articles/editorial/mine — powers the CMS dashboard. A Contributor always sees only their own work. */
export function fetchEditorialArticles(
  params: EditorialMineParams = {},
): Promise<Paginated<ApiArticleSummary>> {
  return apiRequestPaginated<ApiArticleSummary>(
    `/articles/editorial/mine${toQueryString(params)}`,
    { method: "GET", auth: true },
  );
}

/** POST /api/v1/articles/images — multipart. Returns the CDN url + publicId to store on the draft. */
export async function uploadArticleImage(file: File, alt: string): Promise<ApiImageUploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("alt", alt);
  return apiRequest<ApiImageUploadResult>("/articles/images", {
    method: "POST",
    auth: true,
    body: form,
    raw: true,
  });
}

/** POST /api/v1/articles/{id}/like — toggles; one like per account per article, backend-enforced. */
export function toggleArticleLike(id: string): Promise<ApiLikeResult> {
  return apiRequest<ApiLikeResult>(`/articles/${encodeURIComponent(id)}/like`, {
    method: "POST",
    auth: true,
  });
}

/** POST /api/v1/articles/{id}/feedback */
export function submitArticleFeedback(id: string, isUseful: boolean): Promise<ApiFeedbackResult> {
  return apiRequest<ApiFeedbackResult>(`/articles/${encodeURIComponent(id)}/feedback`, {
    method: "POST",
    auth: true,
    body: { isUseful },
  });
}

export type { ArticleStatus, ContentTier, SourceType };
