import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { FeaturedCard, ListCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import { bySection } from "@/lib/data/articles";
import { getSection } from "@/lib/data/sections";

export const Route = createFileRoute("/$section/")({
  component: SectionPage,
  loader: ({ params }) => {
    const section = getSection(params.section);
    if (!section) throw notFound();
    return { name: section.name, blurb: section.blurb };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Section"} — EshSpeaks` },
      { name: "description", content: loaderData?.blurb ?? "EshSpeaks section." },
      { property: "og:title", content: `${loaderData?.name ?? "Section"} — EshSpeaks` },
      { property: "og:description", content: loaderData?.blurb ?? "EshSpeaks section." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `/${params.section}` },
    ],
    links: [{ rel: "canonical", href: `/${params.section}` }],
  }),
});

function SectionPage() {
  const { section: slug } = Route.useParams();
  const section = getSection(slug)!;
  const articles = bySection(slug);
  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <SiteShell>
      <header className="border-b border-rule pb-6">
        <p className="font-mono text-xs tracking-widest text-accent">Section</p>
        <h1 className="mt-2 font-serif text-4xl text-navy">{section.name}</h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">{section.blurb}</p>
        <nav className="mt-4 flex flex-wrap gap-2">
          {section.subsegments.map((sub) => (
            <Link
              key={sub.slug}
              to="/$section/$subsegment"
              params={{ section: slug, subsegment: sub.slug }}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-navy hover:border-navy"
            >
              {sub.name}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {lead ? <FeaturedCard a={lead} /> : null}
          <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
            {rest.map((a, i) => (
              <div key={a.slug} className={i === 4 ? "sm:col-span-2" : ""}>
                {i === 4 ? (
                  <div className="my-4">
                    <AdSlot variant="in-feed" />
                  </div>
                ) : null}
                <ListCard a={a} />
              </div>
            ))}
          </div>
        </div>
        <aside>
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </SiteShell>
  );
}
