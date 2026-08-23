import { API_BASE_URL } from "@/lib/auth/config";
import type { DraftState } from "@/lib/cms/types";

const API_PREFIX = "/api/v1";

export class DraftApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "DraftApiError";
    this.status = status;
  }
}

function toDraftBody(draft: DraftState) {
  return {
    title: draft.title,
    dek: draft.dek,
    bodyHtml: draft.bodyHtml,
    section: draft.section,
    subsegment: draft.subsegment,
    sectorTags: draft.sectorTags,
    contentTier: draft.contentTier,
    featuredImage: draft.featuredImage,
  };
}

function fromResponse(body: any, fallbackId: string | null): DraftState {
  return {
    id: body?.id ?? fallbackId,
    title: body?.title ?? "",
    dek: body?.dek ?? "",
    bodyHtml: body?.bodyHtml ?? "",
    section: body?.section ?? "",
    subsegment: body?.subsegment ?? "",
    sectorTags: body?.sectorTags ?? [],
    contentTier: body?.contentTier ?? "free",
    featuredImage: body?.featuredImage ?? null,
  };
}

/**
 * POST/PUT /api/v1/articles — per CMS-ARTICLES-CONTRACT.md §2. Not
 * confirmed live yet; a failed request degrades to a local-only draft so
 * autosave never blocks writing, but the id won't persist across a reload
 * until the endpoint is real.
 */
export async function persistDraft(draft: DraftState): Promise<{ id: string }> {
  if (!API_BASE_URL) return { id: draft.id ?? `local-${Date.now()}` };

  const path = draft.id ? `${API_PREFIX}/articles/${draft.id}` : `${API_PREFIX}/articles`;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: draft.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toDraftBody(draft)),
    });
  } catch {
    throw new DraftApiError("We couldn't reach EshSpeaks. Your draft is still here — we'll retry.");
  }

  if (!res.ok) throw new DraftApiError(`Autosave failed with ${res.status}`, res.status);
  const body = await res.json().catch(() => null);
  return { id: body?.id ?? draft.id ?? `local-${Date.now()}` };
}

/**
 * GET /api/v1/articles/:id — reopen an existing draft (edit route). Per
 * CMS-ARTICLES-CONTRACT.md §2 this is scoped to the owner, an assigned
 * reviewer, or the chief editor — distinct from the public
 * GET /articles/:slug, which only ever returns published content.
 */
export async function fetchDraft(id: string): Promise<DraftState> {
  if (!API_BASE_URL) throw new DraftApiError("Authentication service is not configured.");

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${API_PREFIX}/articles/${id}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new DraftApiError("We couldn't reach EshSpeaks. Check your connection and try again.");
  }

  if (!res.ok) {
    if (res.status === 404) throw new DraftApiError("That draft doesn't exist, or you don't have access to it.", 404);
    throw new DraftApiError(`Couldn't load that draft (${res.status}).`, res.status);
  }
  const body = await res.json().catch(() => null);
  return fromResponse(body, id);
}
