import Link from "next/link";

export const metadata = {
  title: "Login",
  description: "Sign in to your ESHSPEAKS account.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
        Account
      </p>
      <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">Welcome back.</h1>
      <p className="mt-4 text-base leading-7 text-text-secondary">
        The auth experience is being wired to the NestJS API contract and will evolve into a full
        sign-in and account flow.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="rounded-md bg-brand-navy px-5 py-3 text-sm font-semibold text-white hover:bg-brand-navy/90"
        >
          Create account
        </Link>
        <Link
          href="/"
          className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-brand-navy hover:border-brand-orange hover:text-brand-orange"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
