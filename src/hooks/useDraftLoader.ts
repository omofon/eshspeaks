"use client";

import { useEffect, useState } from "react";
import { loadDraftLocal } from "@/lib/storage/draftStorage";
import { fetchArticleBySlug } from "@/lib/api/articles";
import { apiArticleToDraft } from "@/lib/api/adapters";
import { ApiError } from "@/lib/api/client";
import { emptyDraft, type DraftState } from "@/lib/cms/types";

/**
 * Fetches an existing draft for /admin/articles/editor/[id]. Returns
 * `emptyDraft()` immediately when no id is given (the "new story" route).
 *
 * The routed id is either:
 *  1. a LOCAL draft id (a story never yet submitted, or reopened after a
 *     browser reload before submission) — read straight from
 *     localStorage, no network call; or
 *  2. the SLUG of an already-created article (reached from the editorial
 *     dashboard's "edit" links) — fetched via the real
 *     GET /articles/:slug, which is the only by-id/slug read this API
 *     exposes. Local storage is checked first since it's free and
 *     synchronous; the network fetch only runs on a miss.
 */
export function useDraftLoader(draftId: string | null) {
  const [draft, setDraft] = useState<DraftState>(emptyDraft());
  const [loading, setLoading] = useState(Boolean(draftId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const local = loadDraftLocal(draftId);
    if (local) {
      if (!cancelled) {
        setDraft(local);
        setLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }

    fetchArticleBySlug(draftId)
      .then((article) => {
        if (!cancelled) setDraft(apiArticleToDraft(article));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Couldn't load that story.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [draftId]);

  return { draft, setDraft, loading, error };
}
