/**
 * CMS-specific layout for everything under /admin/articles. Authentication
 * and editor-role gating live in the parent src/app/admin/layout.tsx (a
 * client-side AuthProvider gate — see its comment for why that's UX only,
 * not the security boundary). This layer intentionally does nothing beyond
 * passing children through; it's kept as a real layout file — rather than
 * removed — so an article-list/editor-specific concern (breadcrumbs, a
 * shared toolbar) has a stable place to go later without introducing a new
 * route segment.
 */
export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
