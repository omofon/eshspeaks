import { PartnerForm } from "@/components/seat/PartnerForm";

export const metadata = {
  title: "Partner With Us",
  description: "Vendors, investors and brands: start the conversation with Colouresh.",
};

export default async function PartnerPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  return (
    <div className="container-eshspeaks py-10 sm:py-14">
      <div className="mx-auto max-w-[560px]">
        <PartnerForm initialType={type} />
      </div>
    </div>
  );
}
