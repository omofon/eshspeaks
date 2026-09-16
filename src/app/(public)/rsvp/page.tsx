import { RsvpForm } from "@/components/seat/RsvpForm";

export const metadata = {
  title: "RSVP",
  description: "Request an invite to a Seat, Live event.",
};

export default async function RsvpPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;

  return (
    <div className="container-eshspeaks py-10 sm:py-14">
      <div className="mx-auto max-w-[560px]">
        <RsvpForm initialEvent={event} />
      </div>
    </div>
  );
}
