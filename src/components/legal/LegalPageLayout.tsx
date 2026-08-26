import type { ReactNode } from "react";

export function LegalPageLayout({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-eshspeaks max-w-3xl py-10 sm:py-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
        {kicker}
      </p>
      <h1 className="mt-3 font-serif text-4xl text-brand-navy sm:text-5xl">{title}</h1>
      {intro ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{intro}</p>
      ) : null}
      <div className="legal-prose mt-10 space-y-8 border-t border-rule pt-10">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl text-brand-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-7 text-text-secondary">{children}</div>
    </section>
  );
}
