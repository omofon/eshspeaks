import Link from "next/link";

export const metadata = {
  title: "Register",
  description:
    "Create an ESHSPEAKS account for subscriptions, newsletters and account preferences.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
        Membership
      </p>
      <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">Join ESHSPEAKS.</h1>
      <p className="mt-4 text-base leading-7 text-text-secondary">
        This route establishes the public onboarding entry point ahead of the full authentication
        integration.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-md bg-brand-navy px-5 py-3 text-sm font-semibold text-white hover:bg-brand-navy/90"
        >
          Sign in
        </Link>
        <Link
          href="/pricing"
          className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-brand-navy hover:border-brand-orange hover:text-brand-orange"
        >
          View pricing
        </Link>
      </div>
    </div>
  );
}
