import { AdvertiseForm } from "@/components/seat/AdvertiseForm";

export const metadata = {
  title: "Advertise",
  description:
    "Reach readers where the conversation is already happening: leaderboard, in-feed, sidebar and Seat sponsorship placements.",
};

export default function AdvertisePage() {
  return (
    <div className="container-colouresh py-10 sm:py-14">
      <div className="mx-auto max-w-[620px]">
        <AdvertiseForm />
      </div>
    </div>
  );
}
