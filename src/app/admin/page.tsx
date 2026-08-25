import { redirect } from "next/navigation";

/**
 * /admin has no dashboard content of its own. Evidence (git history):
 * the pre-refactor /admin/articles/page.tsx wasn't a list/dashboard — it
 * WAS the article editor itself, later extracted into
 * src/components/admin/editor/ArticleEditor.tsx and moved to
 * /admin/articles/editor. Nothing was lost; the one working destination
 * moved one segment deeper. Every nav link into /admin (HeaderAccountMenu,
 * the account page) expects to land somewhere real, so this redirects to
 * it rather than 404ing.
 *
 * A real article-list/review dashboard needs a backend list endpoint that
 * doesn't exist yet (only POST /articles is confirmed live) — see the
 * matching redirect in admin/articles/page.tsx for the full note.
 */
export default function AdminIndexPage() {
  redirect("/admin/articles/editor");
}
