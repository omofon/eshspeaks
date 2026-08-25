import type { ArticleImage } from "@/lib/data/types";
import type { UserRole } from "@/lib/auth/types";

/**
 * FIXED: EditorRole used to be its own hyphenated union
 * ("state-correspondent", "section-lead", "chief-editor") that did NOT
 * match the real backend values confirmed on /auth/me
 * ("state_correspondent", "section_lead", "chief_editor" — underscores).
 * That mismatch meant canPublishDirectly() would never match a real
 * section lead or chief editor — a silent, total loss of publish rights
 * for exactly the roles that need it in production. EditorRole is now a
 * derived subset of the real UserRole, so it can't drift out of sync again.
 */
export type EditorRole = Extract<
  UserRole,
  "contributor" | "state_correspondent" | "section_lead" | "chief_editor"
>;

const EDITOR_ROLES: readonly EditorRole[] = [
  "contributor",
  "state_correspondent",
  "section_lead",
  "chief_editor",
];

export function isEditorRole(role: UserRole): role is EditorRole {
  return (EDITOR_ROLES as readonly UserRole[]).includes(role);
}

export const canPublishDirectly = (role: EditorRole) =>
  role === "section_lead" || role === "chief_editor";

/** Inverse of canPublishDirectly, named for the "submit" call sites. */
export const mustSubmitForReview = (role: EditorRole) => !canPublishDirectly(role);

export type DraftStatus = "idle" | "loading" | "saving" | "saved" | "error";

/** Confirmed live on POST /api/v1/articles: uppercase enum. */
export type ContentTier = "FREE" | "PREMIUM";

/**
 * Confirmed live value: "ORIGINAL". "CURATED" is an unconfirmed guess —
 * see CMS-BACKEND-REQUESTS.md.
 */
export type SourceType = "ORIGINAL" | "CURATED";

/**
 * BLOCKING GAP, not yet resolved: the confirmed live contract
 * (POST /api/v1/articles) has NO status/review field at all — no
 * draft/submitted/approved/published pipeline exists server-side yet.
 * That means the actual "contributor submits, section lead
 * reviews/edits/publishes" workflow cannot be built end-to-end until the
 * backend adds:
 *   1. a status field on the article resource
 *   2. an endpoint to list "articles awaiting my review" (scoped by
 *      section for section leads; unscoped for chief editor)
 *   3. an approve/publish action distinct from create
 *
 * This type exists now so the frontend has a stable shape to build
 * against, but `reviewStatus` is CLIENT-SIDE ONLY until confirmed — do
 * not assume the backend persists or returns it. Confirm this contract
 * before building a real review-queue UI; guessing it risks the same
 * drift bug EditorRole just had.
 */
export type ReviewStatus = "draft" | "submitted" | "approved" | "published";

/**
 * Everything the editor route reads and writes for one story. Field names
 * mirror the confirmed POST /api/v1/articles request body.
 */
export interface DraftState {
  /** Local-only id (see src/lib/storage/draftStorage.ts) — not a server id. */
  id: string | null;
  /** Server id returned on a successful POST, if the API includes one — response schema currently undocumented. */
  remoteId: string | null;
  /** Client-side only — see ReviewStatus note above. */
  reviewStatus: ReviewStatus;
  headline: string;
  slug: string;
  slugEdited: boolean;
  dek: string;
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
  reviewStatus: "draft",
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

export function bodyTextLength(bodyHtml: string): number {
  if (typeof window === "undefined") return bodyHtml.replace(/<[^>]*>/g, "").trim().length;
  const div = document.createElement("div");
  div.innerHTML = bodyHtml;
  return (div.textContent ?? "").trim().length;
}

export function draftFeaturedImage(draft: DraftState): ArticleImage | null {
  if (!draft.featuredImageUrl) return null;
  return { src: draft.featuredImageUrl, alt: draft.featuredImageAlt };
}