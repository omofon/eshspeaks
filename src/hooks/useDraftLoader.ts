"use client";

import { useEffect, useState } from "react";
import { fetchDraft } from "@/lib/api/articlesDraft";
import { emptyDraft, type DraftState } from "@/lib/cms/types";

/**
 * Fetches an existing draft for /admin/articles/editor/[id]. Returns
 * `emptyDraft()` immediately when no id is given (the "new story" route),
 * so callers don't need to branch on whether they're editing.
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

    fetchDraft(draftId)
      .then((loaded) => {
        if (!cancelled) setDraft(loaded);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't load that draft.");
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
