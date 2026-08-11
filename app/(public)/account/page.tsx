import Link from "next/link";

export const metadata = {
  title: "Account",
  description: "Account overview for members, subscriptions and newsletter preferences.",
};

export default function AccountPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-border bg-card p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
          Account
        </p>
        <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">
          Your newsroom dashboard
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          The account experience now has a stable route shell for future subscriptions, preferences
          and newsletter controls.
        </p>
      </section>
      <aside className="rounded-lg border border-border bg-background-soft p-6">
        <h2 className="font-serif text-2xl text-brand-navy">Quick links</h2>
        <ul className="mt-4 space-y-3 text-sm text-text-secondary">
          <li>
            <Link href="/pricing" className="font-medium text-brand-orange hover:underline">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/search" className="font-medium text-brand-orange hover:underline">
              Search
            </Link>
          </li>
          <li>
            <Link href="/login" className="font-medium text-brand-orange hover:underline">
              Sign in
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
}
