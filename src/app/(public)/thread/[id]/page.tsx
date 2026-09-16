import { notFound } from "next/navigation";
import { getSeatTopic } from "@/lib/data/seatTopics";
import { ThreadView } from "@/components/seat/ThreadView";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getSeatTopic(id);
  return { title: topic ? topic.title : "Thread" };
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getSeatTopic(id);
  if (!topic) notFound();

  return (
    <div className="container-eshspeaks py-8 sm:py-10">
      <ThreadView topic={topic} />
    </div>
  );
}
