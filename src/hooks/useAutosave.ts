"use client";

import { useEffect, useRef, useState } from "react";
import { saveDraftLocal } from "@/lib/storage/draftStorage";
import type { DraftState, DraftStatus } from "@/lib/cms/types";

const AUTOSAVE_DELAY_MS = 1500;

/**
 * Debounced local persistence. Not a network call — see draftStorage.ts
 * for why: the live API has no PATCH/PUT to update an in-progress draft,
 * so autosaving to the server would mean re-POSTing (and re-creating) the
 * article on every tick. This keeps the "Saved" indicator honest about
 * where the data actually lives until BE ships a real draft-update
 * endpoint.
 */
export function useAutosave(draft: DraftState, enabled = true) {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasContent = draft.headline.trim().length > 0 || draft.body.trim().length > 0;
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!enabled || !hasContent || !draft.id) return;
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setStatus("saving");
      saveDraftLocal(draftRef.current);
      setStatus("saved");
      setLastSavedAt(new Date());
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [
    enabled,
    draft.id,
    draft.headline,
    draft.slug,
    draft.dek,
    draft.body,
    draft.featuredImageUrl,
    draft.featuredImageAlt,
    draft.sectionId,
    draft.subsegmentId,
    draft.sectorTags,
    draft.contentTier,
    draft.sourceType,
    draft.metaTitle,
    draft.metaDescription,
    draft.canonicalUrl,
    draft.ogImage,
    hasContent,
  ]);

  return { status, lastSavedAt };
}
