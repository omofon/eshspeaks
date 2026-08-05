import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { ListCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import { EngagementBar } from "@/components/EngagementBar";
import { CommentThread } from "@/components/CommentThread";
import { PaywallPanel } from "@/components/PaywallPanel";
import { SectionTag } from "@/components/SectionTag";
import { PremiumBadge } from "@/components/PremiumBadge";
import { getArticle, relatedTo } from "@/lib/data/articles";
import { getSection, getSubsegment } from "@/lib/data/sections";
import { useTier } from "@/lib/tier";

export const Route = createFileRoute("/$section/$subsegment/$slug")({
  component: ArticlePage,
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { title: article.title, dek: article.dek };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Article"} — EshSpeaks` },
      { name: "description", content: loaderData?.dek ?? "EshSpeaks reporting." },
      { property: "og:title", content: loaderData?.title ?? "Article" },
      { property: "og:description", content: loaderData?.dek ?? "EshSpeaks reporting." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/${params.section}/${params.subsegment}/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/${params.section}/${params.subsegment}/${params.slug}` }],
  }),
});

function ArticlePage() {
  const params = Route.useParams();
  const article = getArticle(params.slug)!;
  const section = getSection(article.section)!;
  const sub = getSubsegment(article.section, article.subsegment)!;
  const { isPremium } = useTier();
  const locked = article.premium && !isPremium;
  const paragraphs = locked ? article.body.slice(0, 2) : article.body;

  return (
    <SiteShell>
      <nav className="text-sm text-muted-foreground">
        <Link
          to="/$section"
          params={{ section: section.slug }}
          className="text-accent hover:underline"
        >
          {section.name}
        </Link>
        <span> / </span>
        <Link
          to="/$section/$subsegment"
          params={{ section: section.slug, subsegment: sub.slug }}
          className="text-accent hover:underline"
        >
          {sub.name}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_300px]">
        <article>
          <div className="flex items-center gap-2">
            <SectionTag section={section} />
            {article.premium ? <PremiumBadge /> : null}
          </div>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-navy md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-2xl font-serif text-xl leading-relaxed text-muted-foreground">
            {article.dek}
          </p>
          <p className="mt-4 border-y border-rule py-3 text-sm text-muted-foreground">
            By <span className="font-medium text-foreground">{article.byline}</span> in{" "}
            {article.location} · {article.date} · {article.readMinutes} min read
          </p>

          <div className="mt-6 max-w-2xl space-y-5 text-[17px] leading-8">
            {paragraphs.map((p, i) => (
              <div key={i}>
                <p>{p}</p>
                {i === 0 ? (
                  <blockquote className="my-6 border-l-2 border-accent pl-5 font-serif text-2xl leading-snug text-navy">
                    {article.pullQuote}
                  </blockquote>
                ) : null}
              </div>
            ))}
          </div>

          {locked ? <PaywallPanel /> : null}

          {!locked ? (
            <div className="mt-8">
              <AdSlot variant="in-feed" />
            </div>
          ) : null}

          <EngagementBar likes={article.likes} comments={article.commentCount} />
          <CommentThread count={article.commentCount} />
        </article>

        <aside>
          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="font-serif text-xl text-navy">Related</h2>
            <div className="mt-2">
              {relatedTo(article).map((a) => (
                <ListCard key={a.slug} a={a} compact />
              ))}
            </div>
          </section>
          <div className="mt-6">
            <AdSlot variant="sidebar" />
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
