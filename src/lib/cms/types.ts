import type { ArticleImage } from "@/lib/data/types";

/**
 * Newsroom roles that can reach the editor. Contributors and State
 * Correspondents file copy for review; Section Leads and the Chief Editor
 * can publish directly.
 *
 * TODO(sprint-2-backend): `CurrentUser` / `AccountUser` don't carry a role
 * yet. Once the API returns one on `/auth/me`, replace `useEditorRole()`
 * in `src/hooks/useEditorRole.ts` with the real value instead of the
 * local fallback. See CMS-ARTICLES-CONTRACT.md §0.
 */
export type EditorRole =
  | "contributor"
  | "state-correspondent"
  | "section-lead"
  | "chief-editor";

export const canPublishDirectly = (role: EditorRole) =>
  role === "section-lead" || role === "chief-editor";

export type DraftStatus = "idle" | "loading" | "saving" | "saved" | "error";

/** Confirmed live on POST /api/v1/articles: uppercase enum. */
export type ContentTier = "FREE" | "PREMIUM";

/**
 * Confirmed live value: "ORIGINAL". The rest of the enum isn't documented
 * in Swagger (only one example value shown) — treat "CURATED" as a guess
 * pending confirmation. See CMS-BACKEND-REQUESTS.md.
 */
export type SourceType = "ORIGINAL" | "CURATED";

/**
 * Everything the editor route reads and writes for one story. Field names
 * here intentionally mirror the confirmed `POST /api/v1/articles` request
 * body — the previous version used `title`/`bodyHtml`/slug-based
 * `section`, which the real contract doesn't accept. Kept as one flat
 * shape (rather than remapping in the API layer) because several fields
 * — `sectionId`/`subsegmentId` in particular — are themselves the actual
 * selection value the taxonomy dropdowns need, not just a wire-format
 * detail to hide.
 */
export interface DraftState {
  /** Local-only id (see src/lib/storage/draftStorage.ts) — not a server id; see CMS-BACKEND-REQUESTS.md re: no GET/PATCH by id yet. */
  id: string | null;
  /** Server id returned on a successful POST, once/if the API includes one — response schema is currently undocumented ("{}"). */
  remoteId: string | null;
  headline: string;
  /** Auto-derived from `headline` via slugify() until the user edits it directly. */
  slug: string;
  slugEdited: boolean;
  dek: string;
  /** Raw HTML from the contentEditable canvas — see CMS-BACKEND-REQUESTS.md re: confirming BE expects HTML vs. Markdown/plain text for `body`. */
  body: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  featuredImageWidth: number | null;
  featuredImageHeight: number | null;
  sectionId: string;
  subsegmentId: string;
  sectorTags: string[];
  contentTier: ContentTier;
  sourceType: SourceType;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
}

export interface RevisionEntry {
  id: string;
  savedAt: string;
  summary: string;
  author: string;
}

export const emptyDraft = (): DraftState => ({
  id: null,
  remoteId: null,
  headline: "",
  slug: "",
  slugEdited: false,
  dek: "",
  body: "",
  featuredImageUrl: "",
  featuredImageAlt: "",
  featuredImageWidth: null,
  featuredImageHeight: null,
  sectionId: "",
  subsegmentId: "",
  sectorTags: [],
  contentTier: "FREE",
  sourceType: "ORIGINAL",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogImage: "",
});

/** Plain-text length of the body, used for the empty/disabled checks. */
export function bodyTextLength(bodyHtml: string): number {
  if (typeof window === "undefined") return bodyHtml.replace(/<[^>]*>/g, "").trim().length;
  const div = document.createElement("div");
  div.innerHTML = bodyHtml;
  return (div.textContent ?? "").trim().length;
}

/** Kept for callers that still want an ArticleImage view of the featured image fields. */
export function draftFeaturedImage(draft: DraftState): ArticleImage | null {
  if (!draft.featuredImageUrl) return null;
  return { src: draft.featuredImageUrl, alt: draft.featuredImageAlt };
}
