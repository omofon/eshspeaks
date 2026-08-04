import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { ListCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import { MarketDashboard } from "@/components/MarketDashboard";
import { bySubsegment } from "@/lib/data/articles";
import { getSection, getSubsegment } from "@/lib/data/sections";

export const Route = createFileRoute("/$section/$subsegment/")({
  component: SubsegmentPage,
  loader: ({ params }) => {
    const sub = getSubsegment(params.section, params.subsegment);
    if (!sub) throw notFound();
    return { name: sub.name };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Feed"} — EshSpeaks` },
      {
        name: "description",
        content: `Latest ${(loaderData?.name ?? "").toLowerCase()} reporting from EshSpeaks.`,
      },
      { property: "og:title", content: `${loaderData?.name ?? "Feed"} — EshSpeaks` },
      {
        name: "og:description",
        content: `Latest ${(loaderData?.name ?? "").toLowerCase()} reporting from EshSpeaks.`,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `/${params.section}/${params.subsegment}` },
    ],
    links: [{ rel: "canonical", href: `/${params.section}/${params.subsegment}` }],
  }),
});

function SubsegmentPage() {
  const { section: sectionSlug, subsegment } = Route.useParams();
  const section = getSection(sectionSlug)!;
  const sub = getSubsegment(sectionSlug, subsegment)!;
  const articles = bySubsegment(sectionSlug, subsegment);

  if (sectionSlug === "business-economy" && subsegment === "the-market") {
    return (
      <SiteShell>
        <MarketDashboard />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <nav className="text-sm text-muted-foreground">
        <Link to="/$section" params={{ section: sectionSlug }} className="text-accent hover:underline">
          {section.name}
        </Link>
        <span> / {sub.name}</span>
      </nav>

      <header className="mt-3 border-b border-rule pb-6">
        <h1 className="font-serif text-4xl text-navy">{sub.name}</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {articles.length} stories filed under {sub.name.toLowerCase()}.
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-x-8 sm:grid-cols-2">
          {articles.map((a) => (
            <ListCard key={a.slug} a={a} />
          ))}
        </div>
        <aside>
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </SiteShell>
  );
}
