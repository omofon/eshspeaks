import { ArticleView } from "@/components/ArticleView";
import { fetchArticleBySlug } from "@/lib/api/articles";

/**
 * Metadata is generated server-side with an anonymous request (no bearer
 * token available on the server — see useArticle.ts), so it reflects the
 * public/locked view even for a premium story; that's fine for SEO (the
 * headline/dek/canonical are public regardless of gating). The actual page
 * body re-fetches client-side, with the signed-in reader's token attached,
 * which is the one that determines real access — see ArticleView.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; subsegment: string; slug: string }>;
}) {
  const { section, subsegment, slug } = await params;

  try {
    const article = await fetchArticleBySlug(slug);
    return {
      title: article.headline,
      description: article.metaDescription || article.dek,
      alternates: {
        canonical: article.canonicalUrl || `/${section}/${subsegment}/${slug}`,
      },
      openGraph: {
        title: article.headline,
        description: article.dek,
        images:
          article.ogImage || article.featuredImageUrl
            ? [article.ogImage || article.featuredImageUrl!]
            : undefined,
      },
    };
  } catch {
    return { title: "Article" };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ section: string; subsegment: string; slug: string }>;
}) {
  const { section, subsegment, slug } = await params;
  return <ArticleView section={section} subsegment={subsegment} slug={slug} />;
}
