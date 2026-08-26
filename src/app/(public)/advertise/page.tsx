import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Advertise",
  description: "Advertise with EshSpeaks.",
};

export default function AdvertisePage() {
  return (
    <LegalPageLayout
      kicker="Advertise"
      title="Reach readers who follow Nigeria closely"
      intro="EshSpeaks readers come for policy, markets and security coverage — and stay for it. That's a specific, engaged audience, not a mass one."
    >
      <LegalSection title="Placements">
        <p>
          Display placements run across the front page, section pages and in-article slots — the
          same ad slots you'll see on the site today, clearly labelled as advertising and never
          styled to resemble editorial content. Premium subscribers see no advertising at all.
        </p>
      </LegalSection>

      <LegalSection title="Sponsored sections">
        <p>
          A small number of sections can carry sponsorship, disclosed with a sponsor badge next to
          the section name. We don't run sponsored content inside News, Politics & Governance, or
          Metro & Security — our editorial independence on hard news isn't for sale.
        </p>
      </LegalSection>

      <LegalSection title="Get a media kit">
        <p>
          Email{" "}
          <a
            href="mailto:advertise@eshspeaks.com"
            className="font-medium text-brand-orange hover:underline"
          >
            advertise@eshspeaks.com
          </a>{" "}
          with your goals and timeline, and we'll send rates, specs and available inventory.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
