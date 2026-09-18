import { NominateForm } from "@/components/seat/NominateForm";

export const metadata = {
  title: "Nominate a Guest",
  description: "Put someone forward for a guided stage interview at the next Seat, Live event.",
};

export default function NominatePage() {
  return (
    <div className="container-colouresh py-10 sm:py-14">
      <div className="mx-auto max-w-[620px]">
        <NominateForm />
      </div>
    </div>
  );
}
