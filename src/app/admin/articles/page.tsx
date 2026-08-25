import { redirect } from "next/navigation";

/**
 * No list/dashboard endpoint exists on the backend yet to power a real
 * "your articles" view — only POST /articles (create) is confirmed live;
 * there's no GET list-for-review, no fetch-by-id beyond this browser's own
 * localStorage draft cache (src/lib/storage/draftStorage.ts), and no
 * submit/approve/publish/reject endpoint (see src/lib/cms/types.ts's
 * ReviewStatus comment). Building a dashboard against nothing would mean
 * fabricating data, so this redirects to the one destination that's
 * actually functional today instead of rendering an empty shell.
 *
 * BACKEND VERIFICATION REQUIRED before this can become a real dashboard:
 * a list endpoint (e.g. "articles awaiting my review", scoped by role)
 * needs to exist first. Once it does, this file is where that list view
 * belongs — the desired shape (per product) is:
 *   /admin/articles           → article list / CMS dashboard
 *   /admin/articles/editor    → new article
 *   /admin/articles/editor/[id] → existing article editor
 */
export default function ArticlesIndexPage() {
  redirect("/admin/articles/editor");
}
