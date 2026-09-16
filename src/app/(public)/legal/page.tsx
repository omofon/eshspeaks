import { LegalTabs } from "@/components/legal/LegalTabs";

export const metadata = {
  title: "Legal",
  description: "Colouresh's privacy policy, terms of service and community guidelines.",
};

export default function LegalPage() {
  return (
    <div className="container-eshspeaks max-w-[760px] py-10 sm:py-14">
      <LegalTabs />
    </div>
  );
}
