import Link from "next/link";

export const metadata = {
  title: "Pricing",
  description: "Membership options for premium reporting and newsroom access.",
};

export default function PricingPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-lg border border-border bg-card p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          Membership
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">
          Support the newsroom.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
          Premium access unlocks deeper reporting, exclusive analysis and wider access to the
          editorial archive.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background-soft p-6">
            <h2 className="font-serif text-2xl text-brand-navy">Free</h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Core reporting and public coverage.
            </p>
          </div>
          <div className="rounded-lg border border-brand-orange/25 bg-brand-orange-soft p-6">
            <h2 className="font-serif text-2xl text-brand-navy">Premium</h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Full access to the newsroom’s deep reporting and analysis.
            </p>
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-border bg-background-soft p-8">
        <h2 className="font-serif text-2xl text-brand-navy">Why subscribe?</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-text-secondary">
          <li>• Reporting grounded in public accountability</li>
          <li>• Context-rich analysis for markets and politics</li>
          <li>• Early access to premium features and interviews</li>
        </ul>
        <Link
          href="/login?mode=register"
          className="mt-8 inline-flex rounded-md bg-brand-navy px-5 py-3 text-sm font-semibold text-white hover:bg-brand-navy/90"
        >
          Create account
        </Link>
      </aside>
    </div>
  );
}
