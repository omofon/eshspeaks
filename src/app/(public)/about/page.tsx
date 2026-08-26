import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "About",
  description: "About EshSpeaks — Nigerian journalism, interviews and opinion.",
};

export default function AboutPage() {
  return (
    <LegalPageLayout
      kicker="About"
      title="Reporting Nigeria, on the record"
      intro="EshSpeaks covers Nigerian politics, business, security and public life for readers who need the whole picture, not just the headline."
    >
      <LegalSection title="What we do">
        <p>
          EshSpeaks is an editorial newsroom built around beat reporting, interviews and analysis
          across politics and governance, business and the economy, metro and security, and the
          culture and ideas shaping the country. Our reporters and editors file from Abuja, Lagos
          and beyond, and every story runs through the same editorial process regardless of which
          desk it comes from.
        </p>
      </LegalSection>

      <LegalSection title="How we work">
        <p>
          Stories move through a newsroom, not a spreadsheet: reporters file, section leads and the
          chief editor review, and a story is published only once it clears that process. We
          distinguish reporting from opinion clearly, and we correct the record when we get
          something wrong.
        </p>
      </LegalSection>

      <LegalSection title="Free and Premium">
        <p>
          Most of what we publish is free to read. Premium stories — deeper investigations, extended
          interviews and specialist analysis — are marked as such and available to EshSpeaks
          subscribers. See{" "}
          <a href="/pricing" className="font-medium text-brand-orange hover:underline">
            Premium membership
          </a>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="Get in touch">
        <p>
          Tips, corrections, partnership or advertising enquiries — see{" "}
          <a href="/contact" className="font-medium text-brand-orange hover:underline">
            Contact
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
