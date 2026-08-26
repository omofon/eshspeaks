import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Careers",
  description: "Work at EshSpeaks.",
};

export default function CareersPage() {
  return (
    <LegalPageLayout
      kicker="Careers"
      title="Work at EshSpeaks"
      intro="We're a small newsroom that cares more about the reporting than the org chart."
    >
      <LegalSection title="No open roles listed right now">
        <p>
          We don't have a job board wired up yet, so there's nothing to apply to here directly. That
          doesn't mean we're not hiring — reporters, editors and correspondents with a real beat and
          a track record are always worth a conversation.
        </p>
      </LegalSection>

      <LegalSection title="Reach out anyway">
        <p>
          Send a note and clips (or a portfolio, if you're not a writer) to{" "}
          <a
            href="mailto:careers@eshspeaks.com"
            className="font-medium text-brand-orange hover:underline"
          >
            careers@eshspeaks.com
          </a>
          . Tell us what you cover and why EshSpeaks — generic applications are easy to spot and
          easy to skip.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
