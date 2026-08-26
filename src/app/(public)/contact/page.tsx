import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the EshSpeaks newsroom.",
};

const CHANNELS = [
  {
    label: "News tips & corrections",
    email: "tips@eshspeaks.com",
    note: "Send documents, story leads or a correction request directly to the desk.",
  },
  {
    label: "Advertising & partnerships",
    email: "advertise@eshspeaks.com",
    note: "Media kits, sponsorship and partnership enquiries.",
  },
  {
    label: "Careers",
    email: "careers@eshspeaks.com",
    note: "General enquiries about joining the newsroom.",
  },
  {
    label: "Everything else",
    email: "hello@eshspeaks.com",
    note: "Reader questions, subscriptions, feedback on the site.",
  },
];

export default function ContactPage() {
  return (
    <LegalPageLayout
      kicker="Contact"
      title="Get in touch"
      intro="Route your message to the right desk and it'll get to a real person faster."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <div key={c.email} className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-serif text-xl text-brand-navy">{c.label}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{c.note}</p>
            <a
              href={`mailto:${c.email}`}
              className="mt-3 inline-block text-sm font-medium text-brand-orange hover:underline"
            >
              {c.email}
            </a>
          </div>
        ))}
      </div>
    </LegalPageLayout>
  );
}
