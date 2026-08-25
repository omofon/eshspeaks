import { notFound } from "next/navigation";
import { bySubsegment } from "@/lib/data/articles";
import { getSection, getSubsegment } from "@/lib/data/sections";
import { ListCard } from "@/components/editorial";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; subsegment: string }>;
}) {
  const { section, subsegment } = await params;
  const sectionData = getSection(section);
  const subsegmentData = getSubsegment(section, subsegment);

  if (!sectionData || !subsegmentData) {
    return { title: "Subsegment not found" };
  }

  return {
    title: subsegmentData.name,
    description: `Latest ${subsegmentData.name.toLowerCase()} reporting from ESHSPEAKS.`,
  };
}

export default async function SubsegmentPage({
  params,
}: {
  params: Promise<{ section: string; subsegment: string }>;
}) {
  const { section, subsegment } = await params;
  const sectionData = getSection(section);
  const subsegmentData = getSubsegment(section, subsegment);

  if (!sectionData || !subsegmentData) {
    notFound();
  }

  const articles = bySubsegment(section, subsegment);

  return (
    <>
      <header className="border-b border-border pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          {sectionData.name}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">
          {subsegmentData.name}
        </h1>
        <p className="mt-3 text-base leading-7 text-text-secondary">
          {articles.length} stories filed under {subsegmentData.name.toLowerCase()}.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <ListCard key={article.slug} article={article} />
          ))}
        </div>
        <aside>
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </>
  );
}
