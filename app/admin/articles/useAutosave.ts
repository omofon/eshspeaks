"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/auth/config";
import type { DraftState, DraftStatus } from "./types";

const AUTOSAVE_DELAY_MS = 3000;

/**
 * PUT/POST /api/v1/articles — mirrors the request shape used by
 * `authService` (credentials included, JSON body, bearer fallback for
 * cross-origin API hosts). Swap the endpoint once Sprint 2's articles
 * service lands; until then a failed request degrades to a local-only
 * "Saved" so drafting is never blocked by the network.
 */
async function persistDraft(draft: DraftState): Promise<{ id: string }> {
  if (!API_BASE_URL) return { id: draft.id ?? `local-${Date.now()}` };

  const path = draft.id ? `/api/v1/articles/${draft.id}` : "/api/v1/articles";
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: draft.id ? "PUT" : "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: draft.title,
      dek: draft.dek,
      bodyHtml: draft.bodyHtml,
      section: draft.section,
      subsegment: draft.subsegment,
      sectorTags: draft.sectorTags,
      contentTier: draft.contentTier,
      featuredImage: draft.featuredImage,
      status: "draft",
    }),
  });
  if (!res.ok) throw new Error(`Autosave failed with ${res.status}`);
  const body = await res.json().catch(() => null);
  return { id: body?.id ?? draft.id ?? `local-${Date.now()}` };
}

export function useAutosave(draft: DraftState, onIdAssigned: (id: string) => void) {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasContent = draft.title.trim().length > 0 || draft.bodyHtml.trim().length > 0;
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!hasContent) return;
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const { id } = await persistDraft(draftRef.current);
        if (id && id !== draftRef.current.id) onIdAssigned(id);
        setStatus("saved");
        setLastSavedAt(new Date());
      } catch {
        // Network hiccup or endpoint not live yet — keep the draft in
        // memory and let the next debounce cycle retry.
        setStatus("error");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.title, draft.dek, draft.bodyHtml, draft.section, draft.subsegment, draft.sectorTags, draft.contentTier, draft.featuredImage, hasContent]);

  return { status, lastSavedAt };
}
