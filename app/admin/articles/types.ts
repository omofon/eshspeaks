import type { Article, ArticleImage } from "@/lib/data/types";

/**
 * Newsroom roles that can reach this route. Contributors and State
 * Correspondents file copy for review; Section Leads and the Chief Editor
 * can publish directly.
 *
 * TODO(sprint-2-backend): `CurrentUser` / `AccountUser` don't carry a role
 * yet. Once the API returns one on `/auth/me`, replace `useEditorRole()`
 * in `page.tsx` with the real value instead of the local fallback.
 */
export type EditorRole =
  | "contributor"
  | "state-correspondent"
  | "section-lead"
  | "chief-editor";

export const canPublishDirectly = (role: EditorRole) =>
  role === "section-lead" || role === "chief-editor";

export type DraftStatus = "idle" | "saving" | "saved" | "error";

export type ContentTier = "free" | "premium";

/** Everything the editor route reads and writes for one story. */
export interface DraftState {
  id: string | null;
  title: string;
  dek: string;
  /** Serialized HTML from the contentEditable canvas. */
  bodyHtml: string;
  section: string;
  subsegment: string;
  sectorTags: string[];
  contentTier: ContentTier;
  featuredImage: ArticleImage | null;
}

export interface RevisionEntry {
  id: string;
  savedAt: string;
  summary: string;
  author: string;
}

export const emptyDraft = (): DraftState => ({
  id: null,
  title: "",
  dek: "",
  bodyHtml: "",
  section: "",
  subsegment: "",
  sectorTags: [],
  contentTier: "free",
  featuredImage: null,
});

/** Plain-text length of the body, used for the empty/disabled checks. */
export function bodyTextLength(bodyHtml: string): number {
  if (typeof window === "undefined") return bodyHtml.replace(/<[^>]*>/g, "").trim().length;
  const div = document.createElement("div");
  div.innerHTML = bodyHtml;
  return (div.textContent ?? "").trim().length;
}

export type DraftPayload = Pick<
  Article,
  "title" | "dek" | "section" | "subsegment"
> & {
  bodyHtml: string;
  sectorTags: string[];
  contentTier: ContentTier;
  featuredImage: ArticleImage | null;
};
