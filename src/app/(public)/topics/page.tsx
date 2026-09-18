import { TopicsBrowser } from "@/components/seat/TopicsBrowser";

export const metadata = {
  title: "All Topics",
  description: "Every conversation currently open on the floor at The Seat.",
};

export default function TopicsPage() {
  return (
    <div className="container-colouresh py-8 sm:py-10">
      <TopicsBrowser />
    </div>
  );
}
