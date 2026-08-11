import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, relatedTo } from "@/lib/data/articles";
import { getSection, getSubsegment } from "@/lib/data/sections";
import { AdSlot } from "@/components/AdSlot";
import { ListCard, PremiumBadge, SectionBadge } from "@/components/editorial";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; subsegment: string; slug: string }>;
}) {
  const { section, subsegment, slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return { title: "Article not found" };
  }

  return {
    title: article.title,
    description: article.dek,
    alternates: {
      canonical: `/${section}/${subsegment}/${slug}`,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ section: string; subsegment: string; slug: string }>;
}) {
  const { section, subsegment, slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const sectionData = getSection(article.section) ?? getSection(section);
  const subsegmentData =
    getSubsegment(article.section, article.subsegment) ?? getSubsegment(section, subsegment);
  const paragraphs = article.body;
  const related = relatedTo(article);

  return (
    <>
      <nav className="text-sm text-text-secondary">
        <Link
          href={`/${sectionData?.slug ?? section}`}
          className="font-semibold text-brand-orange hover:underline"
        >
          {sectionData?.name ?? section}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/${sectionData?.slug ?? section}/${subsegmentData?.slug ?? subsegment}`}
          className="font-semibold text-brand-orange hover:underline"
        >
          {subsegmentData?.name ?? subsegment}
        </Link>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            {sectionData ? <SectionBadge section={sectionData} /> : null}
            {article.premium ? <PremiumBadge /> : null}
          </div>

          <h1 className="mt-5 font-serif text-4xl leading-[1.02] text-brand-navy sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-text-secondary sm:text-xl">
            {article.dek}
          </p>
          <p className="mt-6 border-y border-border py-4 text-sm text-text-secondary">
            By <span className="font-semibold text-foreground">{article.byline}</span> in{" "}
            {article.location} · {article.date} · {article.readMinutes} min read
          </p>

          <div className="mt-8 max-w-3xl space-y-6 text-lg leading-8 text-text-primary">
            {paragraphs.map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 12)}-${index}`}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-border bg-background-soft p-6">
            <blockquote className="border-l-2 border-brand-orange pl-4 font-serif text-2xl leading-tight text-brand-navy sm:text-3xl">
              “{article.pullQuote}”
            </blockquote>
          </div>

          <div className="mt-8">
            <AdSlot variant="in-feed" />
          </div>
        </article>

        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-serif text-2xl text-brand-navy">Related stories</h2>
            <div className="mt-4 space-y-3">
              {related.map((item) => (
                <ListCard key={item.slug} article={item} compact />
              ))}
            </div>
          </section>
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </>
  );
}
