import Link from "next/link";
import { allArticles, leadStory, trending } from "@/lib/data/articles";
import { sections } from "@/lib/data/sections";
import { CuratedCard, FeaturedCard, ListCard } from "@/components/editorial";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { AdSlot } from "@/components/AdSlot";

export const metadata = {
  title: "EshSpeaks — Nigerian journalism, interviews and opinion",
  description:
    "Reporting, interviews and opinion from Nigeria: politics, business, security, culture and public life, edited for people who need the whole picture.",
  openGraph: {
    title: "EshSpeaks — Nigerian journalism, interviews and opinion",
    description:
      "Reporting, interviews and opinion from Nigeria: politics, business, security, culture and public life.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

function SectionRule({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-t-2 border-navy pt-3">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-navy">{title}</h2>
      {href ? (
        <Link
          href={href as `/${string}`}
          className="text-[12px] font-semibold text-accent hover:underline"
        >
          More
        </Link>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const rest = allArticles.filter((a) => a.slug !== leadStory.slug);
  const columnTwo = rest.slice(0, 3);
  const columnThree = rest.slice(3, 7);
  const curated = allArticles.filter((a) => a.curatedFrom).slice(0, 3);

  return (
    <div className="container-eshspeaks py-8">
      {/* Front page: three-column broadsheet grid */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.15fr)_300px] lg:gap-10">
        <div className="lg:border-r lg:border-rule lg:pr-10">
          <FeaturedCard article={leadStory} />
          <div className="mt-8 space-y-8">
            {columnTwo.map((article) => (
              <ListCard key={article.slug} article={article} />
            ))}
          </div>
        </div>

        <div className="space-y-7 lg:border-r lg:border-rule lg:pr-10">
          {columnThree.map((article) => (
            <ListCard key={article.slug} article={article} compact />
          ))}
          <AdSlot variant="in-feed" />
        </div>

        <aside className="space-y-8">
          <section>
            <SectionRule title="Most read" />
            <ol className="space-y-4">
              {trending.map((article, index) => (
                <li
                  key={article.slug}
                  className="flex gap-3 border-b border-border pb-4 last:border-0"
                >
                  <span className="font-mono text-sm font-semibold text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={`/${article.section}/${article.subsegment}/${article.slug}`}
                    className="font-serif text-[15px] leading-6 text-navy hover:text-accent"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <NewsletterSignup variant="large" />
          <AdSlot variant="sidebar" />
        </aside>
      </div>

      <div className="my-12">
        <AdSlot variant="leaderboard" />
      </div>

      <section>
        <SectionRule title="Curated from the wires" />
        <div className="grid gap-6 md:grid-cols-3">
          {curated.map((article) => (
            <CuratedCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {sections.slice(0, 4).map((section) => {
        const items = allArticles.filter((a) => a.section === section.slug).slice(0, 4);
        if (!items.length) return null;
        return (
          <section key={section.slug} className="mt-12">
            <SectionRule title={section.name} href={`/${section.slug}`} />
            <div className="grid gap-6 md:grid-cols-4">
              {items.map((article) => (
                <ListCard key={article.slug} article={article} compact />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
