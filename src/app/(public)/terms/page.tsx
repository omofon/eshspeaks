import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Terms of use",
  description: "The terms for using EshSpeaks.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      kicker="Legal"
      title="Terms of use"
      intro="The short version: read, comment and share fairly, and we'll keep publishing. Last updated August 2026."
    >
      <LegalSection title="Using the site">
        <p>
          Most EshSpeaks reporting is free to read. Some stories are marked Premium and available
          only to subscribers with an active membership. Creating an account requires a valid email
          address you actually control — accounts used to evade the comment or moderation rules
          below may be suspended.
        </p>
      </LegalSection>

      <LegalSection title="Comments and community">
        <p>
          Comments are moderated. We remove content that's abusive, defamatory, spam, or off-topic,
          and we can suspend an account's comment privileges for repeated violations. Disagreement
          with our reporting isn't grounds for removal — personal attacks and bad faith are.
        </p>
      </LegalSection>

      <LegalSection title="Our content">
        <p>
          Articles, photography and design on EshSpeaks are owned by EshSpeaks Media or licensed to
          us. You're welcome to share links and short excerpts with attribution; republishing full
          articles requires our permission — email{" "}
          <a
            href="mailto:hello@eshspeaks.com"
            className="font-medium text-brand-orange hover:underline"
          >
            hello@eshspeaks.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Corrections">
        <p>
          We get things wrong sometimes. If you spot an error, tell us at{" "}
          <a
            href="mailto:tips@eshspeaks.com"
            className="font-medium text-brand-orange hover:underline"
          >
            tips@eshspeaks.com
          </a>{" "}
          and we'll review and correct the record where warranted.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms as the product changes — new features, subscription billing
          going live, and so on. Meaningful changes will be reflected here with an updated date.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
