import Link from "next/link";
import { ALL_DESKS } from "@/lib/data/desks";
import { NotifyMeForm } from "@/components/NotifyMeForm";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s } = await searchParams;
  const name = s || "This section";
  return { title: `${name} — Coming Soon` };
}

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s } = await searchParams;
  const name = s || "This section";
  const match = ALL_DESKS.find((d) => d.label === name);
  const color = match?.color ?? "var(--purple)";

  return (
    <div className="container-colouresh py-14 sm:py-20">
      <div className="mx-auto max-w-[560px] text-center">
        <div
          className="mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-2xl"
          style={{ background: color }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
        </div>
        <span className="chip">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
          Coming soon
        </span>
        <h1 className="mt-3.5 font-serif text-[28px] font-semibold text-ink">
          {name} is being built.
        </h1>
        <p className="mx-auto mt-3.5 max-w-[420px] text-sm text-ink-soft">
          This desk isn&rsquo;t live yet, but it&rsquo;s next up in the newsroom. Leave your email
          and we&rsquo;ll tell you the day it opens.
        </p>
        <NotifyMeForm />
        <div className="mt-7">
          <Link href="/" className="btn-ghost">
            Back to the Front Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
