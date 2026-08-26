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

/** Confirmed live via the OpenAPI schema for CreateArticleDto/UpdateArticleDto. */
export type SourceType = "ORIGINAL" | "CURATED" | "PARTNER";

/**
 * RESOLVED — the backend now has a real status field and endpoint:
 * PATCH /api/v1/articles/{id}/status, confirmed via the live OpenAPI
 * schema (ChangeArticleStatusDto). Legal transitions, per that schema:
 *   draft -> in_review | published
 *   in_review -> draft | published
 *   published -> archived
 *   archived -> published | draft
 * Only a Section Lead or Chief Editor may reach published or archived —
 * the backend enforces this; the UI only uses it to decide which actions
 * to offer (see canPublishDirectly).
 *
 * This is now authoritative server state once an article has a remoteId,
 * not client-side-only — it mirrors the real `status` column exactly, so
 * it's named `status` (not the old `reviewStatus`) to avoid implying a
 * separate, made-up pipeline.
 */
export type ArticleStatus = "draft" | "in_review" | "published" | "archived";

/**
 * Everything the editor route reads and writes for one story. Field names
 * mirror the confirmed POST /api/v1/articles request body.
 */
export interface DraftState {
  /** Local-only id (see src/lib/storage/draftStorage.ts) — not a server id. */
  id: string | null;
  /** Server id returned on a successful POST, if the API includes one — response schema currently undocumented. */
  remoteId: string | null;
  /** Server-authoritative once remoteId is set — see ArticleStatus note above. */
  status: ArticleStatus;
  headline: string;
  slug: string;
  slugEdited: boolean;
  dek: string;
  body: string;
  featuredImageUrl: string;
  /** Cloudinary handle from POST /articles/images — only set once the image was actually uploaded, not for a local object-URL preview. */
  featuredImagePublicId: string;
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
  status: "draft",
  headline: "",
  slug: "",
  slugEdited: false,
  dek: "",
  body: "",
  featuredImageUrl: "",
  featuredImagePublicId: "",
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
