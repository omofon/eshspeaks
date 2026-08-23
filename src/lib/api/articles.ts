import { API_BASE_URL } from "@/lib/auth/config";
import type { DraftState } from "@/lib/cms/types";

const API_PREFIX = "/api/v1";

export class ArticleApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ArticleApiError";
    this.status = status;
  }
}

/** Exact body shape confirmed against the live POST /api/v1/articles schema. */
function toArticlePayload(draft: DraftState) {
  return {
    headline: draft.headline,
    slug: draft.slug,
    dek: draft.dek,
    body: draft.body,
    featuredImageUrl: draft.featuredImageUrl,
    featuredImageAlt: draft.featuredImageAlt,
    featuredImageWidth: draft.featuredImageWidth ?? 0,
    featuredImageHeight: draft.featuredImageHeight ?? 0,
    sectionId: draft.sectionId,
    subsegmentId: draft.subsegmentId,
    sectorTags: draft.sectorTags,
    contentTier: draft.contentTier,
    sourceType: draft.sourceType,
    metaTitle: draft.metaTitle || draft.headline,
    metaDescription: draft.metaDescription || draft.dek,
    canonicalUrl: draft.canonicalUrl,
    ogImage: draft.ogImage || draft.featuredImageUrl,
  };
}

/**
 * POST /api/v1/articles — the only confirmed-live write endpoint. There's
 * no update/submit/approve/publish endpoint yet (see
 * CMS-BACKEND-REQUESTS.md), so this is called once, at the point the
 * editor's action button is pressed — not on every autosave tick.
 *
 * The 201 response schema is undocumented ("{}"), so treat any returned
 * `id` as a bonus, not a guarantee — code shouldn't depend on getting one
 * back.
 */
export async function submitArticle(draft: DraftState): Promise<{ id: string | null }> {
  if (!API_BASE_URL) throw new ArticleApiError("Backend is not configured.");
  if (!draft.sectionId || !draft.subsegmentId) {
    throw new ArticleApiError("Choose a section and subsegment before submitting.");
  }
  if (!draft.slug) throw new ArticleApiError("This story needs a URL slug before it can be submitted.");

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${API_PREFIX}/articles`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toArticlePayload(draft)),
    });
  } catch {
    throw new ArticleApiError("We couldn't reach EshSpeaks. Check your connection and try again.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const body = text ? safeJson(text) : null;
    throw new ArticleApiError(body?.message ?? `Submission failed (${res.status}).`, res.status);
  }

  const body = await res.json().catch(() => null);
  return { id: body?.id ?? null };
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
