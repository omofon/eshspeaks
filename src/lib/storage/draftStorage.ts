import type { DraftState } from "@/lib/cms/types";

/**
 * The confirmed live API only has `POST /api/v1/articles` (create).
 * There's no PATCH/PUT to update a draft and no `GET /articles/:id` to
 * reopen one (only `GET /articles/:slug`, which is the public, gated,
 * published-only read). Calling POST repeatedly on every autosave tick
 * would create a new article each time — there's no upsert semantics
 * documented.
 *
 * So until BE ships a real draft-update endpoint (see
 * CMS-BACKEND-REQUESTS.md), autosave writes to localStorage instead of
 * the network, and the "Submit for review" / "Publish" action is the
 * *only* point that calls the real API. This keeps the editor honest
 * about what's actually persisted server-side vs. what only survives in
 * this browser.
 */

const PREFIX = "esh.draft.";

function key(id: string) {
  return `${PREFIX}${id}`;
}

export function newLocalDraftId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function saveDraftLocal(draft: DraftState): void {
  if (typeof window === "undefined" || !draft.id) return;
  try {
    window.localStorage.setItem(key(draft.id), JSON.stringify(draft));
  } catch {
    // Storage can be full or unavailable (e.g. private browsing) — the
    // in-memory state is still correct, it just won't survive a reload.
  }
}

export function loadDraftLocal(id: string): DraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as DraftState) : null;
  } catch {
    return null;
  }
}

export function deleteDraftLocal(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(id));
}

export function listLocalDraftIds(): string[] {
  if (typeof window === "undefined") return [];
  const ids: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k?.startsWith(PREFIX)) ids.push(k.slice(PREFIX.length));
  }
  return ids;
}

/**
 * There's no `GET /articles/mine` endpoint yet (see
 * CMS-BACKEND-REQUESTS.md), so this is the only record of "what did I
 * submit" — a local index the submit button appends to on success. Not a
 * substitute for a real endpoint: it only knows about submissions made
 * from this browser, and can't reflect a status change (review/publish)
 * that happens server-side later.
 */
const SUBMITTED_INDEX_KEY = "esh.submittedDrafts";

export interface SubmittedRecord {
  localId: string;
  remoteId: string | null;
  headline: string;
  submittedAt: string;
}

export function markDraftSubmitted(record: SubmittedRecord): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(SUBMITTED_INDEX_KEY);
    const list: SubmittedRecord[] = raw ? JSON.parse(raw) : [];
    const next = [record, ...list.filter((r) => r.localId !== record.localId)].slice(0, 50);
    window.localStorage.setItem(SUBMITTED_INDEX_KEY, JSON.stringify(next));
  } catch {
    // Non-critical — the submission itself already succeeded server-side.
  }
}

export function listSubmittedDrafts(): SubmittedRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUBMITTED_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
