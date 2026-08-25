import { loadDraftLocal } from "@/lib/storage/draftStorage";
import type { DraftState } from "@/lib/cms/types";

export class DraftApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "DraftApiError";
    this.status = status;
  }
}

/**
 * This file previously called PUT/GET /api/v1/articles/:id — endpoints
 * that articles.ts's own comment confirms don't exist ("no update
 * endpoint yet... POST is the only confirmed-live write"), and it was
 * built against a pre-contract-confirmation DraftState shape
 * (title/bodyHtml/section instead of headline/body/sectionId) that no
 * longer matches cms/types.ts at all — it would not compile.
 *
 * draftStorage.ts documents the real architecture: drafts live in
 * localStorage until a real draft-update endpoint exists. useAutosave.ts
 * already calls saveDraftLocal() directly, so this file's old
 * persistDraft() was dead code nobody called — removed entirely rather
 * than fixed, since keeping an unused function around that implies a
 * network draft-save exists is itself misleading. fetchDraft() IS called
 * (by useDraftLoader.ts, for the /admin/articles/editor/[id] route), so
 * it's kept here, reading from the same local store autosave writes to.
 *
 * NOTE ON RECURRENCE: this exact file reverted to its pre-fix version
 * twice across two review rounds. If this keeps happening, check whether
 * this fix is actually being committed/merged before the next review
 * pass — re-reviewing the same regression wastes both the review and the
 * fix.
 */
export async function fetchDraft(id: string): Promise<DraftState> {
  const draft = loadDraftLocal(id);
  if (!draft) {
    throw new DraftApiError("That draft doesn't exist in this browser, or it was cleared.", 404);
  }
  return draft;
}
