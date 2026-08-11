import { notFound } from "next/navigation";
import { bySection } from "@/lib/data/articles";
import { getSection } from "@/lib/data/sections";
import { FeaturedCard, ListCard } from "@/components/editorial";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const data = getSection(section);

  if (!data) {
    return { title: "Section not found" };
  }

  return {
    title: data.name,
    description: data.blurb,
  };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const sectionData = getSection(section);

  if (!sectionData) {
    notFound();
  }

  const articles = bySection(section);
  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <>
      <header className="border-b border-border pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          Section
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">{sectionData.name}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
          {sectionData.blurb}
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {lead ? <FeaturedCard article={lead} /> : null}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {rest.map((article) => (
              <ListCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
        <aside className="space-y-6">
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </>
  );
}
