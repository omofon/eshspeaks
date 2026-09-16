import { MembershipJoinForm } from "@/components/seat/MembershipJoinForm";

export const metadata = {
  title: "Join The List",
  description: "Network, get invited, get in the right room.",
};

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;

  return (
    <div className="container-eshspeaks py-10 sm:py-14">
      <div className="mx-auto max-w-[560px]">
        <MembershipJoinForm initialTier={tier} />
      </div>
    </div>
  );
}
