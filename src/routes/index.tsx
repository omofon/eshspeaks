import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import {
  FeaturedCard,
  ListCard,
  CuratedCard,
  ARTICLE_ROUTE,
  articleParams,
} from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { allArticles, leadStory, trending } from "@/lib/data/articles";
import { sections } from "@/lib/data/sections";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "EshSpeaks — Nigerian politics, business and security" },
      {
        name: "description",
        content:
          "The front page of EshSpeaks: politics, business and economy, security watch and state of play, reported from Nigeria.",
      },
      { property: "og:title", content: "EshSpeaks — front page" },
      {
        property: "og:description",
        content: "Nigerian politics, business and security reporting.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  const secondary = allArticles.filter((a) => a.slug !== leadStory.slug).slice(0, 6);
  const curated = allArticles.filter((a) => a.curatedFrom).slice(0, 3);

  return (
    <SiteShell>
      <h1 className="sr-only">EshSpeaks front page</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <FeaturedCard a={leadStory} />

          <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
            {secondary.map((a) => (
              <ListCard key={a.slug} a={a} />
            ))}
          </div>

          <div className="my-8">
            <AdSlot variant="leaderboard" />
          </div>

          <section className="rule-top pt-6">
            <h2 className="font-serif text-2xl text-navy">Curated from the wires</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {curated.map((a) => (
                <CuratedCard key={a.slug} a={a} />
              ))}
            </div>
          </section>

          {sections.slice(0, 4).map((s) => {
            const items = allArticles.filter((a) => a.section === s.slug).slice(0, 3);
            return (
              <section key={s.slug} className="rule-top mt-10 pt-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-serif text-2xl text-navy">{s.name}</h2>
                  <Link
                    to="/$section"
                    params={{ section: s.slug }}
                    className="text-sm text-accent hover:underline"
                  >
                    All {s.name.toLowerCase()}
                  </Link>
                </div>
                <div className="mt-2 grid gap-x-8 sm:grid-cols-3">
                  {items.map((a) => (
                    <ListCard key={a.slug} a={a} compact />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside>
          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="font-serif text-xl text-navy">Trending</h2>
            <ol className="mt-3 space-y-3">
              {trending.map((a, i) => (
                <li
                  key={a.slug}
                  className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-mono text-sm text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    to={ARTICLE_ROUTE}
                    params={articleParams(a)}
                    className="font-serif text-sm leading-snug text-navy hover:text-accent"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-6">
            <AdSlot variant="sidebar" />
          </div>

          <div className="mt-6">
            <NewsletterSignup variant="large" />
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
